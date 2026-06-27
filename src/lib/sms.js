const SMS_RETRY_ATTEMPTS = 2;

export function normalizePhoneNumber(phone) {
  const value = `${phone || ""}`.trim().replace(/[^0-9+]/g, "");
  if (!value) return "";
  if (value.startsWith("+")) {
    return value.replace(/^\+/, "");
  }
  if (value.startsWith("880")) return value;
  if (value.startsWith("01")) return `88${value}`;
  return value;
}

export function isSuccessfulSmsResponse(payload) {
  if (typeof payload === "string") {
    const normalized = payload.trim().toLowerCase();
    return ["success", "ok", "100", "sent", "true"].includes(normalized);
  }
  if (payload && typeof payload === "object") {
    return payload.status === "success" || payload.success === true || payload.code === 100 || payload.code === "100";
  }
  return false;
}

function buildOtpMessage(code) {
  return `Your BidLive verification code is ${code}. It expires in 5 minutes. Do not share this code.`;
}

async function sendViaBulkSms(phone, message) {
  const apiKey = process.env.BULK_SMS_API_KEY?.trim();
  const senderId = process.env.BULK_SMS_SENDER_ID?.trim();
  const endpoint = process.env.BULK_SMS_ENDPOINT?.trim();

  if (!apiKey || !senderId) {
    return { provider: "mock", status: "mock" };
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const targetUrl = new URL(endpoint || "https://api.bulksmsbd.com/smsapi");
  targetUrl.searchParams.set("api_key", apiKey);
  targetUrl.searchParams.set("type", "text");
  targetUrl.searchParams.set("number", normalizedPhone);
  targetUrl.searchParams.set("senderid", senderId);
  targetUrl.searchParams.set("message", message);

  const response = await fetch(targetUrl.toString(), {
    method: "GET",
    headers: { Accept: "application/json", "User-Agent": "BidLive/1.0" },
  });

  const rawText = await response.text();
  let parsed = {};
  try {
    parsed = rawText ? JSON.parse(rawText) : {};
  } catch {
    parsed = { raw: rawText };
  }

  if (!response.ok) {
    throw new Error(parsed?.message || "Bulk SMS provider rejected the request");
  }

  const success = isSuccessfulSmsResponse(parsed) || isSuccessfulSmsResponse(rawText);
  if (!success) {
    throw new Error(parsed?.message || parsed?.detail || rawText || "Bulk SMS provider returned an unsuccessful response");
  }

  return { provider: "bulksmsbd", status: "sent", response: parsed };
}

export const smsService = {
  async sendOtp(phone, code) {
    const message = buildOtpMessage(code);
    for (let attempt = 1; attempt <= SMS_RETRY_ATTEMPTS; attempt += 1) {
      try {
        return await sendViaBulkSms(phone, message);
      } catch (error) {
        if (attempt === SMS_RETRY_ATTEMPTS) {
          console.error("[SMS] failed after retries", error.message);
          return { provider: "mock", status: "mock", error: error.message };
        }
      }
    }
    return { provider: "mock", status: "mock" };
  },
};

export async function sendOtpSms(phone, code) {
  return smsService.sendOtp(phone, code);
}
