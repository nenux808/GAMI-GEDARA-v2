"use client";

import { useMemo, useState } from "react";

type TemplateKey =
  | "ready"
  | "reminder"
  | "delay"
  | "confirmation"
  | "custom";

const templates: Record<TemplateKey, { subject: string; body: string }> = {
  ready: {
    subject: "Your Gami Gedara order is ready for pickup",
    body: `Hi {{name}},

Your order {{orderNumber}} is now ready for pickup.

Please visit Gami Gedara to collect your order.

Thank you.`,
  },
  reminder: {
    subject: "Pickup reminder for your Gami Gedara order",
    body: `Hi {{name}},

This is a friendly reminder about your order {{orderNumber}}.

Please collect it at your selected pickup time.

Thank you.`,
  },
  delay: {
    subject: "Update regarding your Gami Gedara order",
    body: `Hi {{name}},

We wanted to let you know that your order {{orderNumber}} is taking a little longer than expected.

We appreciate your patience and will update you shortly.

Thank you.`,
  },
  confirmation: {
    subject: "Your Gami Gedara order has been confirmed",
    body: `Hi {{name}},

Your order {{orderNumber}} has been confirmed successfully.

We will keep you updated if needed.

Thank you.`,
  },
  custom: {
    subject: "",
    body: "",
  },
};

function applyTemplate(
  text: string,
  values: { name: string; orderNumber: string }
) {
  return text
    .replaceAll("{{name}}", values.name || "Customer")
    .replaceAll("{{orderNumber}}", values.orderNumber || "your order");
}

export default function AdminMessagesPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [template, setTemplate] = useState<TemplateKey>("ready");
  const [subject, setSubject] = useState(templates.ready.subject);
  const [message, setMessage] = useState(templates.ready.body);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const preview = useMemo(() => {
    return applyTemplate(message, {
      name: customerName,
      orderNumber: orderNumber ? `#${orderNumber}` : "your order",
    });
  }, [message, customerName, orderNumber]);

  function handleTemplateChange(value: TemplateKey) {
    setTemplate(value);
    setSubject(templates[value].subject);
    setMessage(templates[value].body);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (!customerName.trim() || !customerEmail.trim()) {
      setResult("Please enter customer name and email.");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setResult("Please enter a subject and message.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          orderNumber,
          subject,
          message: preview,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult(data.error || "Failed to send message.");
        return;
      }

      setResult("Message sent successfully.");
    } catch (error) {
      console.error(error);
      setResult("Something went wrong while sending the message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Customer Messages
          </h1>
          <p className="mt-2 text-slate-600">
            Send direct email updates to customers from the admin dashboard.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSend}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  placeholder="Enter customer email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Customer Phone
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  placeholder="Optional phone number"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  placeholder="Optional order number"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Template
              </label>
              <select
                value={template}
                onChange={(e) =>
                  handleTemplateChange(e.target.value as TemplateKey)
                }
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="ready">Order Ready for Pickup</option>
                <option value="reminder">Pickup Reminder</option>
                <option value="delay">Order Delay Notice</option>
                <option value="confirmation">Order Confirmation</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Enter message subject"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Message
              </label>
              <textarea
                rows={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Write your message here"
              />
            </div>

            {result ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {result}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Message Preview
            </h2>

            <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  To
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {customerName || "Customer"}{" "}
                  {customerEmail ? `(${customerEmail})` : ""}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subject
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {subject || "No subject"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Body
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
                  {preview || "No message"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}