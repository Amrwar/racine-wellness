/**
 * Look and layout of the public site, edited in Admin → Design: brand colours, text size,
 * the order and visibility of home-page sections, and each section's tint and spacing.
 * Safe to import on the client.
 */

export const designSectionKeys = ["services", "pricing", "about", "blog", "contact"] as const;
export type DesignSection = (typeof designSectionKeys)[number];

export const designSectionNames: Record<DesignSection, string> = {
  services: "Services",
  pricing: "Pricing",
  about: "About",
  blog: "Blog preview",
  contact: "Contact",
};

export type Spacing = "compact" | "normal" | "spacious";
export type SectionStyle = { overlay: string; strength: number; spacing: Spacing };

export type Design = {
  colors: { navy: string; blue: string; green: string };
  /** Root text size in percent: everything on the site scales with it. */
  textScale: number;
  sections: { key: DesignSection; visible: boolean }[];
  style: Record<DesignSection, SectionStyle>;
  /** Top bar and footer background colours (their text is white, so dark colours work best). */
  header: { bg: string };
  footer: { bg: string };
  /** Menu links to hide (also hidden automatically when their home-page section is hidden). */
  hiddenMenu: string[];
  layout: Layout;
  buttons: { shape: ButtonShape };
  hero: { size: HeroSize; align: "left" | "center"; shade: number };
  fonts: { body: FontKey; heading: FontKey };
  forms: FormFields;
};

export type Layout = {
  servicesColumns: 2 | 3;
  pricingColumns: 2 | 3;
  blogColumns: 2 | 3;
  aboutPhoto: "left" | "right";
  contactForm: "left" | "right";
};
export type ButtonShape = "pill" | "rounded" | "square";

/** Fonts loaded by the site layout (next/font); each sets the CSS variable --font-<key>. */
export const fontChoices = [
  { key: "poppins", name: "Poppins", note: "Modern and friendly (original)" },
  { key: "inter", name: "Inter", note: "Clean and neutral" },
  { key: "montserrat", name: "Montserrat", note: "Bold and geometric" },
  { key: "nunito", name: "Nunito", note: "Soft and rounded" },
  { key: "lora", name: "Lora", note: "Elegant serif" },
  { key: "playfair", name: "Playfair Display", note: "Classic serif, for headings" },
] as const;
export type FontKey = (typeof fontChoices)[number]["key"];
const fontKeys: readonly string[] = fontChoices.map((f) => f.key);
export type HeroSize = "small" | "normal" | "large";
/** Optional form fields that can be switched off (name and phone are always asked; booking email too, for confirmations). */
export type FormFields = {
  contactEmail: boolean;
  contactMessage: boolean;
  contactReceipt: boolean;
  bookingHomeVisits: boolean;
  bookingNotes: boolean;
  bookingReceipt: boolean;
};

export const buttonRadius: Record<ButtonShape, string> = { pill: "9999px", rounded: "0.75rem", square: "0.25rem" };

/** Hero heading sizes (full class strings so Tailwind sees them). */
export const heroSizeClass: Record<HeroSize, string> = {
  small: "text-[2.2rem] sm:text-5xl lg:text-6xl",
  normal: "text-[2.6rem] sm:text-6xl lg:text-7xl",
  large: "text-[2.9rem] sm:text-7xl lg:text-8xl",
};

