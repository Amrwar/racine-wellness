/** Website text and photos Ziad edits in Admin → Website. Safe to import on the client. */
import { en, type Dictionary } from "@/i18n/en";
import { fr } from "@/i18n/fr";
import type { Locale } from "@/i18n/config";
import type { Bilingual } from "./pricing-data";

/** Icons for the service cards: HealthyZone's own six first, then a wider library (lucide). */
export const serviceIconChoices = [
  { key: "hands", label: "Hands" },
  { key: "posture", label: "Posture" },
  { key: "mobility", label: "Mobility" },
  { key: "strength", label: "Dumbbell" },
  { key: "heart", label: "Heart" },
  { key: "youth", label: "Youth" },
  { key: "hand-heart", label: "Caring hands" },
  { key: "hand", label: "Hand" },
  { key: "activity", label: "Activity" },
  { key: "heart-pulse", label: "Heart rate" },
  { key: "person", label: "Person standing" },
  { key: "accessibility", label: "Accessibility" },
  { key: "footprints", label: "Footprints" },
  { key: "bike", label: "Bike" },
  { key: "medal", label: "Medal" },
  { key: "trophy", label: "Trophy" },
  { key: "target", label: "Target" },
  { key: "timer", label: "Timer" },
  { key: "brain", label: "Brain" },
  { key: "bone", label: "Bone" },
  { key: "stethoscope", label: "Stethoscope" },
  { key: "thermometer", label: "Thermometer" },
  { key: "flame", label: "Heat" },
  { key: "snowflake", label: "Cold" },
  { key: "droplets", label: "Oil drops" },
  { key: "waves", label: "Waves" },
  { key: "wind", label: "Breathing" },
  { key: "bath", label: "Bath" },
  { key: "bed", label: "Bed" },
  { key: "moon", label: "Sleep" },
  { key: "sun", label: "Sun" },
  { key: "leaf", label: "Leaf" },
  { key: "flower", label: "Flower" },
  { key: "sprout", label: "Sprout" },
  { key: "sparkles", label: "Sparkles" },
  { key: "mountain", label: "Mountain" },
  { key: "apple", label: "Apple" },
  { key: "salad", label: "Nutrition" },
  { key: "smile", label: "Smile" },
  { key: "baby", label: "Baby" },
  { key: "users", label: "Group" },
  { key: "shield", label: "Protection" },
  { key: "house", label: "Home visit" },
  { key: "briefcase", label: "Workplace" },
] as const;
export type ServiceIcon = (typeof serviceIconChoices)[number]["key"];
const iconKeys: readonly string[] = serviceIconChoices.map((c) => c.key);

export type SitePhoto = { src: string; width: number; height: number };

/** Home-page sections with a full-width background photo. */
export const backgroundKeys = ["services", "about", "blog", "contact"] as const;
export type BackgroundKey = (typeof backgroundKeys)[number];

/** How a background photo sits in its section: zoom in percent, focus point in percent from left/top. */
export type Framing = { zoom: number; x: number; y: number };

export const defaultFraming: Record<BackgroundKey, Framing> = {
  services: { zoom: 100, x: 50, y: 50 },
  about: { zoom: 100, x: 50, y: 40 },
  blog: { zoom: 100, x: 50, y: 70 },
  contact: { zoom: 100, x: 30, y: 50 },
};

/** CSS for a framed background image (object-fit: cover assumed). */
export function framingStyle(f: Framing) {
  const origin = `${f.x}% ${f.y}%`;
  return { objectPosition: origin, transformOrigin: origin, transform: f.zoom > 100 ? `scale(${f.zoom / 100})` : undefined };
}
/** image: an uploaded icon, shown instead of the built-in one. */
export type Testimonial = { quote: Bilingual; name: string; detail: Bilingual };
export type FaqItem = { q: Bilingual; a: Bilingual };
export type Block = { id: string; eyebrow: Bilingual; title: Bilingual; text: Bilingual; photo: SitePhoto | null; photoSide: "left" | "right" };
export const newBlockId = () => `block-${Math.random().toString(36).slice(2, 10)}`;

/** photo: an optional picture shown on the service card (a branded panel with the icon otherwise). */
export type ServiceItem = { icon: ServiceIcon; image: SitePhoto | null; photo: SitePhoto | null; title: Bilingual; text: Bilingual };

export type SiteContent = {
  tagline: Bilingual;
  hero: { title: Bilingual; lead: Bilingual; photo: SitePhoto | null };
  services: { title: Bilingual; lead: Bilingual; items: ServiceItem[] };
  pricing: { title: Bilingual; lead: Bilingual };
  about: {
    title: Bilingual;
    credentialsLine: Bilingual;
    text1: Bilingual;
    text2: Bilingual;
    /** One per line. */
    credentials: Bilingual;
    photo: SitePhoto | null;
  };
  contact: { title: Bilingual; lead: Bilingual; office: Bilingual; areaNote: Bilingual };
  testimonials: { title: Bilingual; items: Testimonial[] };
  faq: { title: Bilingual; items: FaqItem[] };
  /** Ziad's own sections (heading, text, optional photo), shown on the home page. */
  blocks: Block[];
  /** Pictures shown when a page is shared (Facebook, WhatsApp, iMessage…); null = the built-in card. */
  share: { home: SitePhoto | null; book: SitePhoto | null; blog: SitePhoto | null };
  /** Uploaded section backgrounds; null keeps the built-in photo. */
  backgrounds: Record<BackgroundKey, SitePhoto | null>;
  framing: Record<BackgroundKey, Framing>;
};

