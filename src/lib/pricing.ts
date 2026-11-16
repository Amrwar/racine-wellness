import { writeSetting } from "./settings";
import { db, hasDatabase } from "./db";
import { defaultPricing, parsePricing, type Pricing } from "./pricing-data";

/** Current pricing from the database, or the defaults if none is saved or the database is unreachable. */
export async function getPricing(): Promise<Pricing> {
  if (!hasDatabase()) return defaultPricing;
  try {
    const sql = await db();
    const rows = await sql`SELECT value FROM settings WHERE key = 'pricing'`;
    return parsePricing(rows[0]?.value) ?? defaultPricing;
  } catch (err) {
    console.error("[pricing] falling back to defaults:", err);
    return defaultPricing;
  }
}

export async function savePricing(pricing: Pricing) {
  await writeSetting("pricing", pricing);
}
