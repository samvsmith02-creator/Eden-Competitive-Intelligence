import { createHash, randomBytes } from "node:crypto";
import { services } from "./content.ts";

const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const allowedServices = new Set([...services.map(s => s.id), "not-sure"]);
const fields = ["name", "company", "email", "phone", "service", "message"] as const;
type Field = typeof fields[number];
export type Inquiry = Record<Field, string>;
export type FieldErrors = Partial<Record<Field, string>>;
type Config = { apiKey: string; from: string; to: string };

export function getInquiryConfig(env: Record<string, string | undefined> = process.env): Config | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.CONTACT_FROM_EMAIL?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim();
  return apiKey && from && to && emailPattern.test(from) && emailPattern.test(to) ? { apiKey, from, to } : null;
}

export function validateInquiry(input: Record<string, unknown>): { data: Inquiry; errors: FieldErrors } {
  const data = Object.fromEntries(fields.map(field => [field, typeof input[field] === "string" ? input[field].trim() : ""])) as Inquiry;
  const errors: FieldErrors = {};
  if (data.name.length < 2 || data.name.length > 100 || /[\r\n]/.test(data.name)) errors.name = "Enter your full name (2–100 characters).";
  if (data.company.length < 2 || data.company.length > 150) errors.company = "Enter your company name (2–150 characters).";
  if (!emailPattern.test(data.email) || data.email.length > 254) errors.email = "Enter a valid business email address.";
  if (data.phone && (!/^[+()\d\s.\-ext]+$/i.test(data.phone) || data.phone.length > 40 || data.phone.replace(/\D/g, "").length < 7)) errors.phone = "Enter a valid phone number, or leave this field blank.";
  if (!allowedServices.has(data.service)) errors.service = "Select a service, or choose ‘I’m not sure yet’.";
  if (data.message.length < 20 || data.message.length > 5000) errors.message = "Tell us about your priorities in 20–5,000 characters.";
  return { data, errors };
}

export function createInquiryHandler(options: {
  config?: () => Config | null;
  send?: typeof fetch;
  now?: () => number;
} = {}) {
  const attempts = new Map<string, { count: number; expires: number }>();
  const salt = randomBytes(16).toString("hex");
  const now = options.now ?? Date.now;
  const respond = (body: object, status: number, headers: Record<string, string> = {}) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

  return async function handle(request: Request): Promise<Response> {
    const origin = request.headers.get("origin");
    if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") return respond({ error: "Please submit the form from this website." }, 403);
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return respond({ error: "Unsupported submission format." }, 415);

    // Vercel supplies this header. Other hosting must strip untrusted forwarded headers.
    const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const key = createHash("sha256").update(salt + address).digest("hex");
    const timestamp = now();
    for (const [id, value] of attempts) if (value.expires <= timestamp) attempts.delete(id);
    const record = attempts.get(key);
    if (record && record.count >= 5) return respond({ error: "Too many attempts. Please wait 15 minutes before trying again." }, 429, { "Retry-After": String(Math.max(1, Math.ceil((record.expires - timestamp) / 1000))) });
    if (!record && attempts.size >= 10000) return respond({ error: "The inquiry service is busy. Please try again later." }, 503);
    attempts.set(key, { count: (record?.count ?? 0) + 1, expires: record?.expires ?? timestamp + 15 * 60 * 1000 });

    if (Number(request.headers.get("content-length") || 0) > 16384) return respond({ error: "Your submission is too large." }, 413);
    let input: Record<string, unknown>;
    try {
      const reader = request.body?.getReader();
      if (!reader) return respond({ error: "Your submission is empty." }, 400);
      const decoder = new TextDecoder();
      let body = "";
      let bytes = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > 16384) { await reader.cancel(); return respond({ error: "Your submission is too large." }, 413); }
          body += decoder.decode(value, { stream: true });
        }
        body += decoder.decode();
      } finally { reader.releaseLock(); }
      const parsed: unknown = JSON.parse(body);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return respond({ error: "Invalid form submission." }, 400);
      input = parsed as Record<string, unknown>;
    } catch { return respond({ error: "Invalid form submission. Please try again." }, 400); }

    if (input.website) return respond({ error: "Unable to accept this submission." }, 400);
    if (typeof input.startedAt !== "number" || timestamp - input.startedAt < 1500 || timestamp - input.startedAt > 24 * 60 * 60 * 1000) return respond({ error: "Please take a moment to review the form, then submit again. If this page has been open for a day, refresh it first." }, 400);
    if (input.consent !== true) return respond({ error: "Please acknowledge the inquiry privacy information." }, 400);
    const { data, errors } = validateInquiry(input);
    if (Object.keys(errors).length) return respond({ error: "Please check the highlighted fields.", fields: errors }, 422);
    const config = options.config ? options.config() : getInquiryConfig();
    if (!config) return respond({ error: "Inquiry delivery is not configured yet. Your message has not been sent. Please return when the form is available." }, 503);
    const service = services.find(s => s.id === data.service)?.title ?? "General consultation";
    try {
      const result = await (options.send ?? fetch)("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ from: config.from, to: [config.to], reply_to: data.email, subject: `EDEN consultation inquiry: ${service}`, text: `Name: ${data.name}\nCompany: ${data.company}\nBusiness email: ${data.email}\nPhone: ${data.phone || "Not provided"}\nService: ${service}\n\nMessage:\n${data.message}` }),
      });
      if (!result.ok) return respond({ error: "Your inquiry could not be delivered. Please try again later. No confirmation has been sent." }, 502);
      const receipt: unknown = await result.json();
      if (!receipt || typeof receipt !== "object" || !("id" in receipt) || typeof receipt.id !== "string" || !receipt.id) throw new Error("Missing delivery receipt");
      return respond({ message: "Thank you. Your inquiry has been submitted to EDEN’s email service for delivery." }, 200);
    } catch { return respond({ error: "Delivery could not be confirmed. Please try again later. If you retry, your inquiry may be received more than once." }, 502); }
  };
}
