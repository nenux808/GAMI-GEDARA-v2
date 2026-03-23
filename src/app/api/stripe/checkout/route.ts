import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendCounterOrderVerificationEmail } from "@/lib/notifications/email";

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

type CustomerDetails = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
};

type CheckoutBody = {
  items: CartItem[];
  customer: CustomerDetails;
  paymentMethod?: "online" | "counter";
  pickupTime?: string | null;
};

function normalizeDateTime(value: string | null) {
  if (!value) return "";
  return value.replace(" ", "T").slice(0, 19);
}

function getMelbourneNowComparable() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

function getVerificationExpiryDate(minutes = 15) {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + minutes);
  return expires;
}

function isValidFuturePickupTime(value: string | null | undefined) {
  if (!value) return false;

  const pickup = new Date(value);
  if (Number.isNaN(pickup.getTime())) return false;

  return pickup.getTime() > Date.now();
}

async function validateMealPackAvailability(items: CartItem[]) {
  const mealPackItems = items.filter(
    (item) => item.type === "meal_pack" && item.meal_pack_menu_id
  );

  if (mealPackItems.length === 0) return null;

  const uniqueMealPackIds = [
    ...new Set(mealPackItems.map((i) => i.meal_pack_menu_id!)),
  ];

  const { data: menus, error: menuError } = await supabaseAdmin
    .from("meal_pack_menus")
    .select("id, title, available_from, order_cutoff_at, is_active")
    .in("id", uniqueMealPackIds);

  if (menuError) {
    console.error("Meal pack validation error:", menuError);
    return NextResponse.json(
      { error: "Failed to validate meal pack availability" },
      { status: 500 }
    );
  }

  const nowComparable = getMelbourneNowComparable();

  for (const mealPackId of uniqueMealPackIds) {
    const menu = menus?.find((m) => m.id === mealPackId);

    if (!menu || !menu.is_active) {
      return NextResponse.json(
        { error: "Selected meal pack is not available" },
        { status: 400 }
      );
    }

    const availableFrom = normalizeDateTime(menu.available_from);
    const cutoffAt = normalizeDateTime(menu.order_cutoff_at);

    if (nowComparable < availableFrom) {
      return NextResponse.json(
        { error: `${menu.title} is not open for ordering yet` },
        { status: 400 }
      );
    }

    if (nowComparable >= cutoffAt) {
      return NextResponse.json(
        { error: `${menu.title} ordering has closed` },
        { status: 400 }
      );
    }
  }

  return null;
}

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
      console.error("Order item insert error:", itemError);
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
        console.error("Order item selections insert error:", selectionError);
        throw new Error("Failed to save meal pack selections");
      }
    }
  }
}

export async function POST(req: Request) {
  try {
    const body: CheckoutBody = await req.json();
    const items = body.items;
    const customer = body.customer;
    const paymentMethod = body.paymentMethod ?? "online";
    const pickupTime = body.pickupTime ?? null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: "Missing customer details" },
        { status: 400 }
      );
    }

    if (paymentMethod !== "online" && paymentMethod !== "counter") {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    if (paymentMethod === "counter" && !isValidFuturePickupTime(pickupTime)) {
      return NextResponse.json(
        { error: "Please select a valid future pickup time" },
        { status: 400 }
      );
    }

    const mealPackValidationResponse = await validateMealPackAvailability(items);
    if (mealPackValidationResponse) {
      return mealPackValidationResponse;
    }

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    if (paymentMethod === "counter") {
      const { data: existingCounterOrder, error: existingCounterOrderError } =
        await supabaseAdmin
          .from("orders")
          .select("id, order_number, fulfilment_status")
          .eq("payment_method", "counter")
          .eq("payment_status", "unpaid")
          .or(
            `customer_email.eq.${customer.email},customer_phone.eq.${customer.phone}`
          )
          .in("fulfilment_status", [
            "pending_verification",
            "awaiting_counter_payment",
            "preparing",
            "ready_for_pickup",
          ])
          .limit(1)
          .maybeSingle();

      if (existingCounterOrderError) {
        console.error(
          "Existing counter order lookup error:",
          existingCounterOrderError
        );
        return NextResponse.json(
          { error: "Failed to validate existing counter orders" },
          { status: 500 }
        );
      }

      if (existingCounterOrder) {
        return NextResponse.json(
          {
            error:
              "You already have an active unpaid counter order. Please complete or cancel it before placing another one.",
          },
          { status: 400 }
        );
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpiresAt = getVerificationExpiryDate(15);
      const siteUrl = getSiteUrl();
      const verificationUrl = `${siteUrl}/checkout/verify?token=${verificationToken}`;

      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          delivery_address: customer.address || "",
          subtotal,
          delivery_fee: 0,
          total_amount: subtotal,
          currency: "aud",
          payment_method: "counter",
          payment_status: "unpaid",
          verification_status: "pending",
          fulfilment_status: "pending_verification",
          pickup_time: pickupTime,
          verification_token: verificationToken,
          verification_expires_at: verificationExpiresAt.toISOString(),
          active_for_kitchen: false,
        })
        .select("id, order_number")
        .single();

      if (orderError || !order) {
        console.error("Counter order insert error:", orderError);
        return NextResponse.json(
          { error: "Failed to create counter order" },
          { status: 500 }
        );
      }

      try {
        await insertOrderItems(order.id, items);
      } catch (insertError) {
        console.error("Counter order item save error:", insertError);

        await supabaseAdmin.from("orders").delete().eq("id", order.id);

        return NextResponse.json(
          { error: "Failed to save order items" },
          { status: 500 }
        );
      }

      try {
        await sendCounterOrderVerificationEmail({
          customerName: customer.name,
          customerEmail: customer.email,
          orderNumber: Number(order.order_number ?? 0),
          totalAmount: subtotal,
          pickupTime: pickupTime!,
          verificationUrl,
          items: items.map((item) => ({
            name:
              item.type === "meal_pack" && item.selections?.length
                ? `${item.name} (${item.selections.join(", ")})`
                : item.name,
            quantity: item.quantity,
            lineTotal: Number(item.price) * item.quantity,
          })),
        });
      } catch (emailError) {
        console.error("Counter verification email error:", emailError);

        return NextResponse.json(
          {
            error:
              "Order was created, but the verification email could not be sent.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        paymentMethod: "counter",
        requiresVerification: true,
        message:
          "Your order has been created. Please check your email to confirm it.",
        orderId: order.id,
        orderNumber: order.order_number,
      });
    }

    const siteUrl = getSiteUrl();

    const { data: draft, error: draftError } = await supabaseAdmin
      .from("checkout_drafts")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        delivery_address: customer.address || "",
        notes: customer.notes || "",
        items_json: items,
        subtotal,
        currency: "aud",
      })
      .select("id")
      .single();

    if (draftError || !draft) {
      console.error("Checkout draft insert error:", draftError);
      return NextResponse.json(
        { error: "Failed to prepare checkout" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "aud",
          product_data: {
            name:
              item.type === "meal_pack" && item.selections?.length
                ? `${item.name} (${item.selections.join(", ")})`
                : item.name,
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      customer_email: customer.email,
      metadata: {
        draft_id: String(draft.id),
        payment_method: "online",
      },
    });

    return NextResponse.json({
      success: true,
      paymentMethod: "online",
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}