"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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

function combineDateAndTime(date: string, time: string) {
  if (!date || !time) return "";
  return `${date}T${time}:00`;
}

export default function MealPackForm({ onCreated }: MealPackFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [weekOf, setWeekOf] = useState("");

  const [availableFromDate, setAvailableFromDate] = useState("");
  const [availableFromTime, setAvailableFromTime] = useState("");

  const [orderCutoffDate, setOrderCutoffDate] = useState("");
  const [orderCutoffTime, setOrderCutoffTime] = useState("");

  const [pickupDateValue, setPickupDateValue] = useState("");
  const [pickupTimeValue, setPickupTimeValue] = useState("");

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

    const availableFrom = combineDateAndTime(
      availableFromDate,
      availableFromTime
    );
    const orderCutoffAt = combineDateAndTime(
      orderCutoffDate,
      orderCutoffTime
    );
    const pickupDate =
      pickupDateValue && pickupTimeValue
        ? combineDateAndTime(pickupDateValue, pickupTimeValue)
        : null;

    if (
      !title.trim() ||
      !slug.trim() ||
      !weekOf ||
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
          available_from: availableFrom,
          order_cutoff_at: orderCutoffAt,
          pickup_date: pickupDate,
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
      setAvailableFromDate("");
      setAvailableFromTime("");
      setOrderCutoffDate("");
      setOrderCutoffTime("");
      setPickupDateValue("");
      setPickupTimeValue("");
      setIsActive(true);
      setLoading(false);

      router.refresh();
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
      className="rounded-3xl border border-slate-300 bg-white p-6 shadow-md"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-950">
          Create Meal Pack
        </h2>
        <p className="mt-2 text-slate-700">
          Publish a weekly meal pack with open and cutoff times.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
            placeholder="Tuesday Meal Pack - 14 March"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
            placeholder="tuesday-meal-pack-14-march"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
            placeholder="Short description for customers..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Week Of
          </label>
          <input
            type="date"
            value={weekOf}
            onChange={(e) => setWeekOf(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Available From Date
          </label>
          <input
            type="date"
            value={availableFromDate}
            onChange={(e) => setAvailableFromDate(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Available From Time
          </label>
          <input
            type="time"
            value={availableFromTime}
            onChange={(e) => setAvailableFromTime(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Order Cutoff Date
          </label>
          <input
            type="date"
            value={orderCutoffDate}
            onChange={(e) => setOrderCutoffDate(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Order Cutoff Time
          </label>
          <input
            type="time"
            value={orderCutoffTime}
            onChange={(e) => setOrderCutoffTime(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Pickup / Delivery Date
          </label>
          <input
            type="date"
            value={pickupDateValue}
            onChange={(e) => setPickupDateValue(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Pickup / Delivery Time
          </label>
          <input
            type="time"
            value={pickupTimeValue}
            onChange={(e) => setPickupTimeValue(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
          />
        </div>

        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3">
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
        disabled={loading}
        className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition ${
          loading
            ? "cursor-not-allowed bg-slate-500"
            : "bg-slate-950 hover:opacity-90"
        }`}
      >
        {loading ? "Creating..." : "Create Meal Pack"}
      </button>
    </form>
  );
}