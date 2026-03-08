import DeleteMealPackOptionButton from "@/components/admin/delete-meal-pack-option-button";
import type { MealPackMenu, MealPackOption } from "@/types/meal-pack";

export default function MealPackOptionList({
  mealPacks,
  options,
}: {
  mealPacks: MealPackMenu[];
  options: MealPackOption[];
}) {
  if (mealPacks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-700">
        Create a meal pack first before adding options.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mealPacks.map((mealPack) => {
        const relatedOptions = options.filter(
          (option) => option.meal_pack_menu_id === mealPack.id
        );

        return (
          <div
            key={mealPack.id}
            className="rounded-3xl border border-slate-300 bg-white p-6 shadow-md"
          >
            <div className="mb-4">
              <h3 className="text-xl font-extrabold text-slate-950">
                {mealPack.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {mealPack.slug}
              </p>
            </div>

            {relatedOptions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm font-medium text-slate-700">
                No options added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {relatedOptions.map((option) => (
                  <div
                    key={option.id}
                    className="rounded-2xl border border-slate-300 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-slate-950">
                            {option.name}
                          </p>

                          <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-800">
                            {option.category || "other"}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              option.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-slate-300 text-slate-800"
                            }`}
                          >
                            {option.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {option.description ? (
                          <p className="mt-2 text-sm font-medium text-slate-800">
                            {option.description}
                          </p>
                        ) : null}

                        <p className="mt-2 text-xs font-medium text-slate-700">
                          Sort order: {option.sort_order}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:items-end">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-medium text-slate-700">
                            Price
                          </p>
                          <p className="font-extrabold text-slate-950">
                            ${Number(option.price).toFixed(2)}
                          </p>
                        </div>

                        <DeleteMealPackOptionButton
                          optionId={option.id}
                          optionName={option.name}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}