import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: CartItem[] = body.items;
    const customer: CustomerDetails = body.customer;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: "Missing customer details" },
        { status: 400 }
      );
    }

    const mealPackItems = items.filter(
      (item) => item.type === "meal_pack" && item.meal_pack_menu_id
    );

    if (mealPackItems.length > 0) {
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

      const now = new Date();

      for (const mealPackId of uniqueMealPackIds) {
        const menu = menus?.find((m) => m.id === mealPackId);

        if (!menu || !menu.is_active) {
          return NextResponse.json(
            { error: "Selected meal pack is not available" },
            { status: 400 }
          );
        }

        const availableFrom = new Date(menu.available_from);
        const cutoffAt = new Date(menu.order_cutoff_at);

        if (now < availableFrom) {
          return NextResponse.json(
            { error: `${menu.title} is not open for ordering yet` },
            { status: 400 }
          );
        }

        if (now >= cutoffAt) {
          return NextResponse.json(
            { error: `${menu.title} ordering has closed` },
            { status: 400 }
          );
        }
      }
    }

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

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
        payment_status: "pending",
        fulfilment_status: "new",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    console.log("Created order ID:", order.id);

    const orderItemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: null,
      product_name:
        item.type === "meal_pack" && item.selections?.length
          ? `${item.name} | ${item.selections.join(", ")}`
          : item.name,
      unit_price: Number(item.price),
      quantity: item.quantity,
      line_total: Number(item.price) * item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json(
        { error: "Failed to save order items" },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

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
      cancel_url: `${siteUrl}/checkout/cancel?order_id=${order.id}`,
      customer_email: customer.email,
      metadata: {
        order_id: String(order.id),
        customer_name: customer.name,
        customer_phone: customer.phone,
        delivery_address: customer.address || "",
        notes: customer.notes || "",
      },
    });

    console.log("Stripe session created:", session.id);
    console.log("Stripe session metadata:", session.metadata);

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Order session update error:", updateError);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}