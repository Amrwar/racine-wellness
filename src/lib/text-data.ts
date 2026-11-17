/**
 * "All other text": every remaining sentence of the site (menu, booking page, emails, forms, blog
 * labels, privacy policy, search-engine text) as editable English/French pairs. Overrides are
 * stored by path, e.g. "booking.emails.confirmed". Safe to import on the client.
 */
import { en, type Dictionary } from "@/i18n/en";
import { fr } from "@/i18n/fr";
import type { Locale } from "@/i18n/config";
import type { Bilingual } from "./pricing-data";

export type TextOverrides = Record<string, Bilingual>;
export type TextField = { path: string; group: string; label: string; original: Bilingual; multiline: boolean };

/** Edited on the Website page instead (or not shown on the site), so left out here. */
const EXCLUDED = [
  "tagline",
  "credentialsLine",
  "hero.title",
  "hero.lead",
  "services.title",
  "services.lead",
  "services.items",
  "pricing.title",
  "pricing.lead",
  "about.title",
  "about.text1",
  "about.text2",
  "about.credentials",
  "contact.title",
  "contact.lead",
  "contact.office",
  "contact.areaNote",
  "booking.officeNote",
  "og",
  "notFound",
  "header.switchShort",
  "header.switchTitle",
];

export const textGroups: Record<string, { title: string; text: string }> = {
  nav: { title: "Menu", text: "Links in the top menu." },
  header: { title: "Header", text: "Buttons and screen-reader labels in the top bar." },
  meta: { title: "Google and link previews", text: "Page titles and descriptions shown in Google results and when a link is shared." },
  hero: { title: "Top of the page", text: "Buttons and the photo description." },
  services: { title: "Services section", text: "The small label above the heading." },
  pricing: { title: "Pricing section", text: "Labels and button." },
  pricingPage: { title: "Pricing page", text: "The separate Pricing & services page (prices themselves are edited on the Pricing page of the admin)." },
  booking: { title: "Booking page and client emails", text: "Everything on the booking page, and the emails clients receive." },
  about: { title: "About section", text: "Small label and the portrait description." },
  contact: { title: "Contact section", text: "Labels next to your phone, email and office." },
  form: { title: "Contact form", text: "Field names, hints, the thank-you message and error messages." },
  blog: { title: "Blog", text: "Headings, labels and the author box on the blog." },
  footer: { title: "Footer", text: "The bottom of every page." },
  privacy: { title: "Privacy policy", text: "The privacy policy page." },
};

const words = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\d+$/, (n) => `#${Number(n) + 1}`)
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

/** Every editable sentence, in page order. */
export const textFields: TextField[] = (() => {
  const out: TextField[] = [];
  const walk = (a: unknown, b: unknown, path: string[]) => {
    const p = path.join(".");
    if (EXCLUDED.some((x) => p === x || p.startsWith(`${x}.`))) return;
    if (typeof a === "string") {
      out.push({
        path: p,
        group: path[0],
        label: path.slice(1).map(words).join(" › ") || words(path[0]),
        original: { en: a, fr: typeof b === "string" ? b : a },
        multiline: a.length > 70 || a.includes("\n"),
      });
    } else if (a && typeof a === "object") {
      for (const k of Object.keys(a)) walk((a as Record<string, unknown>)[k], (b as Record<string, unknown> | undefined)?.[k], [...path, k]);
    }
  };
  walk(en, fr, []);
  return out.filter((f) => textGroups[f.group]);
})();

const fieldByPath = new Map(textFields.map((f) => [f.path, f]));

/** Placeholders such as {name} that the site fills in. */
export const placeholders = (s: string) => [...new Set(s.match(/\{\w+\}/g) ?? [])].sort();

/** Keeps only known paths that differ from the original; reports missing text or placeholders. */
export function cleanOverrides(raw: unknown): { value: TextOverrides; problems: string[] } {
  const value: TextOverrides = {};
  const problems: string[] = [];
  const r = (raw ?? {}) as Record<string, Partial<Bilingual>>;
  for (const [path, v] of Object.entries(r)) {
    const field = fieldByPath.get(path);
    if (!field || !v) continue;
    const next = { en: String(v.en ?? "").trim().slice(0, 4000), fr: String(v.fr ?? "").trim().slice(0, 4000) };
    if (next.en === field.original.en && next.fr === field.original.fr) continue;
    const name = `${textGroups[field.group].title}: ${field.label}`;
    if (!next.en || !next.fr) problems.push(`${name} needs both English and French.`);
    for (const lang of ["en", "fr"] as const) {
      const want = placeholders(field.original[lang]).join(" ");
      if (placeholders(next[lang]).join(" ") !== want) {
        problems.push(`${name} (${lang === "en" ? "English" : "French"}) must keep exactly these placeholders: ${want}.`);
      }
    }
    value[path] = next;
  }
  return { value, problems };
}

/** The dictionary with text overrides applied for one language. */
export function applyOverrides(t: Dictionary, overrides: TextOverrides, locale: Locale): Dictionary {
  const entries = Object.entries(overrides).filter(([path]) => fieldByPath.has(path));
  if (!entries.length) return t;
  const copy = structuredClone(t) as unknown as Record<string, unknown>;
  for (const [path, v] of entries) {
    const keys = path.split(".");
    let node = copy as Record<string, unknown>;
    for (const k of keys.slice(0, -1)) node = node[k] as Record<string, unknown>;
    node[keys[keys.length - 1]] = v[locale];
  }
  return copy as unknown as Dictionary;
}
