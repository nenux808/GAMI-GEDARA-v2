import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <div className="flex min-h-screen flex-col bg-[#fffaf3] text-slate-900">
        <main className="flex-1 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <span className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-800">
                Contact Us
              </span>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Get in touch with Gami Gedara
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base lg:text-lg">
                Have a question about our meals, weekly meal packs, or your order?
                Reach out and we’ll be happy to help.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Contact Information
                </h2>
                <p className="mt-3 text-slate-600">
                  Use the details below to contact us directly.
                </p>

                <div className="mt-8 grid gap-4 sm:gap-5">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-medium text-slate-500">Phone</p>
                    <a
                      href="tel:+61450918448"
                      className="mt-1 block text-lg font-semibold text-slate-900"
                    >
                      +61 450 918 448
                    </a>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-medium text-slate-500">Email</p>
                    <a
                      href="mailto:gamigedaraadmin@gmail.com"
                      className="mt-1 block break-all text-lg font-semibold text-slate-900"
                    >
                      gamigedaraadmin@gmail.com
                    </a>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-medium text-slate-500">Address</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      1467 Centre Rd, Clayton VIC 3168
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-medium text-slate-500">Hours</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      Wednesday - Sunday
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Hours can vary depending on meal pack and order times.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Send a Message
                </h2>
                <p className="mt-3 text-slate-600">
                  This is a simple contact section for now. Later, we can connect it
                  to email or a form handler.
                </p>

                <form className="mt-8 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Write your message here..."
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                    />
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Send Message
                  </button>
                </form>
              </section>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}