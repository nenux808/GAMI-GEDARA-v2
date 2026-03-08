"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${productName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete product.");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting the product.");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        loading
          ? "cursor-not-allowed bg-slate-300 text-slate-600"
          : "bg-red-600 text-white hover:bg-red-700"
      }`}
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}