"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FulfilmentStatus, Order } from "@/types/order";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatOrderNumber(orderNumber: number | string | null | undefined) {
  if (orderNumber === null || orderNumber === undefined || orderNumber === "") {
    return "GAMI-ORDER-00000";
  }

  const cleaned = String(orderNumber).replace(/\D/g, "");

  if (!cleaned) return "GAMI-ORDER-00000";

  return `GAMI-ORDER-${cleaned.padStart(5, "0")}`;
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

function getPaymentBadgeClass(status: Order["payment_status"]) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "paid_counter":
      return "bg-emerald-100 text-emerald-700";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "unpaid":
      return "bg-orange-100 text-orange-800";
    case "failed":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-slate-200 text-slate-700";
    case "refunded":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getFulfilmentBadgeClass(status: Order["fulfilment_status"]) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "pending_verification":
      return "bg-amber-100 text-amber-800";
    case "awaiting_counter_payment":
      return "bg-orange-100 text-orange-800";
    case "preparing":
      return "bg-yellow-100 text-yellow-800";
    case "ready_for_pickup":
      return "bg-cyan-100 text-cyan-700";
    case "dispatched":
      return "bg-purple-100 text-purple-700";
    case "completed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-slate-200 text-slate-700";
    case "expired":
      return "bg-rose-100 text-rose-700";
    case "no_show":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getVerificationBadgeClass(status: Order["verification_status"]) {
  switch (status) {
    case "verified":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "expired":
      return "bg-rose-100 text-rose-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "not_required":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getPaymentMethodBadgeClass(method: Order["payment_method"]) {
  switch (method) {
    case "counter":
      return "bg-orange-100 text-orange-800";
    case "online":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getKitchenBadgeClass(active: boolean) {
  return active
    ? "bg-blue-100 text-blue-700"
    : "bg-slate-200 text-slate-700";
}

async function parseError(response: Response) {
  try {
    const data = await response.json();
    return data?.error || "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

export default function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isCounterOrder = order.payment_method === "counter";
  const canMarkPaidAtCounter =
    isCounterOrder && order.payment_status !== "paid_counter";

  async function markPaidAtCounter() {
    try {
      setLoadingAction("paid_counter");

      const response = await fetch(
        `/api/admin/orders/${order.id}/mark-counter-paid`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const message = await parseError(response);
        alert(message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to mark counter payment");
    } finally {
      setLoadingAction(null);
    }
  }

  async function updateStatus(status: FulfilmentStatus) {
    try {
      setLoadingAction(status);

      const response = await fetch(`/api/admin/orders/${order.id}/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fulfilmentStatus: status,
        }),
      });

      if (!response.ok) {
        const message = await parseError(response);
        alert(message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update order status");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Order {formatOrderNumber(order.order_number)}
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentMethodBadgeClass(
                order.payment_method
              )}`}
            >
              Method: {formatLabel(order.payment_method)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentBadgeClass(
                order.payment_status
              )}`}
            >
              Payment: {formatLabel(order.payment_status)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getVerificationBadgeClass(
                order.verification_status
              )}`}
            >
              Verification: {formatLabel(order.verification_status)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getFulfilmentBadgeClass(
                order.fulfilment_status
              )}`}
            >
              Fulfilment: {formatLabel(order.fulfilment_status)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getKitchenBadgeClass(
                order.active_for_kitchen
              )}`}
            >
              Kitchen: {order.active_for_kitchen ? "Active" : "Inactive"}
            </span>

            {order.risk_flag ? (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                Risk Flag
              </span>
            ) : null}

            {order.no_show_flag ? (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                No Show
              </span>
            ) : null}
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
          <p className="text-sm text-slate-500">
            {order.payment_method === "counter" ? "Pickup Time" : "Address"}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {order.payment_method === "counter"
              ? formatDateTime(order.pickup_time)
              : order.delivery_address || "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Verification Expires</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {order.verification_expires_at
              ? formatDateTime(order.verification_expires_at)
              : "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Verified At</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {order.verified_at ? formatDateTime(order.verified_at) : "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Counter Paid At</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {order.counter_paid_at ? formatDateTime(order.counter_paid_at) : "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Stripe Session</p>
          <p className="mt-1 break-all text-sm font-semibold text-slate-900">
            {order.stripe_checkout_session_id || "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Admin Actions
        </h3>

        <div className="mt-4 flex flex-wrap gap-3">
          {canMarkPaidAtCounter ? (
            <button
              type="button"
              onClick={markPaidAtCounter}
              disabled={loadingAction !== null}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingAction === "paid_counter"
                ? "Marking..."
                : "Mark Paid at Counter"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => updateStatus("preparing")}
            disabled={loadingAction !== null}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "preparing" ? "Updating..." : "Mark Preparing"}
          </button>

          <button
            type="button"
            onClick={() => updateStatus("ready_for_pickup")}
            disabled={loadingAction !== null}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "ready_for_pickup"
              ? "Updating..."
              : "Mark Ready for Pickup"}
          </button>

          <button
            type="button"
            onClick={() => updateStatus("completed")}
            disabled={loadingAction !== null}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "completed" ? "Updating..." : "Mark Completed"}
          </button>

          <button
            type="button"
            onClick={() => updateStatus("no_show")}
            disabled={loadingAction !== null}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "no_show" ? "Updating..." : "Mark No Show"}
          </button>

          <button
            type="button"
            onClick={() => updateStatus("cancelled")}
            disabled={loadingAction !== null}
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "cancelled" ? "Updating..." : "Cancel Order"}
          </button>
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