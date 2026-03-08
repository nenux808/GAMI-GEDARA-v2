import AdminHeader from "@/components/admin/admin-header";
import ProductForm from "@/components/admin/product-form";
import ProductList from "@/components/admin/product-list";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Product } from "@/types/product";

export default async function AdminProductsPage() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products:", error.message);
  }

  const products = (data ?? []) as Product[];

  return (
    <>
      <AdminHeader />

      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-950">
              Products
            </h1>
            <p className="mt-2 font-medium text-slate-700">
              Create and manage menu items for customers.
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
            <ProductForm />
            <ProductList products={products} />
          </div>
        </div>
      </main>
    </>
  );
}