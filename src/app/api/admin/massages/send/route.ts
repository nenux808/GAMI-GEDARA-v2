import { NextResponse } from "next/server";
import { Resend } from "resend";

type SendMessageBody = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderNumber?: string;
  subject: string;
  message: string;
};

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  return new Resend(apiKey);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendMessageBody;

    if (!body.customerName?.trim() || !body.customerEmail?.trim()) {
      return NextResponse.json(
        { error: "Customer name and email are required." },
        { status: 400 }
      );
    }

    if (!body.subject?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { error: "Subject and message are required." },
        { status: 400 }
      );
    }

    const resend = getResend();

    const result = await resend.emails.send({
      from: process.env.ORDER_FROM_EMAIL!,
      to: body.customerEmail,
      subject: body.subject,
      html: `
        <div style="margin:0; padding:0; background:#f8fafc; font-family:Arial,Helvetica,sans-serif; color:#0f172a;">
          <div style="max-width:700px; margin:0 auto; padding:32px 20px;">
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:24px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.06);">
              <div style="background:linear-gradient(135deg,#fef3c7 0%,#ffedd5 100%); padding:32px 30px;">
                <div style="display:inline-block; background:#ffffff; color:#92400e; border-radius:999px; padding:8px 14px; font-size:12px; font-weight:700; letter-spacing:.04em;">
                  GAMI GEDARA
                </div>

                <h1 style="margin:18px 0 8px; font-size:26px; line-height:1.2; color:#0f172a;">
                  ${body.subject}
                </h1>

                <p style="margin:0; font-size:15px; line-height:1.7; color:#475569;">
                  Hi ${body.customerName},
                </p>
              </div>

              <div style="padding:30px;">
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:20px;">
                  <pre style="margin:0; white-space:pre-wrap; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.8; color:#334155;">${body.message}</pre>
                </div>

                ${
                  body.orderNumber
                    ? `
                  <div style="margin-top:20px; background:#fff7ed; border:1px solid #fdba74; border-radius:18px; padding:16px 18px;">
                    <p style="margin:0; font-size:14px; color:#9a3412;">
                      Order Number: <strong>#${body.orderNumber}</strong>
                    </p>
                  </div>
                `
                    : ""
                }

                <div style="margin-top:24px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:18px 20px;">
                  <h3 style="margin:0 0 10px; font-size:16px; color:#0f172a;">
                    Contact Gami Gedara
                  </h3>
                  <p style="margin:0 0 6px; font-size:14px; color:#475569;">
                    Phone: <strong style="color:#0f172a;">+61 450 918 448</strong>
                  </p>
                  <p style="margin:0; font-size:14px; color:#475569;">
                    Email: <strong style="color:#0f172a;">${
                      process.env.ORGANIZER_EMAIL ?? "gamigedaraadmin@gmail.com"
                    }</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Customer message sent successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Admin message send error:", error);
    return NextResponse.json(
      { error: "Failed to send customer message." },
      { status: 500 }
    );
  }
}