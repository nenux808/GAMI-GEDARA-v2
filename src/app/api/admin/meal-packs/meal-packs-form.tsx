"use client";

import { FormEvent, useState } from "react";

type MealPackFormProps = {
  onCreated?: () => void;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function MealPackForm({ onCreated }: MealPackFormProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [weekOf, setWeekOf] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [orderCutoffAt, setOrderCutoffAt] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (
      !title.trim() ||
      !slug.trim() ||
      !weekOf ||
      !basePrice ||
      !availableFrom ||
      !orderCutoffAt
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/meal-packs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          week_of: weekOf,
          base_price: Number(basePrice),
          available_from: availableFrom,
          order_cutoff_at: orderCutoffAt,
          pickup_date: pickupDate || null,
          is_active: isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to create meal pack.");
        setLoading(false);
        return;
      }

      setMessage("Meal pack created successfully.");
      setTitle("");
      setSlug("");
      setDescription("");
      setWeekOf("");
      setBasePrice("");
      setAvailableFrom("");
      setOrderCutoffAt("");
      setPickupDate("");
      setIsActive(true);
      setLoading(false);

      onCreated?.();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Create Meal Pack</h2>
        <p className="mt-2 text-slate-600">
          Publish a weekly meal pack with open and cutoff times.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Tuesday Meal Pack - 14 March"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="tuesday-meal-pack-14-march"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Short description for customers..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Week Of
          </label>
          <input
            type="date"
            value={weekOf}
            onChange={(e) => setWeekOf(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Base Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="24.90"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Available From
          </label>
          <input
            type="datetime-local"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Order Cutoff At
          </label>
          <input
            type="datetime-local"
            value={orderCutoffAt}
            onChange={(e) => setOrderCutoffAt(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Pickup / Delivery Date
          </label>
          <input
            type="datetime-local"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium text-slate-700">
              Active and visible to customers
            </span>
          </label>
        </div>
      </div>

      {message ? (
        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
          loading
            ? "cursor-not-allowed bg-slate-400"
            : "bg-slate-900 hover:opacity-90"
        }`}
      >
        {loading ? "Creating..." : "Create Meal Pack"}
      </button>
    </form>
  );
}