const pair = (pick: (d: Dictionary) => string): Bilingual => ({ en: pick(en), fr: pick(fr) });

export const defaultContent: SiteContent = {
  tagline: pair((d) => d.tagline),
  hero: { title: pair((d) => d.hero.title), lead: pair((d) => d.hero.lead), photo: null },
  services: {
    title: pair((d) => d.services.title),
    lead: pair((d) => d.services.lead),
    items: en.services.items.map((item, i) => ({
      icon: item.icon,
      image: null,
      photo: null,
      title: { en: item.title, fr: fr.services.items[i]?.title ?? item.title },
      text: { en: item.text, fr: fr.services.items[i]?.text ?? item.text },
    })),
  },
  pricing: { title: pair((d) => d.pricing.title), lead: pair((d) => d.pricing.lead) },
  about: {
    title: pair((d) => d.about.title),
    credentialsLine: pair((d) => d.credentialsLine),
    text1: pair((d) => d.about.text1),
    text2: pair((d) => d.about.text2),
    credentials: pair((d) => d.about.credentials.join("\n")),
    photo: null,
  },
  contact: {
    title: pair((d) => d.contact.title),
    lead: pair((d) => d.contact.lead),
    office: pair((d) => d.contact.office),
    areaNote: pair((d) => d.contact.areaNote),
  },
  testimonials: { title: { en: "What clients say", fr: "Ce que disent nos clients" }, items: [] },
  faq: { title: { en: "Frequently asked questions", fr: "Questions fréquentes" }, items: [] },
  blocks: [],
  share: { home: null, book: null, blog: null },
  backgrounds: { services: null, about: null, blog: null, contact: null },
  framing: defaultFraming,
};

/* ---------------- Reading and checking ---------------- */

const text = (v: unknown, fallback: string, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : fallback);

function bi(v: unknown, fallback: Bilingual, max = 600): Bilingual {
  const o = (v ?? {}) as Partial<Bilingual>;
  return { en: text(o.en, fallback.en, max), fr: text(o.fr, fallback.fr, max) };
}

const PHOTO_SRC = /^(\/images\/[\w./-]+|https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[\w./%-]+)$/i;

function photo(v: unknown): SitePhoto | null {
  const p = v as Partial<SitePhoto> | null;
  if (!p || typeof p.src !== "string" || !PHOTO_SRC.test(p.src)) return null;
  const w = Math.round(Number(p.width));
  const h = Math.round(Number(p.height));
  return w > 0 && h > 0 ? { src: p.src, width: w, height: h } : null;
}

function framing(v: unknown, fallback: Framing): Framing {
  const f = (v ?? {}) as Partial<Framing>;
  const num = (n: unknown, min: number, max: number, d: number) => {
    const x = Math.round(Number(n));
    return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : d;
  };
  return { zoom: num(f.zoom, 100, 250, fallback.zoom), x: num(f.x, 0, 100, fallback.x), y: num(f.y, 0, 100, fallback.y) };
}

