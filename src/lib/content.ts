import { cache } from "react";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { readSetting, writeSetting } from "./settings";
import { applyContent, defaultContent, parseContent, type SiteContent } from "./content-data";

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

/** The dictionary for a language, with the editable text from the admin applied. */
export async function getText(locale: Locale): Promise<Dictionary> {
  return applyContent(getDictionary(locale), await getContent(), locale);
}
