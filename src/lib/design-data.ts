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
};

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
  ];
  return `:root{${vars.join(";")}}html{font-size:${d.textScale}%}`;
}
