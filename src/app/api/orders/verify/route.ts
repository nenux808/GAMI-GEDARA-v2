import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/checkout/verify?status=missing-token", url.origin)
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, verification_status, verification_expires_at, fulfilment_status"
      )
      .eq("verification_token", token)
      .maybeSingle();

    if (error) {
      console.error("Verification lookup error:", error);
      return NextResponse.redirect(
        new URL("/checkout/verify?status=lookup-error", url.origin)
      );
    }

    if (!order) {
      return NextResponse.redirect(
        new URL("/checkout/verify?status=invalid", url.origin)
      );
    }

    if (order.verification_status === "verified") {
      return NextResponse.redirect(
        new URL(
          `/checkout/verify?status=already-verified&order=${order.order_number ?? ""}`,
          url.origin
        )
      );
    }

    if (order.fulfilment_status !== "pending_verification") {
      return NextResponse.redirect(
        new URL(
          `/checkout/verify?status=invalid-state&order=${order.order_number ?? ""}`,
          url.origin
        )
      );
    }

    if (
      order.verification_expires_at &&
      new Date(order.verification_expires_at).getTime() < Date.now()
    ) {
      await supabaseAdmin
        .from("orders")
        .update({
          verification_status: "expired",
          fulfilment_status: "expired",
          active_for_kitchen: false,
        })
        .eq("id", order.id);

      return NextResponse.redirect(
        new URL(
          `/checkout/verify?status=expired&order=${order.order_number ?? ""}`,
          url.origin
        )
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        fulfilment_status: "awaiting_counter_payment",
        active_for_kitchen: true,
        verification_token: null,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Verification update error:", updateError);
      return NextResponse.redirect(
        new URL(
          `/checkout/verify?status=update-error&order=${order.order_number ?? ""}`,
          url.origin
        )
      );
    }

    return NextResponse.redirect(
      new URL(
        `/checkout/verify?status=success&order=${order.order_number ?? ""}`,
        url.origin
      )
    );
  } catch (error) {
    console.error("Order verification error:", error);
    const fallbackUrl = new URL(req.url);

    return NextResponse.redirect(
      new URL("/checkout/verify?status=server-error", fallbackUrl.origin)
    );
  }
}