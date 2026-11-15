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
  const sql = await db();
  await sql`INSERT INTO settings (key, value, updated_at) VALUES ('pricing', ${JSON.stringify(pricing)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}
