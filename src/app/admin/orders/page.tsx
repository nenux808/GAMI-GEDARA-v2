import AdminHeader from "@/components/admin/admin-header";
import OrderCard from "@/components/admin/order-card";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Order } from "@/types/order";

export default async function AdminOrdersPage() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      subtotal,
      delivery_fee,
      total_amount,
      currency,
      payment_method,
      payment_status,
      verification_status,
      fulfilment_status,
      pickup_time,
      verification_token,
      verification_expires_at,
      verified_at,
      risk_flag,
      no_show_flag,
      counter_paid_at,
      active_for_kitchen,
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      created_at,
      order_items (
        id,
        order_id,
        product_id,
        product_name,
        unit_price,
        quantity,
        line_total
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load admin orders:", error.message);
  }

  const orders = (data ?? []) as Order[];

  const totalOrders = orders.length;

  const paidOrders = orders.filter(
    (order) =>
      order.payment_status === "paid" ||
      order.payment_status === "paid_counter"
  ).length;

  const pendingVerificationOrders = orders.filter(
    (order) => order.fulfilment_status === "pending_verification"
  ).length;

  const awaitingCounterPaymentOrders = orders.filter(
    (order) =>
      order.payment_method === "counter" &&
      order.fulfilment_status === "awaiting_counter_payment"
  ).length;

  const activeKitchenOrders = orders.filter(
    (order) => order.active_for_kitchen
  ).length;

  const totalRevenue = orders
    .filter(
      (order) =>
        order.payment_status === "paid" ||
        order.payment_status === "paid_counter"
    )
    .reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <>
      <AdminHeader />

      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            <p className="mt-2 text-slate-600">
              View customer details, payment status, verification state, and
              order contents.
            </p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalOrders}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Paid Orders</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {paidOrders}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Pending Verification</p>
              <p className="mt-2 text-3xl font-bold text-amber-700">
                {pendingVerificationOrders}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Awaiting Counter Payment</p>
              <p className="mt-2 text-3xl font-bold text-orange-700">
                {awaitingCounterPaymentOrders}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Active for Kitchen</p>
              <p className="mt-2 text-3xl font-bold text-blue-700">
                {activeKitchenOrders}
              </p>
            </div>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-1 xl:grid-cols-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No orders found yet.
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}