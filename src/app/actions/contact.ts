"use server";

import { site } from "@/lib/site";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "phone" | "interest" | "message", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: FormDataEntryValue | null, max = 500) {
  return String(v ?? "").trim().slice(0, max);
}

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: real users never fill this.
  if (clean(formData.get("company"))) {
    return { status: "success", message: "Thanks! We'll be in touch shortly." };
  }

  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 200);
  const phone = clean(formData.get("phone"), 40);
  const interest = clean(formData.get("interest"), 80);
  const message = clean(formData.get("message"), 3000);

  const errors: ContactState["errors"] = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (!interest) errors.interest = "Please choose what you're interested in.";
  if (message.length < 10) errors.message = "Tell us a little more (at least 10 characters).";

  if (Object.keys(errors).length) {
    return { status: "error", message: "Please fix the highlighted fields.", errors };
  }

  const subject = `New enquiry from ${name} · ${interest}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    `Interest: ${interest}`,
    "",
    message,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? site.email;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Racine Wellness <onboarding@resend.dev>";

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
    return {
      status: "error",
      message: `Something went wrong sending your message. Please email ${site.email} directly.`,
    };
  }

  return {
    status: "success",
    message: `Thanks ${name.split(" ")[0]}! Your message is on its way. Expect a reply within one business day.`,
  };
}
