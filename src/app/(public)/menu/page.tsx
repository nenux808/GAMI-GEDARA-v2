import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import ProductCard from "@/components/products/product-card";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

export default async function MenuPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, image_url, spice_level, serves, is_active, is_featured, created_at"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load menu products:", error.message);
  }

  const products = (data ?? []) as Product[];

  return (
    <>
      <SiteHeader />

      <div className="flex min-h-screen flex-col bg-[#fffaf3] text-slate-900">
        <main className="flex-1">
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="mb-10 sm:mb-12">
              <span className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-800">
                Our Menu
              </span>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Fresh Sri Lankan favourites
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base lg:text-lg">
                Browse our regular menu and add your favourites to cart with a
                smooth ordering experience.
              </p>
            </div>

            {products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 sm:p-10">
                No menu items available right now.
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