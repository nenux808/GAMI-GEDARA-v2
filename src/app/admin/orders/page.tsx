import OrderCard from "@/components/admin/order-card";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Order, FulfilmentStatus, PaymentMethod } from "@/types/order";

type SearchParams = Promise<{
  q?: string;
  start?: string;
  end?: string;
  paymentMethod?: string;
  fulfilmentStatus?: string;
}>;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDateRange(start?: string, end?: string) {
  const today = new Date();
  const defaultEnd = formatDate(today);

  const defaultStartDate = new Date(today);
  defaultStartDate.setDate(defaultStartDate.getDate() - 7);
  const defaultStart = formatDate(defaultStartDate);

  const startDate = start || defaultStart;
  const endDate = end || defaultEnd;

  const startIso = `${startDate}T00:00:00`;
  const endExclusiveDate = new Date(`${endDate}T00:00:00`);
  endExclusiveDate.setDate(endExclusiveDate.getDate() + 1);
  const endIso = endExclusiveDate.toISOString().slice(0, 19);

  return {
    startDate,
    endDate,
    startIso,
    endIso,
  };
}

const paymentMethodOptions: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Payment Methods" },
  { value: "online", label: "Online" },
  { value: "counter", label: "Counter" },
];

const fulfilmentStatusOptions: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active Orders" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "awaiting_counter_payment", label: "Awaiting Counter Payment" },
  { value: "new", label: "New" },
  { value: "preparing", label: "Preparing" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
  { value: "no_show", label: "No Show" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const searchQuery = params.q?.trim() || "";
  const selectedPaymentMethod = params.paymentMethod || "all";
  const selectedFulfilmentStatus = params.fulfilmentStatus || "all";

  const { startDate, endDate, startIso, endIso } = buildDateRange(
    params.start,
    params.end
  );

  let query = supabaseAdmin
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
    .gte("created_at", startIso)
    .lt("created_at", endIso)
    .order("created_at", { ascending: false });

  if (
    selectedPaymentMethod === "online" ||
    selectedPaymentMethod === "counter"
  ) {
    query = query.eq("payment_method", selectedPaymentMethod as PaymentMethod);
  }

  if (selectedFulfilmentStatus === "active") {
    query = query.in("fulfilment_status", [
      "new",
      "awaiting_counter_payment",
      "preparing",
      "ready_for_pickup",
    ]);
  } else if (
    [
      "pending_verification",
      "awaiting_counter_payment",
      "new",
      "preparing",
      "ready_for_pickup",
      "completed",
      "cancelled",
      "expired",
      "no_show",
    ].includes(selectedFulfilmentStatus)
  ) {
    query = query.eq(
      "fulfilment_status",
      selectedFulfilmentStatus as FulfilmentStatus
    );
  }

  if (searchQuery) {
    const escaped = searchQuery.replace(/,/g, " ");
    const possibleOrderNumber = Number(searchQuery);

    if (!Number.isNaN(possibleOrderNumber) && /^\d+$/.test(searchQuery)) {
      query = query.or(
        `customer_name.ilike.%${escaped}%,customer_email.ilike.%${escaped}%,customer_phone.ilike.%${escaped}%,order_number.eq.${possibleOrderNumber}`
      );
    } else {
      query = query.or(
        `customer_name.ilike.%${escaped}%,customer_email.ilike.%${escaped}%,customer_phone.ilike.%${escaped}%`
      );
    }
  }

  const { data, error } = await query;

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
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <p className="mt-2 text-slate-600">
            View customer details, payment status, verification state, and
            order contents.
          </p>
        </div>

        <form
          method="GET"
          className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Search
              </label>
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Name, phone, email, or order number"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Start Date
              </label>
              <input
                type="date"
                name="start"
                defaultValue={startDate}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                End Date
              </label>
              <input
                type="date"
                name="end"
                defaultValue={endDate}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Apply Filters
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                defaultValue={selectedPaymentMethod}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              >
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Fulfilment Status
              </label>
              <select
                name="fulfilmentStatus"
                defaultValue={selectedFulfilmentStatus}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              >
                {fulfilmentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <a
                href="/admin/orders"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </a>
            </div>
          </div>
        </form>

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

        <div className="mb-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Revenue</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No orders found for the selected filters.
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
  );
}
