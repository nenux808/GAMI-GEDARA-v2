"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-context";

function navClass(active: boolean) {
  return active
    ? "text-slate-950 font-semibold"
    : "text-slate-600 font-medium hover:text-slate-950 transition";
}

function mobileNavClass(active: boolean) {
  return active
    ? "rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
    : "rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950";
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { items } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="text-xl font-extrabold tracking-tight text-slate-950"
          >
            Gami Gedara
          </Link>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-4 text-sm sm:gap-6 md:flex">
              <Link href="/menu" className={navClass(pathname === "/menu")}>
                Menu
              </Link>
              <Link
                href="/meal-packs"
                className={navClass(pathname === "/meal-packs")}
              >
                Meal Packs
              </Link>
              <Link
                href="/contact"
                className={navClass(pathname === "/contact")}
              >
                Contact
              </Link>
            </nav>

            <Link
              href="/cart"
              onClick={closeMobileMenu}
              className="relative rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Cart
              {cartCount > 0 ? (
                <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-950">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 transition hover:bg-slate-50 md:hidden"
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 top-0 block h-0.5 w-5 rounded bg-current transition ${
                    mobileOpen ? "top-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] block h-0.5 w-5 rounded bg-current transition ${
                    mobileOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[14px] block h-0.5 w-5 rounded bg-current transition ${
                    mobileOpen ? "top-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="mt-4 grid gap-2 md:hidden">
            <Link
              href="/menu"
              onClick={closeMobileMenu}
              className={mobileNavClass(pathname === "/menu")}
            >
              Menu
            </Link>

            <Link
              href="/meal-packs"
              onClick={closeMobileMenu}
              className={mobileNavClass(pathname === "/meal-packs")}
            >
              Meal Packs
            </Link>

            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className={mobileNavClass(pathname === "/contact")}
            >
              Contact
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}