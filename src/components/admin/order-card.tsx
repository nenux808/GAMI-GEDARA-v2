import type { Order } from "@/types/order";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentBadgeClass(status: Order["payment_status"]) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "failed":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getFulfilmentBadgeClass(status: Order["fulfilment_status"]) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "preparing":
      return "bg-amber-100 text-amber-800";
    case "dispatched":
      return "bg-purple-100 text-purple-700";
    case "completed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function OrderCard({ order }: { order: Order }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Order #{order.id.slice(0, 8)}
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentBadgeClass(
                order.payment_status
              )}`}
            >
              Payment: {order.payment_status}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getFulfilmentBadgeClass(
                order.fulfilment_status
              )}`}
            >
              Fulfilment: {order.fulfilment_status}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Placed on {formatDateTime(order.created_at)}
          </p>
        </div>

        <div className="text-left lg:text-right">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-900">
            ${Number(order.total_amount).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Customer</p>
          <p className="mt-1 font-semibold text-slate-900">
            {order.customer_name}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Email</p>
          <p className="mt-1 break-words font-semibold text-slate-900">
            {order.customer_email}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Phone</p>
          <p className="mt-1 font-semibold text-slate-900">
            {order.customer_phone || "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Address</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {order.delivery_address || "—"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Order Items
        </h3>

        {order.order_items?.length ? (
          <div className="mt-3 space-y-3">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.product_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      ${Number(item.unit_price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-slate-900">
                    ${Number(item.line_total).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No items found for this order.
          </div>
        )}
      </div>
    </div>
  );
}