export const columnsClass = {
  services: { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" },
  pricing: { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3" },
  blog: { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" },
} as const;

export const menuKeys = ["services", "pricing", "about", "blog", "contact"] as const;

export const defaultColors = { navy: "#004575", blue: "#009ffb", green: "#00ee81" };

const plain: SectionStyle = { overlay: "#004575", strength: 0, spacing: "normal" };

export const defaultDesign: Design = {
  colors: defaultColors,
  textScale: 100,
  sections: designSectionKeys.map((key) => ({ key, visible: true })),
  style: { services: plain, pricing: plain, about: plain, blog: plain, contact: plain },
  header: { bg: "#004575" },
  footer: { bg: "#00304f" },
  hiddenMenu: [],
  layout: { servicesColumns: 3, pricingColumns: 3, blogColumns: 3, aboutPhoto: "left", contactForm: "right" },
  buttons: { shape: "pill" },
  hero: { size: "normal", align: "left", shade: 0 },
  fonts: { body: "poppins", heading: "poppins" },
  forms: { contactEmail: true, contactMessage: true, contactReceipt: true, bookingHomeVisits: true, bookingNotes: true, bookingReceipt: true },
};

/** Vertical padding of a section, per spacing choice. */
export const spacingClass: Record<Spacing, string> = {
  compact: "py-12 sm:py-16",
  normal: "py-20 sm:py-28",
  spacious: "py-28 sm:py-40",
};

const HEX = /^#[0-9a-f]{6}$/i;
const hex = (v: unknown, d: string) => (typeof v === "string" && HEX.test(v) ? v.toLowerCase() : d);
const num = (v: unknown, min: number, max: number, d: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};

export function parseDesign(raw: unknown): Design {
  const r = (raw ?? {}) as Partial<Record<keyof Design, unknown>>;
  const c = (r.colors ?? {}) as Record<string, unknown>;
  const listed = Array.isArray(r.sections) ? (r.sections as { key?: unknown; visible?: unknown }[]) : [];
  const sections: Design["sections"] = [];
  for (const s of listed) {
    const key = s?.key as DesignSection;
    if (designSectionKeys.includes(key) && !sections.some((x) => x.key === key)) sections.push({ key, visible: s.visible !== false });
  }
  // Sections added to the site later appear at the end.
  for (const key of designSectionKeys) if (!sections.some((x) => x.key === key)) sections.push({ key, visible: true });
  const st = (r.style ?? {}) as Record<string, Partial<SectionStyle>>;
  const l = (r.layout ?? {}) as Record<string, unknown>;
  const b = (r.buttons ?? {}) as Record<string, unknown>;
  const h = (r.hero ?? {}) as Record<string, unknown>;
  const f = (r.forms ?? {}) as Record<string, unknown>;
  const fo = (r.fonts ?? {}) as Record<string, unknown>;
  const style = Object.fromEntries(
    designSectionKeys.map((k) => {
      const v = st[k] ?? {};
      const spacing: Spacing = v.spacing === "compact" || v.spacing === "spacious" ? v.spacing : "normal";
      return [k, { overlay: hex(v.overlay, plain.overlay), strength: num(v.strength, 0, 90, 0), spacing }];
    }),
  ) as Record<DesignSection, SectionStyle>;
  return {
    colors: { navy: hex(c.navy, defaultColors.navy), blue: hex(c.blue, defaultColors.blue), green: hex(c.green, defaultColors.green) },
    textScale: num(r.textScale, 85, 125, 100),
    sections,
    style,
    header: { bg: hex((r.header as { bg?: unknown } | undefined)?.bg, defaultDesign.header.bg) },
    footer: { bg: hex((r.footer as { bg?: unknown } | undefined)?.bg, defaultDesign.footer.bg) },
    hiddenMenu: Array.isArray(r.hiddenMenu) ? (r.hiddenMenu as unknown[]).filter((k): k is string => menuKeys.includes(k as never)) : [],
    layout: {
      servicesColumns: l.servicesColumns === 2 ? 2 : 3,
      pricingColumns: l.pricingColumns === 2 ? 2 : 3,
      blogColumns: l.blogColumns === 2 ? 2 : 3,
      aboutPhoto: l.aboutPhoto === "right" ? "right" : "left",
      contactForm: l.contactForm === "left" ? "left" : "right",
    },
    buttons: { shape: ["pill", "rounded", "square"].includes(b.shape as string) ? (b.shape as ButtonShape) : "pill" },
    hero: {
      size: ["small", "normal", "large"].includes(h.size as string) ? (h.size as HeroSize) : "normal",
      align: h.align === "center" ? "center" : "left",
      shade: num(h.shade, 0, 80, 0),
    },
    fonts: {
      body: fontKeys.includes(fo.body as string) ? (fo.body as FontKey) : "poppins",
      heading: fontKeys.includes(fo.heading as string) ? (fo.heading as FontKey) : "poppins",
    },
    forms: Object.fromEntries(
      (Object.keys(defaultDesign.forms) as (keyof FormFields)[]).map((k) => [k, f[k] !== false]),
    ) as FormFields,
  };
}

/** Menu links that shouldn't show: hidden by hand, or pointing at a hidden section. */
export function hiddenMenuKeys(d: Design) {
  return [...new Set([...d.hiddenMenu, ...d.sections.filter((s) => !s.visible).map((s) => s.key)])];
}

/** CSS that applies the colours and text size on top of the built-in theme. */
export function designCss(d: Design) {
  const { navy, blue, green } = d.colors;
  const vars = [
    `--color-navy:${navy}`,
    `--color-navy-deep:color-mix(in oklab,${navy} 72%,black)`,
    `--color-blue:${blue}`,
    `--color-blue-dark:color-mix(in oklab,${blue} 78%,black)`,
    `--color-green:${green}`,
    `--header-bg:${d.header.bg}`,
    `--footer-bg:${d.footer.bg}`,
    `--btn-radius:${buttonRadius[d.buttons.shape]}`,
  ];
  const stack = (k: FontKey) => `var(--font-${k}),${k === "lora" || k === "playfair" ? "Georgia,serif" : "ui-sans-serif,system-ui,sans-serif"}`;
  vars.push(`--font-sans:${stack(d.fonts.body)}`);
  const headings = d.fonts.heading !== d.fonts.body ? `h1,h2,h3,h4{font-family:${stack(d.fonts.heading)}}` : "";
  return `:root{${vars.join(";")}}html{font-size:${d.textScale}%}${headings}`;
}
