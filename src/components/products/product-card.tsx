"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/toast-context";

type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  spiceLevel?: string | null;
  serves?: string | null;
};

export default function ProductCard({
  id,
  name,
  slug,
  description,
  price,
  imageUrl,
  spiceLevel,
  serves,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id,
      type: "regular",
      name,
      slug,
      price,
      image_url: imageUrl,
    });

    showToast(`${name} added to cart`);
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={800}
            height={600}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">{name}</h3>
          <span className="whitespace-nowrap rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
            ${price.toFixed(2)}
          </span>
        </div>

        {description ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {spiceLevel ? (
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
              Spice: {spiceLevel}
            </span>
          ) : null}

          {serves ? (
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
              Serves: {serves}
            </span>
          ) : null}
        </div>

        <button
          onClick={handleAddToCart}
          className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
            added
              ? "bg-green-600 hover:bg-green-600"
              : "bg-slate-900 hover:opacity-90"
          }`}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}