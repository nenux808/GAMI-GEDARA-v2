import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        verification_status: "expired",
        fulfilment_status: "expired",
        active_for_kitchen: false,
      })
      .eq("payment_method", "counter")
      .eq("verification_status", "pending")
      .eq("fulfilment_status", "pending_verification")
      .lt("verification_expires_at", new Date().toISOString())
      .select("id");

    if (error) {
      console.error("Failed to expire counter orders:", error);
      return NextResponse.json(
        { error: "Failed to expire counter orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expiredCount: data?.length ?? 0,
    });
  } catch (error) {
    console.error("expire-counter-orders route error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}