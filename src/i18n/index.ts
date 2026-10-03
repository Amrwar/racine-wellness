import { en, type Dictionary } from "./en";
import { fr } from "./fr";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = { en, fr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Replace {placeholders} in a dictionary string. */
export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? `{${k}}`);
}

export type { Dictionary, Locale };
export { localePath, locales, defaultLocale } from "./config";
