import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import { createClient } from "@/lib/supabase/server";
import MealPackBuilder from "@/components/products/meal-pack-builder";
import type { MealPackMenu, MealPackOption } from "@/types/meal-pack";

export default async function MealPacksPage() {
  const supabase = await createClient();

  const { data: activeMenu, error: menuError } = await supabase
    .from("meal_pack_menus")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (menuError) {
    console.error("Failed to load meal pack menu:", menuError.message);
  }

  let options: MealPackOption[] = [];

  if (activeMenu?.id) {
    const { data: menuOptions, error: optionsError } = await supabase
      .from("meal_pack_options")
      .select("*")
      .eq("meal_pack_menu_id", activeMenu.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (optionsError) {
      console.error("Failed to load meal pack options:", optionsError.message);
    }

    options = (menuOptions ?? []) as MealPackOption[];
  }

  return (
    <>
      <SiteHeader />

      <div className="flex min-h-screen flex-col bg-[#fffaf3]">
        <main className="flex-1 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            {!activeMenu ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                No active meal pack menu has been published yet.
              </div>
            ) : (
              <MealPackBuilder
                menu={activeMenu as MealPackMenu}
                options={options}
              />
            )}
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}