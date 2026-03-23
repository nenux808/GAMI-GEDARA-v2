import Link from "next/link";

type VerifyPageProps = {
  searchParams: Promise<{
    status?: string;
    order?: string;
  }>;
};

const statusConfig: Record<
  string,
  {
    title: string;
    description: string;
    tone: "success" | "warning" | "error" | "neutral" | "info";
  }
> = {
  "pending-email": {
    title: "Check Your Email",
    description:
      "Your Pay at Counter order has been created. Please confirm it using the email we just sent you before it can be accepted.",
    tone: "info",
  },
  success: {
    title: "Order Confirmed",
    description:
      "Your Pay at Counter order has been confirmed successfully. Our team can now process it.",
    tone: "success",
  },
  "already-verified": {
    title: "Order Already Confirmed",
    description:
      "This order has already been verified. No further action is needed.",
    tone: "neutral",
  },
  expired: {
    title: "Verification Link Expired",
    description:
      "This verification link has expired. Please place your order again or contact the restaurant if you need help.",
    tone: "warning",
  },
  invalid: {
    title: "Invalid Verification Link",
    description:
      "We could not verify this order. The link may be invalid or already used.",
    tone: "error",
  },
  "invalid-state": {
    title: "Order Cannot Be Verified",
    description:
      "This order is not in a valid state for verification. Please contact the restaurant for assistance.",
    tone: "warning",
  },
  "missing-token": {
    title: "Missing Verification Token",
    description:
      "The verification link is incomplete. Please use the full link from your email.",
    tone: "error",
  },
  "lookup-error": {
    title: "Verification Error",
    description:
      "We could not look up your order right now. Please try again shortly.",
    tone: "error",
  },
  "update-error": {
    title: "Could Not Confirm Order",
    description:
      "We found your order, but we could not update it right now. Please try again or contact the restaurant.",
    tone: "error",
  },
  "server-error": {
    title: "Something Went Wrong",
    description:
      "A server error occurred while processing your verification request. Please try again shortly.",
    tone: "error",
  },
};

function getToneClasses(
  tone: "success" | "warning" | "error" | "neutral" | "info"
) {
  switch (tone) {
    case "success":
      return {
        badge: "bg-green-100 text-green-700 border-green-200",
        card: "border-green-200 bg-green-50/60",
      };
    case "warning":
      return {
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        card: "border-amber-200 bg-amber-50/60",
      };
    case "error":
      return {
        badge: "bg-red-100 text-red-700 border-red-200",
        card: "border-red-200 bg-red-50/60",
      };
    case "info":
      return {
        badge: "bg-blue-100 text-blue-700 border-blue-200",
        card: "border-blue-200 bg-blue-50/60",
      };
    default:
      return {
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        card: "border-slate-200 bg-slate-50/60",
      };
  }
}

function formatStatusLabel(status: string) {
  return status.replace(/-/g, " ");
}

export default async function VerifyPage({
  searchParams,
}: VerifyPageProps) {
  const params = await searchParams;
  const status = params.status ?? "server-error";
  const order = params.order;

  const config = statusConfig[status] ?? statusConfig["server-error"];
  const tone = getToneClasses(config.tone);

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 bg-gradient-to-r from-amber-100 via-orange-50 to-white px-8 py-8">
            <div className="mb-4 inline-flex rounded-full border border-orange-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
              Gami Gedara
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {config.title}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              {config.description}
            </p>
          </div>

          <div className="px-8 py-8">
            <div className={`rounded-2xl border p-5 ${tone.card}`}>
              <div
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tone.badge}`}
              >
                {formatStatusLabel(status)}
              </div>

              {order ? (
                <p className="mt-4 text-sm text-slate-700">
                  Order Number:{" "}
                  <span className="font-semibold text-slate-900">#{order}</span>
                </p>
              ) : null}
            </div>

            {status === "pending-email" ? (
              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  What happens next
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  <li>• Open the verification email sent to your inbox.</li>
                  <li>• Click the confirmation link in that email.</li>
                  <li>
                    • Once confirmed, your order becomes active for pickup.
                  </li>
                  <li>
                    • Payment will be collected at the counter when you arrive.
                  </li>
                </ul>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Back to Home
              </Link>

              <Link
                href="/menu"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Browse Menu
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                Need help?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                If something does not look right, contact Gami Gedara and share
                your order number.
              </p>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p>
                  Phone: <span className="font-medium">+61 450 918 448</span>
                </p>
                <p>
                  Email:{" "}
                  <span className="font-medium">
                    {process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
                      "gamigedaraadmin@gmail.com"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}