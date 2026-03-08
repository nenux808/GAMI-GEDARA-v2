import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <h3 className="text-xl font-extrabold text-slate-950">Gami Gedara</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Authentic Sri Lankan meals made with care, served with a modern and
            seamless ordering experience.
          </p>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-900">
              Built by Nenux Web Solutions
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Digital solutions crafted for modern businesses.
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-950">
            Quick Links
          </h4>
          <nav className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/" className="text-slate-600 transition hover:text-slate-950">
              Home
            </Link>
            <Link href="/menu" className="text-slate-600 transition hover:text-slate-950">
              Menu
            </Link>
            <Link
              href="/meal-packs"
              className="text-slate-600 transition hover:text-slate-950"
            >
              Meal Packs
            </Link>
            <Link href="/cart" className="text-slate-600 transition hover:text-slate-950">
              Cart
            </Link>
            <Link
              href="/contact"
              className="text-slate-600 transition hover:text-slate-950"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-950">
            Contact
          </h4>

          <div className="mt-4 space-y-3 text-sm">
            <p className="text-slate-600">Phone</p>
            <a
              href="tel:+61450918448"
              className="block font-semibold text-slate-900 transition hover:text-slate-700"
            >
              +61 450 918 448
            </a>

            <p className="pt-2 text-slate-600">
              Need help with orders, meal packs, or general inquiries? Get in touch
              with us directly.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
  <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-5 text-center text-sm text-slate-500 sm:px-6 sm:flex-row sm:justify-between sm:text-left">
    <p>© {year} Gami Gedara. All rights reserved.</p>
    <p>
      Designed & developed by{" "}
      <span className="font-semibold text-slate-700">Nenux Web Solutions</span>
    </p>
  </div>
</div>
    </footer>
  );
}