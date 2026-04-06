// WhatsApp Business API via Meta Cloud API (direct) or BSP (360dialog / Twilio)
// This implementation targets the Meta Cloud API format, which all BSPs expose.

export type SendWhatsAppParams = {
  to: string;         // E.164 format, e.g. +447700900000
  body: string;
  messageId: string;  // for tracking
};

export type SendWhatsAppResult =
  | { success: true; externalId: string }
  | { success: false; error: string };

/**
 * Send a WhatsApp message via the Meta Cloud API.
 *
 * Required env vars:
 *   WHATSAPP_API_URL          — e.g. https://graph.facebook.com/v18.0
 *   WHATSAPP_PHONE_NUMBER_ID  — numeric phone number ID from Meta
 *   WHATSAPP_API_KEY          — permanent system user access token
 */
export async function sendWhatsApp(params: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const apiUrl = process.env.WHATSAPP_API_URL ?? "https://graph.facebook.com/v18.0";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!phoneNumberId || !apiKey) {
    return { success: false, error: "WhatsApp credentials not configured." };
  }

  // Normalise number — strip spaces and ensure + prefix
  const to = normaliseNumber(params.to);
  if (!to) return { success: false, error: `Invalid WhatsApp number: ${params.to}` };

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      preview_url: false,
      body: params.body,
    },
  };

  try {
    const res = await fetch(`${apiUrl}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Nudge-Message-Id": params.messageId,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as {
      messages?: { id: string }[];
      error?: { message: string; code: number };
    };

    if (!res.ok || data.error) {
      return { success: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }

    const externalId = data.messages?.[0]?.id ?? "unknown";
    return { success: true, externalId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

function normaliseNumber(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, "");
  if (!/^\+?\d{7,15}$/.test(cleaned)) return null;
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}
