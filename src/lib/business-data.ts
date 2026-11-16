/** Contact details shown on the website, edited in Admin → Settings. Safe to import on the client. */

export type Business = {
  /** Phone as shown on the site, e.g. "+1 (438) 225-8859". */
  phone: string;
  /** Public email shown on the site. */
  email: string;
  /** Where new booking requests and messages are emailed. Empty = the public email. */
  notifyEmail: string;
  /** Instagram profile URL. Empty hides the icon. */
  instagram: string;
  /** Other profiles shown as icons in the footer (empty = hidden). */
  facebook: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
  /** Google Business profile or reviews link. */
  google: string;
  /** Email clients a reminder the day before a confirmed appointment. */
  reminders: boolean;
};

export const defaultBusiness: Business = {
  phone: "+1 (438) 225-8859",
  email: "info@healthyzone.ca",
  notifyEmail: "",
  instagram: "https://www.instagram.com/healthyzone.ca/",
  facebook: "",
  linkedin: "",
  youtube: "",
  tiktok: "",
  google: "",
  reminders: true,
};

export const socialFields = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "google", label: "Google Business profile" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
] as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "tel:" link for a phone shown in any format; 10-digit numbers get the +1 country code. */
export function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

/** Validates submitted details; returns the cleaned value or a list of problems. */
export function parseBusiness(raw: Record<string, unknown>): { value?: Business; errors: string[] } {
  const s = (k: string, max = 200) => String(raw[k] ?? "").trim().slice(0, max);
  const value: Business = {
    phone: s("phone", 40),
    email: s("email"),
    notifyEmail: s("notifyEmail"),
    instagram: s("instagram", 300),
    facebook: s("facebook", 300),
    linkedin: s("linkedin", 300),
    youtube: s("youtube", 300),
    tiktok: s("tiktok", 300),
    google: s("google", 500),
    reminders: raw.reminders === "yes",
  };
  const errors: string[] = [];
  const digits = value.phone.replace(/\D/g, "").length;
  if (digits < 10 || digits > 15) errors.push("Enter a valid phone number, e.g. +1 (438) 225-8859.");
  if (!EMAIL_RE.test(value.email)) errors.push("Enter a valid public email address.");
  if (value.notifyEmail && !EMAIL_RE.test(value.notifyEmail)) errors.push("Enter a valid notification email, or leave it empty.");
  if (value.instagram && !/^https:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/i.test(value.instagram)) {
    errors.push("The Instagram link should look like https://www.instagram.com/healthyzone.ca/, or leave it empty.");
  }
  for (const k of ["facebook", "linkedin", "youtube", "tiktok", "google"] as const) {
    if (value[k] && !/^https:\/\/[^\s]+$/i.test(value[k])) errors.push(`The ${k === "google" ? "Google" : k[0].toUpperCase() + k.slice(1)} link must start with https://, or leave it empty.`);
  }
  return errors.length ? { errors } : { value, errors };
}
