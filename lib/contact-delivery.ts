/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONTACT DELIVERY — plug your email provider in here.
 *
 *  Out of the box two providers work with only environment variables:
 *    • Resend    → set RESEND_API_KEY (+ CONTACT_FROM_EMAIL on a verified domain)
 *    • Formspree → set FORMSPREE_ENDPOINT (e.g. https://formspree.io/f/abcd1234)
 *
 *  SMTP (Gmail, Zoho, etc.): `npm i nodemailer` and replace `deliverViaSmtp`
 *  below with the commented example.
 *
 *  With nothing configured, development logs the enquiry to the server console
 *  and reports success; production returns an error so no lead is silently lost.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ContactData } from "./contact-schema";
import { site } from "@/content/site";

export type DeliveryResult = { ok: true; provider: string } | { ok: false; error: string };

const TO = process.env.CONTACT_TO_EMAIL || site.contact.email;

function plainText(d: ContactData) {
  return [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone || "—"}`,
    `Company: ${d.company || "—"}`,
    `Project type: ${d.projectType}`,
    `Budget: ${d.budget}`,
    "",
    d.message,
  ].join("\n");
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

async function deliverViaResend(d: ContactData, apiKey: string): Promise<DeliveryResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "SVR Tech Groups Website <onboarding@resend.dev>",
      to: [TO],
      reply_to: d.email,
      subject: `New enquiry: ${d.projectType} — ${d.name}`,
      text: plainText(d),
      html: `<pre style="font:14px/1.6 ui-monospace,monospace;white-space:pre-wrap">${escapeHtml(plainText(d))}</pre>`,
    }),
  });
  if (!res.ok) return { ok: false, error: `Resend responded ${res.status}` };
  return { ok: true, provider: "resend" };
}

async function deliverViaFormspree(d: ContactData, endpoint: string): Promise<DeliveryResult> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      ...d,
      _replyto: d.email,
      _subject: `New enquiry: ${d.projectType} — ${d.name}`,
    }),
  });
  if (!res.ok) return { ok: false, error: `Formspree responded ${res.status}` };
  return { ok: true, provider: "formspree" };
}

/*
 * SMTP example (after `npm i nodemailer` + `npm i -D @types/nodemailer`):
 *
 * import nodemailer from "nodemailer";
 * async function deliverViaSmtp(d: ContactData): Promise<DeliveryResult> {
 *   const transport = nodemailer.createTransport({
 *     host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 465), secure: true,
 *     auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
 *   });
 *   await transport.sendMail({ from: process.env.SMTP_USER, to: TO, replyTo: d.email,
 *     subject: `New enquiry: ${d.projectType} — ${d.name}`, text: plainText(d) });
 *   return { ok: true, provider: "smtp" };
 * }
 */

export async function deliverContact(d: ContactData): Promise<DeliveryResult> {
  // ▼▼▼ PLUG IN YOUR PROVIDER HERE ▼▼▼
  if (process.env.RESEND_API_KEY) return deliverViaResend(d, process.env.RESEND_API_KEY);
  if (process.env.FORMSPREE_ENDPOINT) return deliverViaFormspree(d, process.env.FORMSPREE_ENDPOINT);
  // return deliverViaSmtp(d);
  // ▲▲▲ PLUG IN YOUR PROVIDER HERE ▲▲▲

  if (process.env.NODE_ENV !== "production") {
    console.info(
      "[contact] No provider configured — enquiry logged instead of sent:\n" + plainText(d),
    );
    return { ok: true, provider: "console" };
  }
  return { ok: false, error: "Contact delivery is not configured" };
}
