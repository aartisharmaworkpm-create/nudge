import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export type SendEmailParams = {
  to: string;
  subject: string;
  body: string;
  fromName: string;           // e.g. "Meridian Studio"
  fromEmail?: string;         // e.g. "hello@meridianstudio.com" — falls back to ENV default
  replyTo?: string;
  messageId: string;          // for tracking
};

export type SendEmailResult =
  | { success: true; externalId: string }
  | { success: false; error: string };

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const from = params.fromEmail
    ? `${params.fromName} <${params.fromEmail}>`
    : `${params.fromName} <${process.env.EMAIL_FROM ?? "reminders@nudge.so"}>`;

  // Convert plain text body to simple HTML
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6;">
      ${params.body
        .split("\n")
        .map((line) => line.trim() ? `<p style="margin: 0 0 12px 0;">${escapeHtml(line)}</p>` : "<br>")
        .join("")}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Sent via <a href="https://nudge.so" style="color: #9ca3af;">Nudge</a> on behalf of ${escapeHtml(params.fromName)}.
        To stop receiving these reminders, please contact ${escapeHtml(params.fromName)} directly.
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html,
      text: params.body,
      replyTo: params.replyTo ?? from,
      headers: {
        "X-Nudge-Message-Id": params.messageId,
      },
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, externalId: result.data!.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Subject lines per tone/step
export function buildSubjectLine(
  businessName: string,
  step: number,
  tone: string,
  invoiceRef?: string
): string {
  const ref = invoiceRef ? ` — Invoice ${invoiceRef}` : "";
  if (tone === "FRIENDLY") {
    if (step === 1) return `Quick note about your invoice${ref} from ${businessName}`;
    if (step === 2) return `Following up on your invoice${ref}`;
    return `Final note regarding your invoice${ref}`;
  }
  if (tone === "FIRM") {
    if (step === 1) return `Invoice overdue${ref} — ${businessName}`;
    if (step === 2) return `Second reminder: invoice overdue${ref}`;
    return `Urgent: overdue invoice${ref}`;
  }
  // FINAL
  return `Final notice: invoice${ref} — action required`;
}
