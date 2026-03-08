import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  sendCustomerOrderEmail,
  sendOrganizerOrderEmail,
} from "@/lib/notifications/email";

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

  console.log("Webhook event received:", event.type);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Checkout session completed:", session.id);
      console.log("Full metadata:", session.metadata);

      let orderId = session.metadata?.order_id ?? null;

      if (!orderId) {
        console.warn("No order_id in metadata, trying fallback by session id");

        const { data: fallbackOrder, error: fallbackError } = await supabaseAdmin
          .from("orders")
          .select("id")
          .eq("stripe_checkout_session_id", session.id)
          .maybeSingle();

        if (fallbackError) {
          console.error("Fallback lookup failed:", fallbackError);
        }

        orderId = fallbackOrder?.id ?? null;
      }

      console.log("Resolved order ID:", orderId);

      if (!orderId) {
        console.warn("Could not resolve order ID for session:", session.id);
        return new Response("OK", { status: 200 });
      }

      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
        })
        .eq("id", orderId);

      if (error) {
        console.error("Failed to mark order as paid:", error);
        return new Response("Database update failed", { status: 500 });
      }

      console.log("Order marked as paid:", orderId);

      const { data: orderData, error: orderFetchError } = await supabaseAdmin
        .from("orders")
        .select(`
          id,
          order_number,
          customer_name,
          customer_email,
          total_amount,
          order_items (
            product_name,
            quantity,
            line_total
          )
        `)
        .eq("id", orderId)
        .single();

      if (orderFetchError || !orderData) {
        console.error("Failed to load order for email:", orderFetchError);
      } else {
        const items =
          orderData.order_items?.map(
            (item: {
              product_name: string;
              quantity: number;
              line_total: number;
            }) => ({
              name: item.product_name,
              quantity: item.quantity,
              lineTotal: item.line_total,
            })
          ) ?? [];

        const orderNumber = Number(orderData.order_number);

        if (!orderNumber) {
          console.error("Missing order_number for order:", orderData.id);
        } else {
          try {
            await sendCustomerOrderEmail({
              customerName: orderData.customer_name,
              customerEmail: orderData.customer_email,
              orderNumber,
              totalAmount: Number(orderData.total_amount),
              items,
            });
            console.log("Customer order email sent:", orderData.customer_email);
          } catch (emailError) {
            console.error("Customer email failed:", emailError);
          }

          try {
            await sendOrganizerOrderEmail({
              customerName: orderData.customer_name,
              customerEmail: orderData.customer_email,
              orderNumber,
              totalAmount: Number(orderData.total_amount),
              items,
            });
            console.log("Organizer order email sent");
          } catch (organizerEmailError) {
            console.error("Organizer email failed:", organizerEmailError);
          }
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;

      let orderId = session.metadata?.order_id ?? null;

      if (!orderId) {
        const { data: fallbackOrder } = await supabaseAdmin
          .from("orders")
          .select("id")
          .eq("stripe_checkout_session_id", session.id)
          .maybeSingle();

        orderId = fallbackOrder?.id ?? null;
      }

      if (orderId) {
        const { error } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "cancelled",
          })
          .eq("id", orderId);

        if (error) {
          console.error("Failed to mark order as cancelled:", error);
        } else {
          console.log("Order marked as cancelled:", orderId);
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response("Webhook handler failed", { status: 500 });
  }
}