import AdminHeader from "@/components/admin/admin-header";
import PrintButton from "@/components/admin/print-button";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SelectionRow = {
  option_name: string;
  quantity: number;
  meal_pack_menu_id?: string | null;
};

type OrderRow = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  created_at: string;
  payment_status: string;
  fulfilment_status: string;
  order_item_selections: SelectionRow[] | null;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatHumanDate(value: string) {
  return new Date(value).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function buildDateRange(start?: string, end?: string) {
  const today = new Date();
  const defaultEnd = formatDate(today);

  const weekStart = new Date(today);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  const defaultStart = formatDate(weekStart);

  const startDate = start || defaultStart;
  const endDate = end || defaultEnd;

  const startIso = `${startDate}T00:00:00`;
  const endExclusiveDate = new Date(`${endDate}T00:00:00`);
  endExclusiveDate.setDate(endExclusiveDate.getDate() + 1);
  const endIso = endExclusiveDate.toISOString().slice(0, 19);

  return {
    startDate,
    endDate,
    startIso,
    endIso,
  };
}

export default async function KitchenPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const { startDate, endDate, startIso, endIso } = buildDateRange(
    params.start,
    params.end
  );

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
      id,
      customer_name,
      customer_phone,
      customer_email,
      created_at,
      payment_status,
      fulfilment_status,
      order_item_selections (
        option_name,
        quantity,
        meal_pack_menu_id
      )
    `
    )
    .eq("payment_status", "paid")
    .in("fulfilment_status", ["new", "preparing"])
    .gte("created_at", startIso)
    .lt("created_at", endIso)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load kitchen print data:", error.message);
  }

  const orders = ((data ?? []) as unknown as OrderRow[]).filter(
    (order) => order.order_item_selections && order.order_item_selections.length > 0
  );

  const prepTotals = new Map<string, number>();

  for (const order of orders) {
    for (const selection of order.order_item_selections ?? []) {
      prepTotals.set(
        selection.option_name,
        (prepTotals.get(selection.option_name) ?? 0) + Number(selection.quantity)
      );
    }
  }

  const prepSummary = Array.from(prepTotals.entries())
    .map(([optionName, quantity]) => ({
      optionName,
      quantity,
    }))
    .sort((a, b) => a.optionName.localeCompare(b.optionName));

  return (
    <>
      <AdminHeader />

      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 print:bg-white print:px-0 print:py-0">
        <div className="mx-auto max-w-6xl space-y-8 print:max-w-none">
          <div className="flex flex-col gap-4 print:hidden md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Kitchen Print Sheet
              </h1>
              <p className="mt-2 text-slate-600">
                Print prep totals and customer packing details for the selected date range.
              </p>
            </div>

            <PrintButton />
          </div>

          <form
            method="GET"
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm print:hidden"
          >
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start"
                  defaultValue={startDate}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  End Date
                </label>
                <input
                  type="date"
                  name="end"
                  defaultValue={endDate}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:shadow-none">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-3xl font-bold text-slate-900">
                Gami Gedara Kitchen Sheet
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Date range: <span className="font-semibold">{startDate}</span> to{" "}
                <span className="font-semibold">{endDate}</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Generated on {formatHumanDate(new Date().toISOString())}
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No paid meal pack orders found for this period.
              </div>
            ) : (
              <div className="mt-8 space-y-10">
                <section>
                  <h3 className="text-xl font-bold text-slate-900">
                    Prep Totals
                  </h3>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-[1fr_auto] gap-4 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
                      <div>Meal Option</div>
                      <div>Total Qty</div>
                    </div>

                    {prepSummary.map((item) => (
                      <div
                        key={item.optionName}
                        className="grid grid-cols-[1fr_auto] gap-4 border-t border-slate-200 px-4 py-3 text-sm"
                      >
                        <div className="font-semibold text-slate-900">
                          {item.optionName}
                        </div>
                        <div className="font-bold text-slate-900">
                          {item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-slate-900">
                    Customer Packing List
                  </h3>

                  <div className="mt-4 space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-bold text-slate-900">
                              {order.customer_name || "Customer"}
                            </p>
                            <p className="text-sm text-slate-600">
                              {order.customer_phone || order.customer_email || "—"}
                            </p>
                          </div>

                          <div className="text-sm text-slate-600">
                            {formatHumanDate(order.created_at)}
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          {(order.order_item_selections ?? []).map(
                            (selection, index) => (
                              <div
                                key={`${order.id}-${selection.option_name}-${index}`}
                                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                              >
                                <span className="font-medium text-slate-900">
                                  {selection.option_name}
                                </span>
                                <span className="font-bold text-slate-900">
                                  x{selection.quantity}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}