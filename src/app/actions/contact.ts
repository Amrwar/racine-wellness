"use server";

import { site } from "@/lib/site";
import { fill, getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: FormDataEntryValue | null, max = 500) {
  return String(v ?? "").trim().slice(0, max);
}

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const rawLocale = clean(formData.get("locale"), 5);
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const t = getDictionary(locale).form;

  // Honeypot: real users never fill this.
  if (clean(formData.get("company"))) {
    return { status: "success", message: fill(t.success, { name: "" }) };
  }

  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 200);
  const phone = clean(formData.get("phone"), 40);
  const wantsReceipt = formData.get("receipt") === "yes";
  const message = clean(formData.get("message"), 3000);

  const errors: ContactState["errors"] = {};
  if (name.length < 2) errors.name = t.errors.name;
  if (!EMAIL_RE.test(email)) errors.email = t.errors.email;
  if (message.length < 10) errors.message = t.errors.message;

  if (Object.keys(errors).length) {
    return { status: "error", message: t.fixFields, errors };
  }

  const subject = `New enquiry from ${name} [${locale.toUpperCase()}]`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    `Insurance receipt: ${wantsReceipt ? "Yes" : "No"}`,
    `Language: ${locale === "fr" ? "Français" : "English"}`,
    "",
    message,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? site.email;
  const from = process.env.CONTACT_FROM_EMAIL ?? `${site.name} <onboarding@resend.dev>`;

  try {
    if (apiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [to], reply_to: email, subject, text }),
      });
      if (!res.ok) {
        console.error("Resend error", res.status, await res.text());
        throw new Error("mail_failed");
      }
    } else {
      // No email provider configured yet: log so nothing is lost during development.
      console.log("[contact] RESEND_API_KEY not set. Enquiry received:\n" + text);
    }
  } catch (err) {
    console.error(err);
    return { status: "error", message: fill(t.failed, { email: site.email }) };
  }

  return {
    status: "success",
    message: fill(t.success, { name: name.split(" ")[0] }),
  };
}
