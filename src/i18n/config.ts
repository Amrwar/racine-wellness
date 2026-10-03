export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

/** Locale served at the bare URL (no prefix). Change to "fr" to make French the default. */
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Build a path for a locale: default locale is unprefixed, others get /xx. */
export function localePath(locale: Locale, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Strip a locale prefix from a pathname, returning the bare path and detected locale. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split("/");
  if (first && isLocale(first)) {
    const path = "/" + rest.join("/");
    return { locale: first, path: path === "/" ? "/" : path.replace(/\/$/, "") };
  }
  return { locale: defaultLocale, path: pathname || "/" };
}

export const htmlLang: Record<Locale, string> = { en: "en-CA", fr: "fr-CA" };
export const ogLocale: Record<Locale, string> = { en: "en_CA", fr: "fr_CA" };
