"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { services } from "@/lib/content";
import type { FieldErrors } from "@/lib/inquiries";
import { Arrow } from "./icons";

export function ContactForm({ available, initialService }: { available: boolean; initialService: string }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const startedAt = useRef<number | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || !available) return;
    const form = new FormData(event.currentTarget);
    setErrors({}); setStatus("sending"); setMessage("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(form), startedAt: startedAt.current, consent: form.get("consent") === "on" }), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.fields ?? {}); setMessage(result.error ?? "Unable to submit your inquiry. Please try again later."); setStatus("error");
        requestAnimationFrame(() => {
          const first = Object.keys(result.fields ?? {})[0];
          if (first) (formRef.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
          else statusRef.current?.focus();
        });
      } else { setMessage(result.message); setStatus("success"); requestAnimationFrame(() => statusRef.current?.focus()); }
    } catch {
      setStatus("error"); setMessage("We could not confirm delivery. Check your connection and try again. Retrying may send the same inquiry more than once."); requestAnimationFrame(() => statusRef.current?.focus());
    }
  }

  function errorProps(name: keyof FieldErrors) { return { "aria-invalid": !!errors[name], "aria-describedby": errors[name] ? `${name}-error` : undefined }; }
  function fieldError(name: keyof FieldErrors) { return errors[name] ? <span id={`${name}-error`} className="field-error">{errors[name]}</span> : null; }

  if (status === "success") return <div className="form-success" ref={statusRef} role="status" tabIndex={-1}><span className="success-mark" aria-hidden="true">✓</span><p className="small-label">Inquiry submitted</p><h2>Thank you for<br /><em>starting a conversation.</em></h2><p>{message}</p><p>We look forward to learning more about your strategic priorities.</p><Link href="/services" className="text-link">Explore our services <Arrow /></Link></div>;
  return <form ref={formRef} className="contact-form" onSubmit={onSubmit} onFocusCapture={() => { startedAt.current ??= Date.now(); }}>
    <div className="form-heading"><h2>Start a conversation.</h2><span className="fine-print">All fields required unless marked optional.</span></div>
    {!available && <div className="form-notice" role="status"><strong>Inquiries are not available yet.</strong><p>Email delivery is being configured. This form cannot send messages until setup is complete.</p></div>}
    <div className="form-row"><div className="form-field"><label htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your full name" {...errorProps("name")} />{fieldError("name")}</div><div className="form-field"><label htmlFor="company">Company</label><input id="company" name="company" autoComplete="organization" required minLength={2} maxLength={150} placeholder="Your organization" {...errorProps("company")} />{fieldError("company")}</div></div>
    <div className="form-row"><div className="form-field"><label htmlFor="email">Business email</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" {...errorProps("email")} />{fieldError("email")}</div><div className="form-field"><label htmlFor="phone">Phone number <span>(optional)</span></label><input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="Your phone number" {...errorProps("phone")} />{fieldError("phone")}</div></div>
    <div className="form-field"><label htmlFor="service">Service of interest</label><select id="service" name="service" required defaultValue={initialService} {...errorProps("service")}><option value="" disabled>Select a service</option>{services.map(s => <option value={s.id} key={s.id}>{s.title}</option>)}<option value="not-sure">I’m not sure yet</option></select>{fieldError("service")}</div>
    <div className="form-field"><label htmlFor="message">Tell us about your priorities</label><textarea id="message" name="message" required minLength={20} maxLength={5000} rows={6} placeholder="What competitive questions, challenges, or opportunities are you evaluating?" {...errorProps("message")} /><span className="fine-print">20–5,000 characters. Please do not include sensitive or confidential information.</span>{fieldError("message")}</div>
    <div className="form-trap" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    <label className="consent-label"><input name="consent" type="checkbox" required /><span>I have read the <Link href="/privacy">inquiry privacy information</Link> and agree that EDEN may use these details to respond to my inquiry.</span></label>
    <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className={status === "error" ? "form-error" : "form-status"}>{message}</div>
    <button className="button button-navy" type="submit" disabled={!available || status === "sending"}>{status === "sending" ? "Submitting inquiry…" : "Submit Inquiry"}<Arrow /></button>
  </form>;
}
