import { cache } from "react";
import { readSetting, writeSetting } from "./settings";
import { defaultDesign, parseDesign, type Design } from "./design-data";

/** The site's design settings, or the built-in look if none are saved or the database is unreachable. */
export const getDesign = cache(async (): Promise<Design> => {
  try {
    const saved = await readSetting("design");
    return saved ? parseDesign(saved) : defaultDesign;
  } catch (err) {
    console.error("[design] falling back to defaults:", err);
    return defaultDesign;
  }
});

export async function saveDesign(design: Design) {
  await writeSetting("design", design);
}
