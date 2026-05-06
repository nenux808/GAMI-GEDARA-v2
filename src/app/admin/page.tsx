import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: orderCount },
    { count: productCount },
    { count: mealPackCount },
    { data: orders },
  ] = await Promise.all([
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("meal_pack_menus")
      .select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("orders")
      .select(
        "id, customer_name, customer_phone, total_amount, payment_status, payment_method, fulfilment_status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const orderList = orders ?? [];

  const paidOrders = orderList.filter((order) => order.payment_status === "paid");
  const pendingOrders = orderList.filter(
    (order) => order.payment_status === "pending"
  );
  const counterOrders = orderList.filter(
    (order) => order.payment_method === "counter"
  );
  const onlineOrders = orderList.filter(
    (order) => order.payment_method === "online"
  );

  const todayOrders = orderList.filter(
    (order) => new Date(order.created_at) >= todayStart
  );

  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  const todayRevenue = todayOrders
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Quick overview of orders, products, revenue, and meal packs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Total Orders"
            value={orderCount ?? 0}
            href="/admin/orders"
          />

          <DashboardCard title="Today’s Orders" value={todayOrders.length} />

          <DashboardCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
          />

          <DashboardCard
            title="Today’s Revenue"
            value={`$${todayRevenue.toFixed(2)}`}
          />

          <DashboardCard title="Paid Orders" value={paidOrders.length} />

          <DashboardCard title="Pending Orders" value={pendingOrders.length} />

          <DashboardCard
            title="Products"
            value={productCount ?? 0}
            href="/admin/products"
          />

          <DashboardCard
            title="Meal Pack Menus"
            value={mealPackCount ?? 0}
            href="/admin/meal-packs"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Payment Breakdown
            </h2>

            <div className="mt-5 space-y-3">
              <MiniStat label="Online Payments" value={onlineOrders.length} />
              <MiniStat label="Pay at Counter" value={counterOrders.length} />
              <MiniStat label="Pending Payments" value={pendingOrders.length} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Orders
              </h2>

              <Link
                href="/admin/orders"
                className="text-sm font-semibold text-slate-900 underline underline-offset-4"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {orderList.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No recent orders found.
                </p>
              ) : (
                orderList.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {order.customer_name || "Customer"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.payment_method || "Unknown"} ·{" "}
                        {order.payment_status || "pending"} ·{" "}
                        {order.fulfilment_status || "new"}
                      </p>
                    </div>

                    <p className="font-bold text-slate-900">
                      ${Number(order.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  href,
}: {
  title: string;
  value: string | number;
  href?: string;
}) {
  const card = (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>

      {href && (
        <p className="mt-4 text-sm font-semibold text-slate-900 underline underline-offset-4">
          View details
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}