/** Reads saved content, filling anything missing from the built-in defaults. */
export function parseContent(raw: unknown): SiteContent {
  const r = (raw ?? {}) as Record<string, Record<string, unknown>>;
  const d = defaultContent;
  const items = Array.isArray(r.services?.items) ? (r.services.items as Record<string, unknown>[]) : null;
  return {
    tagline: bi(r.tagline, d.tagline, 120),
    hero: { title: bi(r.hero?.title, d.hero.title, 120), lead: bi(r.hero?.lead, d.hero.lead), photo: photo(r.hero?.photo) },
    services: {
      title: bi(r.services?.title, d.services.title, 120),
      lead: bi(r.services?.lead, d.services.lead),
      items: items
        ? items.slice(0, 12).map((item) => ({
            icon: iconKeys.includes(String(item.icon)) ? (item.icon as ServiceIcon) : "hands",
            image: photo(item.image),
            photo: photo(item.photo),
            title: bi(item.title, { en: "", fr: "" }, 80),
            text: bi(item.text, { en: "", fr: "" }, 400),
          }))
        : d.services.items,
    },
    pricing: { title: bi(r.pricing?.title, d.pricing.title, 120), lead: bi(r.pricing?.lead, d.pricing.lead) },
    about: {
      title: bi(r.about?.title, d.about.title, 120),
      credentialsLine: bi(r.about?.credentialsLine, d.about.credentialsLine, 160),
      text1: bi(r.about?.text1, d.about.text1, 1200),
      text2: bi(r.about?.text2, d.about.text2, 1200),
      credentials: bi(r.about?.credentials, d.about.credentials, 1000),
      photo: photo(r.about?.photo),
    },
    contact: {
      title: bi(r.contact?.title, d.contact.title, 120),
      lead: bi(r.contact?.lead, d.contact.lead),
      office: bi(r.contact?.office, d.contact.office, 120),
      areaNote: bi(r.contact?.areaNote, d.contact.areaNote, 160),
    },
    testimonials: {
      title: bi(r.testimonials?.title, d.testimonials.title, 120),
      items: (Array.isArray(r.testimonials?.items) ? (r.testimonials.items as Record<string, unknown>[]) : []).slice(0, 20).map((t) => ({
        quote: bi(t.quote, { en: "", fr: "" }, 800),
        name: text(t.name, "", 80),
        detail: bi(t.detail, { en: "", fr: "" }, 80),
      })),
    },
    faq: {
      title: bi(r.faq?.title, d.faq.title, 120),
      items: (Array.isArray(r.faq?.items) ? (r.faq.items as Record<string, unknown>[]) : []).slice(0, 30).map((f) => ({
        q: bi(f.q, { en: "", fr: "" }, 200),
        a: bi(f.a, { en: "", fr: "" }, 1500),
      })),
    },
    blocks: (Array.isArray(r.blocks) ? (r.blocks as unknown as Record<string, unknown>[]) : [])
      .filter((b) => typeof b.id === "string" && /^block-[a-z0-9]{4,16}$/.test(b.id))
      .slice(0, 12)
      .map((b) => ({
        id: b.id as string,
        eyebrow: bi(b.eyebrow, { en: "", fr: "" }, 60),
        title: bi(b.title, { en: "", fr: "" }, 140),
        text: bi(b.text, { en: "", fr: "" }, 3000),
        photo: photo(b.photo),
        photoSide: b.photoSide === "left" ? "left" : "right",
      })),
    share: { home: photo(r.share?.home), book: photo(r.share?.book), blog: photo(r.share?.blog) },
    backgrounds: {
      services: photo(r.backgrounds?.services),
      about: photo(r.backgrounds?.about),
      blog: photo(r.backgrounds?.blog),
      contact: photo(r.backgrounds?.contact),
    },
    framing: {
      services: framing(r.framing?.services, defaultFraming.services),
      about: framing(r.framing?.about, defaultFraming.about),
      blog: framing(r.framing?.blog, defaultFraming.blog),
      contact: framing(r.framing?.contact, defaultFraming.contact),
    },
  };
}

/** Fields that can't be left empty, with the name shown in the error. */
export function contentProblems(c: SiteContent): string[] {
  const required: [string, Bilingual][] = [
    ["Tagline", c.tagline],
    ["Main heading", c.hero.title],
    ["Introduction", c.hero.lead],
    ["Services heading", c.services.title],
    ["Pricing heading", c.pricing.title],
    ["About heading", c.about.title],
    ["About paragraph 1", c.about.text1],
    ["Contact heading", c.contact.title],
    ["Office", c.contact.office],
    ...c.services.items.flatMap((s, i): [string, Bilingual][] => [
      [`Service ${i + 1} name`, s.title],
      [`Service ${i + 1} description`, s.text],
    ]),
  ];
  c.testimonials.items.forEach((t, i) => required.push([`Testimonial ${i + 1}`, t.quote]));
  c.faq.items.forEach((f, i) => {
    required.push([`Question ${i + 1}`, f.q], [`Answer ${i + 1}`, f.a]);
  });
  c.blocks.forEach((b, i) => required.push([`Your section ${i + 1} heading`, b.title]));
  const missing = required.filter(([, v]) => !v.en || !v.fr).map(([name]) => name);
  const problems = missing.length ? [`Fill in both English and French for: ${missing.join(", ")}.`] : [];
  if (!c.services.items.length) problems.push("Keep at least one service.");
  return problems;
}

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** The dictionary for one language with Ziad's edits applied. */
export function applyContent(t: Dictionary, c: SiteContent, locale: Locale): Dictionary {
  const L = (b: Bilingual) => b[locale];
  return {
    ...t,
    tagline: L(c.tagline),
    credentialsLine: L(c.about.credentialsLine),
    hero: { ...t.hero, title: L(c.hero.title), lead: L(c.hero.lead) },
    services: {
      ...t.services,
      title: L(c.services.title),
      lead: L(c.services.lead),
      // The home page draws icons from the content itself (which can hold more icon types and uploads).
      items: c.services.items.map((s) => ({ icon: "hands" as const, title: L(s.title), text: L(s.text) })),
    },
    pricing: { ...t.pricing, title: L(c.pricing.title), lead: L(c.pricing.lead) },
    about: {
      ...t.about,
      title: L(c.about.title),
      text1: L(c.about.text1),
      text2: L(c.about.text2),
      credentials: lines(L(c.about.credentials)),
    },
    contact: { ...t.contact, title: L(c.contact.title), lead: L(c.contact.lead), office: L(c.contact.office), areaNote: L(c.contact.areaNote) },
    booking: { ...t.booking, officeNote: L(c.contact.office) },
  };
}
