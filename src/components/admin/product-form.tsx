"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [spiceLevel, setSpiceLevel] = useState("");
  const [serves, setServes] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !slug.trim() || !price) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: Number(price),
          image_url: imageUrl || null,
          spice_level: spiceLevel || null,
          serves: serves || null,
          is_featured: isFeatured,
          is_active: isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to create product.");
        setLoading(false);
        return;
      }

      setMessage("Product created successfully.");
      setName("");
      setSlug("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setSpiceLevel("");
      setServes("");
      setIsFeatured(false);
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
          Create Product
        </h2>
        <p className="mt-2 text-slate-700">
          Add a new menu item for customers.
        </p>
      </div>

      <div className="grid gap-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Product Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
            placeholder="Chicken Rice Pack"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
            placeholder="chicken-rice-pack"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
            placeholder="Short product description..."
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
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
              className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
              placeholder="18.90"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Serves
            </label>
            <input
              type="text"
              value={serves}
              onChange={(e) => setServes(e.target.value)}
              className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
              placeholder="1-2"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
              placeholder="/products/chicken-rice-pack.jpg"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Spice Level
            </label>
            <input
              type="text"
              value={spiceLevel}
              onChange={(e) => setSpiceLevel(e.target.value)}
              className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-slate-950"
              placeholder="Mild / Medium / Hot"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-slate-900">
              Featured product
            </span>
          </label>

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
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}