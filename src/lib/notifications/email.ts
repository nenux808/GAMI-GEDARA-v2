import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY in environment variables");
  }

  return new Resend(apiKey);
}

type OrderEmailItem = {
  name: string;
  quantity: number;
  lineTotal: number;
};

type CustomerOrderEmailArgs = {
  customerName: string;
  customerEmail: string;
  orderNumber: number;
  totalAmount: number;
  items: OrderEmailItem[];
};

type OrganizerOrderEmailArgs = {
  customerName: string;
  customerEmail: string;
  orderNumber: number;
  totalAmount: number;
  items: OrderEmailItem[];
};

type CounterOrderVerificationEmailArgs = {
  customerName: string;
  customerEmail: string;
  orderNumber: number;
  totalAmount: number;
  pickupTime: string;
  items: OrderEmailItem[];
  verificationUrl: string;
};

function formatCurrency(value: number) {
  return `$${Number(value).toFixed(2)}`;
}

function formatOrderCode(orderNumber: number) {
  return `GAMI-ORDER-${String(orderNumber).padStart(5, "0")}`;
}

function formatPickupTime(value: string) {
  try {
    return new Date(value).toLocaleString("en-AU", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function buildItemsRows(items: OrderEmailItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px;">
            ${item.name}
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 14px; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 700;">
            ${formatCurrency(item.lineTotal)}
          </td>
        </tr>
      `
    )
    .join("");
}

export async function sendCustomerOrderEmail({
  customerName,
  customerEmail,
  orderNumber,
  totalAmount,
  items,
}: CustomerOrderEmailArgs) {
  const resend = getResend();
  const orderCode = formatOrderCode(orderNumber);

  return await resend.emails.send({
    from: process.env.ORDER_FROM_EMAIL!,
    to: customerEmail,
    subject: `${orderCode} • Your Gami Gedara order is confirmed`,
    html: `
      <div style="margin:0; padding:0; background:#fffaf3; font-family:Arial,Helvetica,sans-serif; color:#0f172a;">
        <div style="max-width:700px; margin:0 auto; padding:32px 20px;">
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:24px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.06);">
            
            <div style="background:linear-gradient(135deg,#fef3c7 0%,#ffedd5 100%); padding:32px 30px;">
              <div style="display:inline-block; background:#ffffff; color:#92400e; border-radius:999px; padding:8px 14px; font-size:12px; font-weight:700; letter-spacing:.04em;">
                GAMI GEDARA
              </div>

              <h1 style="margin:18px 0 8px; font-size:28px; line-height:1.2; color:#0f172a;">
                Order Confirmed
              </h1>

              <p style="margin:0; font-size:15px; line-height:1.7; color:#475569;">
                Hi ${customerName}, thank you for ordering with Gami Gedara. Your payment was received successfully and your order is now confirmed.
              </p>
            </div>

            <div style="padding:30px;">
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:20px 22px; margin-bottom:24px;">
                <table style="width:100%; border-collapse:collapse;">
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Order Number</td>
                    <td style="padding:6px 0; color:#0f172a; font-size:14px; font-weight:800; text-align:right;">
                      ${orderCode}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Restaurant</td>
                    <td style="padding:6px 0; color:#0f172a; font-size:14px; font-weight:700; text-align:right;">
                      Gami Gedara
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Payment Status</td>
                    <td style="padding:6px 0; color:#166534; font-size:14px; font-weight:700; text-align:right;">
                      Paid
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Total</td>
                    <td style="padding:6px 0; color:#0f172a; font-size:18px; font-weight:800; text-align:right;">
                      ${formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </table>
              </div>

              <h2 style="margin:0 0 14px; font-size:18px; color:#0f172a;">
                Order Summary
              </h2>

              <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
                <thead>
                  <tr>
                    <th style="padding:0 0 10px; text-align:left; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.04em;">
                      Item
                    </th>
                    <th style="padding:0 0 10px; text-align:center; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.04em;">
                      Qty
                    </th>
                    <th style="padding:0 0 10px; text-align:right; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.04em;">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemsRows(items)}
                </tbody>
              </table>

              <div style="background:#fefce8; border:1px solid #fde68a; border-radius:18px; padding:16px 18px; margin-bottom:24px;">
                <p style="margin:0; font-size:14px; line-height:1.7; color:#854d0e;">
                  Our team will begin preparing your order shortly. If we need anything, we will contact you directly.
                </p>
              </div>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:18px 20px;">
                <h3 style="margin:0 0 10px; font-size:16px; color:#0f172a;">
                  Contact Gami Gedara
                </h3>
                <p style="margin:0 0 6px; font-size:14px; color:#475569;">
                  Phone: <strong style="color:#0f172a;">+61 450 918 448</strong>
                </p>
                <p style="margin:0; font-size:14px; color:#475569;">
                  Email: <strong style="color:#0f172a;">${process.env.ORGANIZER_EMAIL ?? "gamigedaraadmin@gmail.com"}</strong>
                </p>
              </div>

              <p style="margin:24px 0 0; font-size:14px; line-height:1.8; color:#475569;">
                Thank you for choosing <strong style="color:#0f172a;">Gami Gedara</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendOrganizerOrderEmail({
  customerName,
  customerEmail,
  orderNumber,
  totalAmount,
  items,
}: OrganizerOrderEmailArgs) {
  const resend = getResend();
  const orderCode = formatOrderCode(orderNumber);

  return await resend.emails.send({
    from: process.env.ORDER_FROM_EMAIL!,
    to: process.env.ORGANIZER_EMAIL!,
    subject: `${orderCode} • New paid order`,
    html: `
      <div style="margin:0; padding:0; background:#f8fafc; font-family:Arial,Helvetica,sans-serif; color:#0f172a;">
        <div style="max-width:700px; margin:0 auto; padding:32px 20px;">
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:24px; overflow:hidden;">
            <div style="background:#0f172a; padding:28px 30px;">
              <p style="margin:0; color:#cbd5e1; font-size:12px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;">
                Gami Gedara • New Paid Order
              </p>
              <h1 style="margin:10px 0 0; color:#ffffff; font-size:26px; line-height:1.2;">
                ${orderCode}
              </h1>
            </div>

            <div style="padding:30px;">
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:20px 22px; margin-bottom:24px;">
                <table style="width:100%; border-collapse:collapse;">
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Customer</td>
                    <td style="padding:6px 0; color:#0f172a; font-size:14px; font-weight:700; text-align:right;">
                      ${customerName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Email</td>
                    <td style="padding:6px 0; color:#0f172a; font-size:14px; font-weight:700; text-align:right;">
                      ${customerEmail}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Order Number</td>
                    <td style="padding:6px 0; color:#0f172a; font-size:14px; font-weight:800; text-align:right;">
                      ${orderCode}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Total</td>
                    <td style="padding:6px 0; color:#0f172a; font-size:18px; font-weight:800; text-align:right;">
                      ${formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </table>
              </div>

              <h2 style="margin:0 0 14px; font-size:18px; color:#0f172a;">
                Items
              </h2>

              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="padding:0 0 10px; text-align:left; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.04em;">
                      Item
                    </th>
                    <th style="padding:0 0 10px; text-align:center; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.04em;">
                      Qty
                    </th>
                    <th style="padding:0 0 10px; text-align:right; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.04em;">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemsRows(items)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendCounterOrderVerificationEmail({
  customerName,
  customerEmail,
  orderNumber,
  totalAmount,
  pickupTime,
  items,
  verificationUrl,
}: CounterOrderVerificationEmailArgs) {
  const resend = getResend();
  const orderCode = formatOrderCode(orderNumber);

  return await resend.emails.send({
    from: process.env.ORDER_FROM_EMAIL!,
    to: customerEmail,
    subject: `${orderCode} • Confirm your Gami Gedara order`,
    html: `
      <div style="margin:0; padding:0; background:#fffaf3; font-family:Arial,Helvetica,sans-serif; color:#0f172a;">
        <div style="max-width:700px; margin:0 auto; padding:32px 20px;">
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:24px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.06);">

            <div style="background:linear-gradient(135deg,#fef3c7 0%,#ffedd5 100%); padding:32px 30px;">
              <div style="display:inline-block; background:#ffffff; color:#92400e; border-radius:999px; padding:8px 14px; font-size:12px; font-weight:700; letter-spacing:.04em;">
                GAMI GEDARA
              </div>

              <h1 style="margin:18px 0 8px; font-size:28px; line-height:1.2; color:#0f172a;">
                Confirm Your Order
              </h1>

              <p style="margin:0; font-size:15px; line-height:1.7; color:#475569;">
                Hi ${customerName}, thanks for choosing Pay at Counter. Please confirm your order to activate it.
              </p>
            </div>

            <div style="padding:30px;">
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:20px 22px; margin-bottom:24px;">
                <table style="width:100%; border-collapse:collapse;">
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Order Number</td>
                    <td style="padding:6px 0; color:#0f172a; font-size:14px; font-weight:800; text-align:right;">
                      ${orderCode}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Payment Method</td>
                    <td style="padding:6px 0; color:#92400e; font-size:14px; font-weight:700; text-align:right;">
                      Pay at Counter
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Pickup Time</td>
                    <td style="padding:6px 0; color:#0f172a; font-size:14px; font-weight:700; text-align:right;">
                      ${formatPickupTime(pickupTime)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#64748b; font-size:14px;">Total</td>
                    <td style="padding:6px 0; color:#0f172a; font-size:18px; font-weight:800; text-align:right;">
                      ${formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </table>
              </div>

              <h2 style="margin:0 0 14px; font-size:18px; color:#0f172a;">
                Order Summary
              </h2>

              <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
                <thead>
                  <tr>
                    <th style="padding:0 0 10px; text-align:left; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.04em;">
                      Item
                    </th>
                    <th style="padding:0 0 10px; text-align:center; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.04em;">
                      Qty
                    </th>
                    <th style="padding:0 0 10px; text-align:right; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.04em;">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemsRows(items)}
                </tbody>
              </table>

              <div style="background:#fefce8; border:1px solid #fde68a; border-radius:18px; padding:16px 18px; margin-bottom:24px;">
                <p style="margin:0; font-size:14px; line-height:1.7; color:#854d0e;">
                  Your order will only be accepted after you confirm it. This confirmation link should be used soon before it expires.
                </p>
              </div>

              <div style="text-align:center; margin-bottom:24px;">
                <a
                  href="${verificationUrl}"
                  style="display:inline-block; background:#0f172a; color:#ffffff; text-decoration:none; font-size:15px; font-weight:700; padding:14px 24px; border-radius:14px;"
                >
                  Confirm My Order
                </a>
              </div>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:18px 20px;">
                <h3 style="margin:0 0 10px; font-size:16px; color:#0f172a;">
                  Need help?
                </h3>
                <p style="margin:0 0 6px; font-size:14px; color:#475569;">
                  Phone: <strong style="color:#0f172a;">+61 450 918 448</strong>
                </p>
                <p style="margin:0; font-size:14px; color:#475569;">
                  Email: <strong style="color:#0f172a;">${process.env.ORGANIZER_EMAIL ?? "gamigedaraadmin@gmail.com"}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  });
}