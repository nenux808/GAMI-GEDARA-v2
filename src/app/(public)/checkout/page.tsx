"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import { useCart } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/toast-context";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      showToast("Your cart is empty");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      showToast("Please fill in name, email, and phone number");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          customer: {
            name: fullName,
            email,
            phone,
            address,
            notes,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      showToast("Something went wrong");
      setLoading(false);
    } catch (error) {
      console.error(error);
      showToast("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />

      <div className="flex min-h-screen flex-col bg-[#fffaf3]">
        <main className="flex-1 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Checkout
              </h1>
              <p className="mt-2 text-slate-600">
                Enter your details so we can process your order.
              </p>
            </div>

            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 sm:p-10">
                Your cart is empty.
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/menu")}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Browse Menu
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
                <form
                  onSubmit={handleSubmit}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Address
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                        placeholder="Enter your address"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                        placeholder="Any important delivery or order notes"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`mt-8 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
                      loading
                        ? "cursor-not-allowed bg-slate-400"
                        : "bg-slate-900 hover:opacity-90"
                    }`}
                  >
                    {loading ? "Redirecting to Payment..." : "Continue to Payment"}
                  </button>
                </form>

                <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Order Summary
                  </h2>

                  <div className="mt-6 space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Qty: {item.quantity}
                            </p>

                            {item.type === "meal_pack" && item.selections?.length ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.selections.map((selection) => (
                                  <span
                                    key={selection}
                                    className="rounded-full bg-white px-2 py-1 text-xs text-slate-700"
                                  >
                                    {selection}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <p className="shrink-0 font-semibold text-slate-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
                    <span>Items</span>
                    <span className="font-semibold text-slate-900">
                      {itemCount}
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