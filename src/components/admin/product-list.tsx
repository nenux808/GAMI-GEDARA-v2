import Image from "next/image";
import type { Product } from "@/types/product";
import DeleteProductButton from "@/components/admin/delete-product-button";

export default function ProductList({
  products,
}: {
  products: Product[];
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-700">
        No products created yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="rounded-3xl border border-slate-300 bg-white p-5 shadow-md"
        >
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="h-32 w-full overflow-hidden rounded-2xl bg-slate-100 lg:w-44">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={500}
                  height={400}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                  No image
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-950">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {product.slug}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">Price</p>
                  <p className="text-2xl font-extrabold text-slate-950">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </div>
              </div>

              {product.description ? (
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {product.description}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {product.spice_level ? (
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
                    Spice: {product.spice_level}
                  </span>
                ) : null}

                {product.serves ? (
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
                    Serves: {product.serves}
                  </span>
                ) : null}

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    product.is_featured
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {product.is_featured ? "Featured" : "Not Featured"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    product.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-300 text-slate-800"
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-5 flex justify-end">
                <DeleteProductButton
                  productId={product.id}
                  productName={product.name}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}