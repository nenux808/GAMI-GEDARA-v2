import AdminHeader from "@/components/admin/admin-header";
import MealPackOptionForm from "@/components/admin/meal-pack-option-form";
import MealPackOptionList from "@/components/admin/meal-pack-option-list";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { MealPackMenu, MealPackOption } from "@/types/meal-pack";

export default async function AdminMealPackOptionsPage() {
  const [{ data: mealPacksData }, { data: optionsData }] = await Promise.all([
    supabaseAdmin
      .from("meal_pack_menus")
      .select("*")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("meal_pack_options")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  const mealPacks = (mealPacksData ?? []) as MealPackMenu[];
  const options = (optionsData ?? []) as MealPackOption[];

  return (
    <>
      <AdminHeader />

      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-950">
              Meal Pack Options
            </h1>
            <p className="mt-2 font-medium text-slate-700">
              Add curries, meats, and sides for each meal pack.
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
            <MealPackOptionForm mealPacks={mealPacks} />
            <MealPackOptionList mealPacks={mealPacks} options={options} />
          </div>
        </div>
      </main>
    </>
  );
}