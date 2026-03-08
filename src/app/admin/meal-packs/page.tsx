import AdminHeader from "@/components/admin/admin-header";
import MealPackForm from "@/components/admin/meal-pack-form";
import MealPackList from "@/components/admin/meal-pack-list";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminMealPacksPage() {
  const { data, error } = await supabaseAdmin
    .from("meal_pack_menus")
    .select("*");

  if (error) {
    console.error("Failed to load meal packs:", error.message);
  }

  const mealPacks = data ?? [];

  return (
    <>
      <AdminHeader />

      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-950">
              Meal Packs
            </h1>
            <p className="mt-2 font-medium text-slate-700">
              Create and manage weekly meal packs with ordering windows.
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
            <MealPackForm />
            <MealPackList mealPacks={mealPacks} />
          </div>
        </div>
      </main>
    </>
  );
}