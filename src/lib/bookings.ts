import { createHmac } from "node:crypto";
import { db, hasDatabase } from "./db";
import { defaultAvailability, parseAvailability, type Availability, type Booking } from "./booking-data";
import { addDays, fromMinutes, localDay, toMinutes, weekday, zonedToDate } from "./time";
import { googleBusy } from "./google";

/** Slots start on the half hour. */
const STEP = 30;

export async function getAvailability(): Promise<Availability> {
  if (!hasDatabase()) return defaultAvailability;
  try {
    const sql = await db();
    const rows = await sql`SELECT value FROM settings WHERE key = 'availability'`;
    return parseAvailability(rows[0]?.value) ?? defaultAvailability;
  } catch (err) {
    console.error("[bookings] availability fallback:", err);
    return defaultAvailability;
  }
}

export async function saveAvailability(a: Availability) {
  const sql = await db();
  await sql`INSERT INTO settings (key, value, updated_at) VALUES ('availability', ${JSON.stringify(a)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}

type Busy = { start: number; end: number };

/** Pending and confirmed appointments, plus times blocked in Google Calendar, overlapping [from, to). */
async function busyBetween(from: Date, to: Date): Promise<Busy[]> {
  const sql = await db();
  const [rows, google] = await Promise.all([
    sql`SELECT start_at, end_at FROM bookings
      WHERE status IN ('pending', 'confirmed') AND start_at < ${to.toISOString()} AND end_at > ${from.toISOString()}`,
    googleBusy(from, to),
  ]);
  return [...rows.map((r) => ({ start: new Date(r.start_at).getTime(), end: new Date(r.end_at).getTime() })), ...google];
}

function slotsForDay(a: Availability, busy: Busy[], date: string, minutes: number, now: number): string[] {
  const hours = a.week[weekday(date)];
  if (!hours?.open || a.closedDates.includes(date)) return [];
  const earliest = now + a.minNoticeHours * 3600_000;
  const buffer = a.bufferMinutes * 60_000;
  const out: string[] = [];
  for (let m = toMinutes(hours.start); m + minutes <= toMinutes(hours.end); m += STEP) {
    const start = zonedToDate(date, fromMinutes(m)).getTime();
    const end = start + minutes * 60_000;
    if (start < earliest) continue;
    // Keep the travel/set-up buffer on both sides of every existing appointment.
    if (busy.some((b) => start < b.end + buffer && end + buffer > b.start)) continue;
    out.push(fromMinutes(m));
  }
  return out;
}

function windowFor(a: Availability, now: number) {
  const first = localDay(new Date(now));
  return { first, last: addDays(first, a.maxDaysAhead) };
}

/** Days in the booking window with at least one free slot for this duration. */
export async function openDays(minutes: number, now = Date.now()) {
  const a = await getAvailability();
  const { first, last } = windowFor(a, now);
  const busy = await busyBetween(zonedToDate(first, "00:00"), zonedToDate(addDays(last, 1), "00:00"));
  const days: string[] = [];
  for (let d = first; d <= last; d = addDays(d, 1)) {
    if (slotsForDay(a, busy, d, minutes, now).length) days.push(d);
  }
  return days;
}

/** Free start times ("HH:MM", Montréal) on a day for this duration. */
export async function slotsOn(date: string, minutes: number, now = Date.now()) {
  const a = await getAvailability();
  const { first, last } = windowFor(a, now);
  if (date < first || date > last) return [];
  const busy = await busyBetween(zonedToDate(addDays(date, -1), "00:00"), zonedToDate(addDays(date, 2), "00:00"));
  return slotsForDay(a, busy, date, minutes, now);
}

export async function getBooking(id: number) {
  const sql = await db();
  const rows = (await sql`SELECT * FROM bookings WHERE id = ${id}`) as Booking[];
  return rows[0] ?? null;
}

/** Secret part of Ziad's calendar subscription URL. Changing SESSION_SECRET changes it. */
export function calendarToken() {
  const secret = process.env.CALENDAR_SECRET ?? process.env.SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update("healthyzone-calendar-feed").digest("base64url").slice(0, 32);
}
