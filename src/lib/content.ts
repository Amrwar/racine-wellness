import { cache } from "react";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { readSetting, writeSetting } from "./settings";
import { applyContent, defaultContent, parseContent, type SiteContent } from "./content-data";
import { applyOverrides, cleanOverrides, type TextOverrides } from "./text-data";

/** Ziad's website text and photos, or the built-in text if nothing is saved or the database is unreachable. */
export const getContent = cache(async (): Promise<SiteContent> => {
  try {
    const saved = await readSetting("content");
    return saved ? parseContent(saved) : defaultContent;
  } catch (err) {
    console.error("[content] falling back to defaults:", err);
    return defaultContent;
  }
});

export async function saveContent(content: SiteContent) {
  await writeSetting("content", content);
}

/** Edits from Admin → Website → All other text. */
export const getTextOverrides = cache(async (): Promise<TextOverrides> => {
  try {
    return cleanOverrides(await readSetting("text")).value;
  } catch (err) {
    console.error("[content] text overrides unavailable:", err);
    return {};
  }
});

export async function saveTextOverrides(value: TextOverrides) {
  await writeSetting("text", value);
}

/** The dictionary for a language, with every edit from the admin applied. */
export async function getText(locale: Locale): Promise<Dictionary> {
  const [content, overrides] = await Promise.all([getContent(), getTextOverrides()]);
  return applyContent(applyOverrides(getDictionary(locale), overrides, locale), content, locale);
}
