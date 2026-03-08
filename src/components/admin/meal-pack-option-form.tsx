"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MealPackMenu } from "@/types/meal-pack";

export default function MealPackOptionForm({
  mealPacks,
}: {
  mealPacks: MealPackMenu[];
}) {
  const router = useRouter();

  const [mealPackMenuId, setMealPackMenuId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("main");
  const [sortOrder, setSortOrder] = useState("0");
  const [price, setPrice] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mealPacks.length > 0 && !mealPackMenuId) {
      setMealPackMenuId(mealPacks[0].id);
    }
  }, [mealPacks, mealPackMenuId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const trimmedName = name.trim();

    if (!mealPackMenuId || !trimmedName) {
      setMessage("Please select a meal pack and enter an option name.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        meal_pack_menu_id: mealPackMenuId,
        name: trimmedName,
        description: description.trim(),
        category,
        sort_order: Number(sortOrder || 0),
        price: Number(price || 0),
        is_active: isActive,
      };

      const response = await fetch("/api/admin/meal-pack-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to create option.");
        setLoading(false);
        return;
      }

      setMessage("Meal pack option created successfully.");
      setName("");
      setDescription("");
      setCategory("main");
      setSortOrder("0");
      setPrice("0");
      setIsActive(true);
      setLoading(false);

      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-300 bg-white p-6 shadow-md"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-950">
          Add Meal Pack Option
        </h2>
        <p className="mt-2 text-slate-700">
          Add curries, meats, and sides for a selected meal pack.
        </p>
      </div>

      <div className="grid gap-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Meal Pack
          </label>
          <select
            value={mealPackMenuId}
            onChange={(e) => setMealPackMenuId(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
          >
            {mealPacks.length === 0 ? (
              <option value="">No meal packs available</option>
            ) : (
              mealPacks.map((mealPack) => (
                <option key={mealPack.id} value={mealPack.id}>
                  {mealPack.title}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Option Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
            placeholder="Chicken Curry"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-slate-400 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
            placeholder="Classic Sri Lankan chicken curry"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-slate-400 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
            >
              <option value="main">Main</option>
              <option value="side">Side</option>
              <option value="veg">Veg</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-2xl border border-slate-400 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-2xl border border-slate-400 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-slate-900">
              Active and visible to customers
            </span>
          </label>
        </div>
      </div>

      {message ? (
        <div className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading || mealPacks.length === 0}
        className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition ${
          loading || mealPacks.length === 0
            ? "cursor-not-allowed bg-slate-500"
            : "bg-slate-950 hover:opacity-90"
        }`}
      >
        {loading ? "Creating..." : "Create Option"}
      </button>
    </form>
  );
}