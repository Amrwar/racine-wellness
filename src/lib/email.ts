import { site } from "./site";
import { notifyEmail } from "./business";

/** Sends a plain-text email through Resend. Returns false (and logs) instead of throwing. */
export async function sendEmail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL ?? `${site.name} <onboarding@resend.dev>`;
  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY not set. Would send to ${to}: ${subject}\n${text}`);
    return true;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], ...(replyTo && { reply_to: replyTo }), subject, text }),
    });
    if (!res.ok) {
      console.error("[email] Resend error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

/** Where business notifications go. */
export const ownerEmail = notifyEmail;
