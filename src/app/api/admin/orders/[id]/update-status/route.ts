import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { FulfilmentStatus } from "@/types/order";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateStatusBody = {
  fulfilmentStatus: FulfilmentStatus;
};

const ALLOWED_STATUSES: FulfilmentStatus[] = [
  "new",
  "pending_verification",
  "awaiting_counter_payment",
  "preparing",
  "ready_for_pickup",
  "dispatched",
  "completed",
  "cancelled",
  "expired",
  "no_show",
];

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateStatusBody;
    const fulfilmentStatus = body.fulfilmentStatus;

    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    if (!fulfilmentStatus || !ALLOWED_STATUSES.includes(fulfilmentStatus)) {
      return NextResponse.json(
        { error: "Invalid fulfilment status" },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, fulfilment_status, payment_method, verification_status")
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

    if (
      order.payment_method === "counter" &&
      order.verification_status !== "verified" &&
      fulfilmentStatus !== "pending_verification" &&
      fulfilmentStatus !== "expired" &&
      fulfilmentStatus !== "cancelled"
    ) {
      return NextResponse.json(
        { error: "Counter order must be verified before changing to that status" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      fulfilment_status: fulfilmentStatus,
    };

    if (
      fulfilmentStatus === "completed" ||
      fulfilmentStatus === "cancelled" ||
      fulfilmentStatus === "expired" ||
      fulfilmentStatus === "no_show"
    ) {
      updatePayload.active_for_kitchen = false;
    }

    if (
      fulfilmentStatus === "awaiting_counter_payment" ||
      fulfilmentStatus === "preparing" ||
      fulfilmentStatus === "ready_for_pickup" ||
      fulfilmentStatus === "new"
    ) {
      updatePayload.active_for_kitchen = true;
    }

    if (fulfilmentStatus === "no_show") {
      updatePayload.no_show_flag = true;
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update fulfilment status:", updateError);
      return NextResponse.json(
        { error: "Failed to update fulfilment status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("update-status route error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}