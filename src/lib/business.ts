import { cache } from "react";
import { readSetting, writeSetting } from "./settings";
import { defaultBusiness, type Business } from "./business-data";

/** Current contact details, falling back to the defaults if none are saved or the database is unreachable. */
export const getBusiness = cache(async (): Promise<Business> => {
  try {
    const saved = await readSetting<Partial<Business>>("business");
    return { ...defaultBusiness, ...saved };
  } catch (err) {
    console.error("[business] falling back to defaults:", err);
    return defaultBusiness;
  }
});

export async function saveBusiness(value: Business) {
  await writeSetting("business", value);
}

/** Where business notifications go: the address set in Settings, else CONTACT_TO_EMAIL, else the public email. */
export async function notifyEmail() {
  const b = await getBusiness();
  return b.notifyEmail || process.env.CONTACT_TO_EMAIL || b.email;
}
