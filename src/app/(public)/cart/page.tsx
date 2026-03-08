"use client";

import { useRouter } from "next/navigation";
import SiteHeader from "@/components/layout/site-header";
import { useCart } from "@/components/cart/cart-context";
import SiteFooter from "@/components/layout/site-footer";

export default function CartPage() {
  const router = useRouter();

  const { items, subtotal, increaseQty, decreaseQty, removeItem, clearCart } =
    useCart();

  return (
    <>
      <SiteHeader />

      <div className="flex min-h-screen flex-col bg-[#fffaf3]">
        <main className="flex-1 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  Your Cart
                </h1>
                <p className="mt-2 text-slate-600">
                  Review your items before checkout.
                </p>
              </div>

              {items.length > 0 ? (
                <button
                  onClick={clearCart}
                  className="w-full rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
                >
                  Clear Cart
                </button>
              ) : null}
            </div>

            {items.length === 0 ? (
              <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 sm:p-10">
                Your cart is empty.
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/menu")}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Browse Menu
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                  {items.map((item) => {
                    const isMealPack = item.type === "meal_pack";

                    return (
                      <div
                        key={item.id}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold text-slate-900">
                                  {item.name}
                                </h2>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    isMealPack
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {isMealPack ? "Meal Pack" : "Regular Item"}
                                </span>
                              </div>

                              <p className="mt-1 text-sm text-slate-500">
                                ${item.price.toFixed(2)} each
                              </p>

                              {isMealPack && item.selections?.length ? (
                                <div className="mt-4">
                                  <p className="text-sm font-medium text-slate-700">
                                    Selected curries
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {item.selections.map((selection) => (
                                      <span
                                        key={selection}
                                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                                      >
                                        {selection}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>

                            <div className="shrink-0 text-left sm:text-right">
                              <div className="font-semibold text-slate-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex w-fit items-center rounded-2xl border border-slate-200 bg-white">
                              <button
                                onClick={() => decreaseQty(item.id)}
                                className="px-4 py-2 text-lg font-bold text-slate-900"
                              >
                                -
                              </button>

                              <span className="min-w-10 text-center text-sm font-semibold text-slate-900">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() => increaseQty(item.id)}
                                className="px-4 py-2 text-lg font-bold text-slate-900"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Order Summary
                  </h2>

                  <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
                    <span>Items</span>
                    <span className="font-semibold text-slate-900">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span>Delivery</span>
                    <span className="font-semibold text-slate-900">
                      Calculated later
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
                    <span className="font-medium text-slate-700">
                      Estimated total
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => router.push("/checkout")}
                    className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Proceed to Checkout
                  </button>
                </aside>
              </div>
            )}
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}