import { db } from "./db";
import type { Booking } from "./booking-data";

/**
 * Clients are built from bookings, matched by phone number (last 10 digits), so there is
 * nothing to keep in sync. Private notes per client live in client_notes.
 */
export type Client = {
  key: string;
  name: string;
  phone: string;
  email: string | null;
  visits: number;
  upcoming: number;
  spent: number;
  first_at: string;
  last_visit: string | null;
  next_visit: string | null;
  notes: string;
};

/** "(514) 555-0101" and "+1 514 555 0101" are the same client. */
export function clientKey(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export async function getClients(): Promise<Client[]> {
  const sql = await db();
  const rows = await sql`
    WITH b AS (
      SELECT *, right(regexp_replace(phone, '\D', '', 'g'), 10) AS client_key FROM bookings
      WHERE status IN ('pending', 'confirmed')
    )
    SELECT b.client_key AS key,
      (array_agg(name ORDER BY created_at DESC))[1] AS name,
      (array_agg(phone ORDER BY created_at DESC))[1] AS phone,
      (array_agg(email ORDER BY created_at DESC) FILTER (WHERE email IS NOT NULL))[1] AS email,
      count(*) FILTER (WHERE status = 'confirmed' AND start_at < now())::int AS visits,
      count(*) FILTER (WHERE end_at > now())::int AS upcoming,
      coalesce(sum(price) FILTER (WHERE status = 'confirmed' AND start_at < now()), 0)::float AS spent,
      min(start_at) AS first_at,
      max(start_at) FILTER (WHERE status = 'confirmed' AND start_at < now()) AS last_visit,
      min(start_at) FILTER (WHERE start_at > now()) AS next_visit,
      coalesce(max(n.notes), '') AS notes
    FROM b LEFT JOIN client_notes n ON n.client_key = b.client_key
    GROUP BY b.client_key
    ORDER BY coalesce(min(start_at) FILTER (WHERE start_at > now()), max(start_at)) DESC`;
  return rows as Client[];
}

export async function getClient(key: string) {
  const clients = await getClients();
  const client = clients.find((c) => c.key === key) ?? null;
  if (!client) return null;
  const sql = await db();
  const bookings = (await sql`SELECT * FROM bookings
    WHERE right(regexp_replace(phone, '\D', '', 'g'), 10) = ${key} ORDER BY start_at DESC`) as Booking[];
  return { client, bookings };
}

export async function saveClientNotes(key: string, notes: string) {
  const sql = await db();
  await sql`INSERT INTO client_notes (client_key, notes, updated_at) VALUES (${key}, ${notes}, now())
    ON CONFLICT (client_key) DO UPDATE SET notes = EXCLUDED.notes, updated_at = now()`;
}
