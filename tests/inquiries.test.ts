import test from "node:test";
import assert from "node:assert/strict";
import { createInquiryHandler, getInquiryConfig, validateInquiry } from "../src/lib/inquiries.ts";

const now = 1800000000000;
const valid = { name: "Test Person", company: "Test Organization", email: "person@example.test", phone: "", service: "competitive-intelligence", message: "We are evaluating a new market and would like to understand the competitive landscape.", website: "", startedAt: now - 5000, consent: true };
const config = { apiKey: "test-only-not-a-real-key", from: "sender@example.test", to: "recipient@example.test" };
const request = (body: unknown = valid, extraHeaders: Record<string, string> = {}) => new Request("https://eden.example.test/api/contact", { method: "POST", headers: { "content-type": "application/json", origin: "https://eden.example.test", ...extraHeaders }, body: JSON.stringify(body) });

test("validation requires real fields and rejects invalid service identifiers", () => {
  assert.deepEqual(validateInquiry(valid).errors, {});
  const result = validateInquiry({ ...valid, name: " ", company: 23, email: "bad\r\nBcc:other@example.test", phone: "abc", service: "unknown", message: "short" });
  assert.deepEqual(Object.keys(result.errors), ["name", "company", "email", "phone", "service", "message"]);
  assert.equal(validateInquiry({ ...valid, company: "  Test Organization  " }).data.company, "Test Organization");
});
test("configuration stays unavailable until all server-only requirements are present and valid", () => {
  assert.equal(getInquiryConfig({}), null);
  assert.equal(getInquiryConfig({ RESEND_API_KEY: "test", CONTACT_FROM_EMAIL: "not-an-email", CONTACT_TO_EMAIL: "recipient@example.test" }), null);
  assert.deepEqual(getInquiryConfig({ RESEND_API_KEY: "test", CONTACT_FROM_EMAIL: "sender@example.test", CONTACT_TO_EMAIL: "recipient@example.test" }), { apiKey: "test", from: "sender@example.test", to: "recipient@example.test" });
});
test("valid submission reaches email transport with plain-text content and reply-to", async () => {
  let sent = false;
  const send: typeof fetch = async (url, init) => {
    sent = true;
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(init?.method, "POST");
    const payload = JSON.parse(String(init?.body));
    assert.equal(payload.reply_to, valid.email);
    assert.deepEqual(payload.to, [config.to]);
    assert.ok(payload.text.includes(valid.message));
    assert.equal(payload.html, undefined);
    return Response.json({ id: "test-delivery-receipt" });
  };
  const handler = createInquiryHandler({ config: () => config, now: () => now, send });
  const response = await handler(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match((await response.json()).message, /submitted/);
  assert.equal(sent, true);
});
test("missing configuration returns an honest unavailable response", async () => {
  const handler = createInquiryHandler({ config: () => null, now: () => now });
  const response = await handler(request());
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /not been sent/);
});
test("cross-origin, honeypot, timing, consent and invalid fields are rejected before delivery", async () => {
  let sent = false;
  const handler = createInquiryHandler({ config: () => config, now: () => now, send: async () => { sent = true; return Response.json({ id: "unused" }); } });
  assert.equal((await handler(request(valid, { origin: "https://untrusted.example.test" }))).status, 403);
  assert.equal((await handler(request({ ...valid, website: "spam" }))).status, 400);
  assert.equal((await handler(request({ ...valid, startedAt: now - 100 }))).status, 400);
  assert.equal((await handler(request({ ...valid, consent: false }))).status, 400);
  const invalid = await handler(request({ ...valid, email: "bad" }));
  assert.equal(invalid.status, 422);
  assert.ok((await invalid.json()).fields.email);
  assert.equal(sent, false);
});
test("rate limiting blocks the sixth attempt and expires after its window", async () => {
  let time = now;
  const handler = createInquiryHandler({ config: () => null, now: () => time });
  for (let i = 0; i < 5; i++) assert.equal((await handler(request())).status, 503);
  const blocked = await handler(request());
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get("retry-after"), "900");
  time += 901000;
  assert.equal((await handler(request({ ...valid, startedAt: time - 5000 }))).status, 503);
});
test("malformed, non-JSON and oversized requests are rejected", async () => {
  const handler = createInquiryHandler({ now: () => now });
  assert.equal((await handler(new Request("https://eden.example.test/api/contact", { method: "POST", body: "bad", headers: { "content-type": "application/json" } }))).status, 400);
  assert.equal((await handler(request(valid, { "content-type": "text/plain" }))).status, 415);
  assert.equal((await handler(request({ ...valid, message: "a".repeat(17000) }))).status, 413);
  assert.equal((await handler(request([]))).status, 400);
});
test("provider rejection, timeout and invalid receipts never produce success", async () => {
  for (const send of [
    async () => Response.json({ message: "rejected" }, { status: 403 }),
    async () => { throw new Error("network timeout"); },
    async () => Response.json({}),
  ]) {
    const handler = createInquiryHandler({ config: () => config, now: () => now, send });
    const response = await handler(request());
    assert.equal(response.status, 502);
    assert.ok((await response.json()).error);
  }
});
