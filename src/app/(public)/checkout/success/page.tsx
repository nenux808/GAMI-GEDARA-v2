import Link from "next/link";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import ClearCartOnSuccess from "@/components/checkout/clear-cart-on-success";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

function formatOrderNumber(orderNumber: number | string | null | undefined) {
  if (!orderNumber) return null;
  return `GAMI-ORDER-${String(orderNumber).padStart(5, "0")}`;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let customOrderNumber: string | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const orderId = session.metadata?.order_id ?? null;

      if (orderId) {
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("order_number")
          .eq("id", orderId)
          .maybeSingle();

        customOrderNumber = formatOrderNumber(order?.order_number);
      }
    } catch (error) {
      console.error("Failed to load custom order number:", error);
    }
  }

  return (
    <>
      <SiteHeader />

      <div className="flex min-h-screen flex-col bg-[#fffaf3] text-slate-900">
        <main className="flex-1 px-4 py-14 sm:px-6 sm:py-16">
          <ClearCartOnSuccess />

          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="inline-flex rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
                Payment Successful
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Thank you for your order
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Your payment has been received successfully. We’ve started
                processing your order and a confirmation email will be sent
                shortly.
              </p>

              {customOrderNumber ? (
                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Order Number
                  </p>
                  <p className="mt-1 break-all text-lg font-bold text-slate-900">
                    {customOrderNumber}
                  </p>
                </div>
              ) : null}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/menu"
                  className="flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Continue Ordering
                </Link>

                <Link
                  href="/meal-packs"
                  className="flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  View Meal Packs
                </Link>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/"
                  className="flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Back to Home
                </Link>

                <Link
                  href="/contact"
                  className="flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Contact Restaurant
                </Link>
              </div>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}