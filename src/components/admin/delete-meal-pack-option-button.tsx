"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteMealPackOptionButton({
  optionId,
  optionName,
}: {
  optionId: string;
  optionName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${optionName}"?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/meal-pack-options/${optionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete option");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
        loading
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          : "border-red-200 bg-white text-red-600 hover:bg-red-50"
      }`}
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}