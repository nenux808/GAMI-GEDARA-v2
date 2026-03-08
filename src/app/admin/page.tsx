import Link from "next/link";
import AdminHeader from "@/components/admin/admin-header";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const [{ count: orderCount }, { count: productCount }, { count: mealPackCount }] =
    await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("meal_pack_menus")
        .select("*", { count: "exact", head: true }),
    ]);

  return (
    <>
      <AdminHeader />

      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Quick overview of orders, products, and meal packs.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Orders</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {orderCount ?? 0}
              </p>
              <Link
                href="/admin/orders"
                className="mt-4 inline-block text-sm font-semibold text-slate-900 underline underline-offset-4"
              >
                View orders
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Products</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {productCount ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Meal Pack Menus</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {mealPackCount ?? 0}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}