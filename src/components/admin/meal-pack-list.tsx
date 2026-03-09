import type { MealPackMenu } from "@/types/meal-pack";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const normalized = value.replace(" ", "T");
  const [datePart, timePart = "00:00:00"] = normalized.split("T");
  const [year, month, day] = datePart.split("-");
  const [hourRaw, minute] = timePart.split(":");

  const hour24 = Number(hourRaw);
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "pm" : "am";

  return `${day}/${month}/${year}, ${pad(hour12)}:${minute} ${ampm}`;
}

export default function MealPackList({
  mealPacks,
}: {
  mealPacks: MealPackMenu[];
}) {
  if (mealPacks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-700">
        No meal packs created yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mealPacks.map((mealPack) => (
        <div
          key={mealPack.id}
          className="rounded-3xl border border-slate-300 bg-white p-6 shadow-md"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-950">
                  {mealPack.title}
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    mealPack.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-300 text-slate-800"
                  }`}
                >
                  {mealPack.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-slate-700">
                {mealPack.slug}
              </p>

              {mealPack.description ? (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-800">
                  {mealPack.description}
                </p>
              ) : null}
            </div>

            <div className="text-left lg:text-right">
              <p className="text-sm font-medium text-slate-700">Status</p>
              <p className="text-lg font-extrabold text-slate-950">
                Current Weekly Pack
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Week Of</p>
              <p className="mt-1 font-semibold text-slate-950">
                {mealPack.week_of}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                Available From
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {formatDateTime(mealPack.available_from)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Cutoff</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {formatDateTime(mealPack.order_cutoff_at)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                Pickup / Delivery
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {formatDateTime(mealPack.pickup_date)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}