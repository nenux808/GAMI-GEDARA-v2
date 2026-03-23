import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, payment_method, payment_status")
      .eq("id", id)
      .maybeSingle();

    if (orderError) {
      console.error("Failed to load order:", orderError);
      return NextResponse.json(
        { error: "Failed to load order" },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_method !== "counter") {
      return NextResponse.json(
        { error: "Only counter orders can be marked as paid at counter" },
        { status: 400 }
      );
    }

    if (order.payment_status === "paid_counter") {
      return NextResponse.json({
        success: true,
        message: "Order is already marked as paid at counter",
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid_counter",
        counter_paid_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to mark counter payment:", updateError);
      return NextResponse.json(
        { error: "Failed to mark counter payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Counter payment marked successfully",
    });
  } catch (error) {
    console.error("mark-counter-paid route error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}