import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/products/product-card";
import SiteHeader from "@/components/layout/site-header";
import type { Product } from "@/types/product";
import SiteFooter from "@/components/layout/site-footer";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredProducts, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, image_url, is_featured, is_active, spice_level, serves"
    )
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Failed to load featured products:", error.message);
  }

  const products = (featuredProducts ?? []) as Product[];

  return (
    <>
      <SiteHeader />

      <div className="flex min-h-screen flex-col bg-[#fffaf3] text-slate-900">
        <main className="flex-1">
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <span className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-800">
                  Authentic Sri Lankan Flavours
                </span>

                <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Fresh meals. Smooth ordering. Better experience.
                </h1>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base lg:text-lg">
                  Explore the Gami Gedara menu, weekly meal packs, and a simple checkout
                  flow built for modern food ordering.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/menu"
                    className="rounded-2xl bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Explore Menu
                  </Link>

                  <Link
                    href="/meal-packs"
                    className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Weekly Meal Packs
                  </Link>

                  <Link
                    href="/contact"
                    className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Contact Us
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-500">Ordering</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">Fast & Easy</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-500">Meal Packs</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">Weekly Specials</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-500">Service</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">Direct Contact</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-gradient-to-br from-amber-100 to-orange-50 p-5 sm:p-8">
                <div className="overflow-hidden rounded-[1.5rem] shadow-xl">
                  <Image
                    src="/hero-meal.jpg"
                    alt="Sri Lankan food platter"
                    width={1200}
                    height={900}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Featured Meals
                </h2>
                <p className="mt-2 text-slate-600">
                  A few customer favourites to get things started.
                </p>
              </div>

              <Link
                href="/menu"
                className="text-sm font-semibold text-slate-900 underline underline-offset-4"
              >
                View full menu
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 sm:p-10">
                No featured products yet.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    description={product.description}
                    price={Number(product.price)}
                    imageUrl={product.image_url}
                    spiceLevel={product.spice_level}
                    serves={product.serves}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
