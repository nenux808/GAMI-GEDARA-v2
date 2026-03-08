"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/toast-context";
import type { MealPackMenu, MealPackOption } from "@/types/meal-pack";

type MealPackBuilderProps = {
  menu: MealPackMenu;
  options: MealPackOption[];
};

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value.replace(" ", "T"));

  return date.toLocaleString("en-AU", {
    timeZone: "Australia/Melbourne",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MealPackBuilder({
  menu,
  options,
}: MealPackBuilderProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const now = new Date();
  const openAt = new Date(menu.available_from.replace(" ", "T"));
  const cutoffAt = new Date(menu.order_cutoff_at.replace(" ", "T"));

  const isScheduled = now < openAt;
  const isClosed = now >= cutoffAt;
  const isOpen = !isScheduled && !isClosed && menu.is_active;

  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<string, number>
  >({});

  const groupedOptions = useMemo(() => {
    const groups: Record<string, MealPackOption[]> = {};

    for (const option of options) {
      const key = option.category || "other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(option);
    }

    return groups;
  }, [options]);

  const selectedOptionObjects = useMemo(() => {
    return options.filter(
      (option) => (selectedQuantities[option.name] ?? 0) > 0
    );
  }, [options, selectedQuantities]);

  const totalSelectedItems = useMemo(() => {
    return Object.values(selectedQuantities).reduce((sum, qty) => sum + qty, 0);
  }, [selectedQuantities]);

  const totalPrice = useMemo(() => {
    return options.reduce((sum, option) => {
      const qty = selectedQuantities[option.name] ?? 0;
      return sum + Number(option.price) * qty;
    }, 0);
  }, [options, selectedQuantities]);

  const increaseOption = (name: string) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [name]: (prev[name] ?? 0) + 1,
    }));
  };

  const decreaseOption = (name: string) => {
    setSelectedQuantities((prev) => {
      const current = prev[name] ?? 0;
      const next = current - 1;

      if (next <= 0) {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      }

      return {
        ...prev,
        [name]: next,
      };
    });
  };

  const handleAddMealPack = () => {
    if (!isOpen) return;

    if (totalSelectedItems === 0) {
      showToast("Please select at least one meal pack option");
      return;
    }

    const expandedSelections = Object.entries(selectedQuantities).flatMap(
      ([name, qty]) => Array.from({ length: qty }, () => name)
    );

    const compactSelections = Object.entries(selectedQuantities).map(
      ([name, qty]) => `${name} x${qty}`
    );

    addItem({
      id: `${menu.id}-${compactSelections.join("-")}`,
      type: "meal_pack",
      name: menu.title,
      slug: menu.slug,
      price: totalPrice,
      meal_pack_menu_id: menu.id,
      selections: expandedSelections,
    });

    showToast(`${menu.title} added to cart`);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-800">
            Weekly Meal Pack
          </span>

          {isOpen ? (
            <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
              Open
            </span>
          ) : isScheduled ? (
            <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
              Opens Soon
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-700">
              Closed
            </span>
          )}
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {menu.title}
        </h1>

        {menu.description ? (
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {menu.description}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Available from</p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatDateTime(menu.available_from)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Order cutoff</p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatDateTime(menu.order_cutoff_at)}
            </p>
          </div>

          {menu.pickup_date ? (
            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
              <p className="text-sm text-slate-500">Pickup / delivery time</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatDateTime(menu.pickup_date)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 space-y-6">
          {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold capitalize text-slate-900">
                {category}
              </h2>

              <div className="mt-3 grid gap-3">
                {categoryOptions.map((option) => {
                  const qty = selectedQuantities[option.name] ?? 0;

                  return (
                    <div
                      key={option.id}
                      className={`rounded-2xl border p-4 transition ${
                        qty > 0
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900">
                            {option.name}
                          </p>
                          {option.description ? (
                            <p className="mt-1 text-sm text-slate-600">
                              {option.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-col gap-3 sm:items-end">
                          <div className="text-sm font-semibold text-slate-900">
                            ${Number(option.price).toFixed(2)}
                          </div>

                          <div className="flex w-fit items-center rounded-2xl border border-slate-300 bg-white">
                            <button
                              type="button"
                              onClick={() => decreaseOption(option.name)}
                              className="px-4 py-2 text-lg font-bold text-slate-900 disabled:text-slate-400"
                              disabled={!isOpen || qty === 0}
                            >
                              -
                            </button>

                            <span className="min-w-10 text-center font-bold text-slate-900">
                              {qty}
                            </span>

                            <button
                              type="button"
                              onClick={() => increaseOption(option.name)}
                              className="px-4 py-2 text-lg font-bold text-slate-900 disabled:text-slate-400"
                              disabled={!isOpen}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold text-slate-900">Your Meal Pack</h2>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700">Selected options</p>

          {selectedOptionObjects.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              No meal pack options selected yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {selectedOptionObjects.map((option) => {
                const qty = selectedQuantities[option.name] ?? 0;

                return (
                  <li
                    key={option.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <span>{option.name}</span>
                      <span className="ml-2 text-slate-500">x{qty}</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      ${(Number(option.price) * qty).toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
          <span className="font-medium text-slate-700">Total</span>
          <span className="text-2xl font-bold text-slate-900">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        {isScheduled ? (
          <div className="mt-6 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Orders open at {formatDateTime(menu.available_from)}
          </div>
        ) : isClosed ? (
          <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Orders closed at {formatDateTime(menu.order_cutoff_at)}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            Orders close at {formatDateTime(menu.order_cutoff_at)}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddMealPack}
          disabled={!isOpen}
          className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
            isOpen
              ? "bg-slate-900 hover:opacity-90"
              : "cursor-not-allowed bg-slate-400"
          }`}
        >
          {isScheduled
            ? "Not Open Yet"
            : isClosed
            ? "Orders Closed"
            : "Add Meal Pack to Cart"}
        </button>
      </aside>
    </div>
  );
}