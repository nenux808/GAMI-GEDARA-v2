import AdminHeader from "@/components/admin/admin-header";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SummaryRow = {
  option_name: string;
  total_qty: number;
};

export default async function MealPackSummaryPage() {
  const { data, error } = await supabaseAdmin.rpc(
    "get_meal_pack_option_summary"
  );

  if (error) {
    console.error("Failed to load meal pack summary:", error.message);
  }

  const rows = (data ?? []) as SummaryRow[];

  return (
    <>
      <AdminHeader />

      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Meal Pack Prep Summary
            </h1>
            <p className="mt-2 text-slate-600">
              Total curry and side quantities from paid meal pack orders.
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No meal pack selections found yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 sm:px-6">
                <div>Option</div>
                <div>Total Quantity</div>
              </div>

              {rows.map((row) => (
                <div
                  key={row.option_name}
                  className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:px-6"
                >
                  <div className="font-semibold text-slate-900">
                    {row.option_name}
                  </div>
                  <div className="text-right font-bold text-slate-900">
                    {row.total_qty}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}