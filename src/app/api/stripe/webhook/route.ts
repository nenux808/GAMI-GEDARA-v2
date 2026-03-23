import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  sendCustomerOrderEmail,
  sendOrganizerOrderEmail,
} from "@/lib/notifications/email";

type CartItem = {
  id: string;
  type: "regular" | "meal_pack";
  name: string;
  slug?: string;
  price: number;
  quantity: number;
  selections?: string[];
  meal_pack_menu_id?: string;
};

async function insertOrderItems(orderId: string, items: CartItem[]) {
  for (const item of items) {
    const productName =
      item.type === "meal_pack" && item.selections?.length
        ? `${item.name} | ${item.selections.join(", ")}`
        : item.name;

    const { data: insertedItem, error: itemError } = await supabaseAdmin
      .from("order_items")
      .insert({
        order_id: orderId,
        product_id: null,
        product_name: productName,
        unit_price: Number(item.price),
        quantity: item.quantity,
        line_total: Number(item.price) * item.quantity,
      })
      .select("id")
      .single();

    if (itemError || !insertedItem) {
      console.error("Webhook order item insert error:", itemError);
      throw new Error("Failed to save order items");
    }

    if (item.type === "meal_pack" && item.selections?.length) {
      const selectionCounts = item.selections.reduce<Record<string, number>>(
        (acc, selection) => {
          acc[selection] = (acc[selection] ?? 0) + item.quantity;
          return acc;
        },
        {}
      );

      const selectionRows = Object.entries(selectionCounts).map(
        ([optionName, quantity]) => ({
          order_id: orderId,
          order_item_id: insertedItem.id,
          meal_pack_menu_id: item.meal_pack_menu_id ?? null,
          option_name: optionName,
          quantity,
        })
      );

      const { error: selectionError } = await supabaseAdmin
        .from("order_item_selections")
        .insert(selectionRows);

      if (selectionError) {
        console.error("Webhook selections insert error:", selectionError);
        throw new Error("Failed to save meal pack selections");
      }
    }
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return new Response("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const draftId = session.metadata?.draft_id ?? null;

      if (!draftId) {
        console.warn("No draft_id in checkout.session.completed metadata");
        return new Response("OK", { status: 200 });
      }

      const { data: existingOrder, error: existingOrderError } =
        await supabaseAdmin
          .from("orders")
          .select("id")
          .eq("stripe_checkout_session_id", session.id)
          .maybeSingle();

      if (existingOrderError) {
        console.error("Existing order lookup failed:", existingOrderError);
        return new Response("Database lookup failed", { status: 500 });
      }

      if (existingOrder) {
        return new Response("OK", { status: 200 });
      }

      const { data: draft, error: draftError } = await supabaseAdmin
        .from("checkout_drafts")
        .select("*")
        .eq("id", draftId)
        .maybeSingle();

      if (draftError || !draft) {
        console.error("Draft lookup failed:", draftError);
        return new Response("Draft lookup failed", { status: 500 });
      }

      const items = (draft.items_json ?? []) as CartItem[];

      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          customer_name: draft.customer_name,
          customer_email: draft.customer_email,
          customer_phone: draft.customer_phone,
          delivery_address: draft.delivery_address || "",
          subtotal: Number(draft.subtotal),
          delivery_fee: 0,
          total_amount: Number(draft.subtotal),
          currency: draft.currency || "aud",
          payment_method: "online",
          payment_status: "paid",
          verification_status: "not_required",
          fulfilment_status: "new",
          active_for_kitchen: true,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
        })
        .select("id, order_number")
        .single();

      if (orderError || !order) {
        console.error("Webhook order insert failed:", orderError);
        return new Response("Order insert failed", { status: 500 });
      }

      try {
        await insertOrderItems(order.id, items);
      } catch (insertError) {
        console.error("Webhook order items failed:", insertError);
        return new Response("Order items failed", { status: 500 });
      }

      const emailItems =
        items.map((item) => ({
          name:
            item.type === "meal_pack" && item.selections?.length
              ? `${item.name} (${item.selections.join(", ")})`
              : item.name,
          quantity: item.quantity,
          lineTotal: Number(item.price) * item.quantity,
        })) ?? [];

      try {
        await sendCustomerOrderEmail({
          customerName: draft.customer_name,
          customerEmail: draft.customer_email,
          orderNumber: Number(order.order_number),
          totalAmount: Number(draft.subtotal),
          items: emailItems,
        });
      } catch (emailError) {
        console.error("Customer email failed:", emailError);
      }

      try {
        await sendOrganizerOrderEmail({
          customerName: draft.customer_name,
          customerEmail: draft.customer_email,
          orderNumber: Number(order.order_number),
          totalAmount: Number(draft.subtotal),
          items: emailItems,
        });
      } catch (organizerEmailError) {
        console.error("Organizer email failed:", organizerEmailError);
      }

      await supabaseAdmin.from("checkout_drafts").delete().eq("id", draftId);
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const draftId = session.metadata?.draft_id ?? null;

      if (draftId) {
        await supabaseAdmin.from("checkout_drafts").delete().eq("id", draftId);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response("Webhook handler failed", { status: 500 });
  }
}