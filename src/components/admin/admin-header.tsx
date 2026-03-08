import Link from "next/link";
import AdminLogoutButton from "@/components/admin/admin-logout-button";

function navClass() {
  return "rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white";
}

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/admin" className="text-xl font-extrabold tracking-tight text-white">
            Gami Gedara Admin
          </Link>
          <p className="mt-1 text-sm text-slate-400">
            Manage orders, products, and meal packs
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <nav className="flex flex-wrap gap-2">
            <Link href="/admin" className={navClass()}>
              Dashboard
            </Link>
            <Link href="/admin/orders" className={navClass()}>
              Orders
            </Link>
            <Link href="/admin/products" className={navClass()}>
              Products
            </Link>
            <Link href="/admin/meal-packs" className={navClass()}>
              Meal Packs
            </Link>
            <Link href="/admin/meal-pack-options" className={navClass()}>
              Options
            </Link>
          </nav>

          <div>
            <AdminLogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}