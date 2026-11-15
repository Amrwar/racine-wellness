/**
 * Offline check of the Google Calendar blocking rules, with Google's API simulated.
 * Run: npx tsx --env-file=.env.local scripts/google-busy-check.ts
 * Temporarily writes a fake connection to the settings table and removes it afterwards.
 */
import { db } from "../src/lib/db";
import { encrypt } from "../src/lib/crypto";
import { googleBusy } from "../src/lib/google";
import { slotsOn } from "../src/lib/bookings";
import { zonedToDate } from "../src/lib/time";

process.env.GOOGLE_CLIENT_ID ??= "test-client";
process.env.GOOGLE_CLIENT_SECRET ??= "test-secret";

const events: Record<string, unknown[]> = {
  "ziad@example.com": [
    { colorId: "11", summary: "Dentist", start: { dateTime: "2026-12-01T10:00:00-05:00" }, end: { dateTime: "2026-12-01T11:00:00-05:00" } },
    { colorId: "7", summary: "Blue event (ignored)", start: { dateTime: "2026-12-01T13:00:00-05:00" }, end: { dateTime: "2026-12-01T14:00:00-05:00" } },
    { summary: "Default colour (ignored)", start: { dateTime: "2026-12-01T15:00:00-05:00" }, end: { dateTime: "2026-12-01T16:00:00-05:00" } },
    { colorId: "11", status: "cancelled", summary: "Cancelled (ignored)", start: { dateTime: "2026-12-01T16:00:00-05:00" }, end: { dateTime: "2026-12-01T17:00:00-05:00" } },
    { colorId: "11", summary: "Holiday", start: { date: "2026-12-02" }, end: { date: "2026-12-03" } },
  ],
  "gym@group.calendar.google.com": [
    { summary: "Gym class", start: { dateTime: "2026-12-01T18:00:00-05:00" }, end: { dateTime: "2026-12-01T19:00:00-05:00" } },
  ],
  "shared@example.com": [{ colorId: "11", summary: "Shared (calendar off)", start: { dateTime: "2026-12-01T09:00:00-05:00" }, end: { dateTime: "2026-12-01T09:30:00-05:00" } }],
};

const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (url.startsWith("https://oauth2.googleapis.com/token")) {
    return new Response(JSON.stringify({ access_token: "fake", expires_in: 3600 }), { status: 200 });
  }
  const m = url.match(/calendars\/([^/]+)\/events/);
  if (m) return new Response(JSON.stringify({ items: events[decodeURIComponent(m[1])] ?? [] }), { status: 200 });
  return realFetch(input, init);
}) as typeof fetch;

async function main() {
  const sql = await db();
  const [existing] = await sql`SELECT 1 FROM settings WHERE key = 'google'`;
  if (existing) throw new Error("A real Google connection exists; not overwriting it.");
  await sql`INSERT INTO settings (key, value) VALUES ('google', ${JSON.stringify({
    refreshToken: encrypt("fake-refresh"),
    account: "ziad@example.com",
    colors: ["11"],
    calendars: [
      { id: "ziad@example.com", name: "Ziad", color: "#039be5", mode: "colors" },
      { id: "gym@group.calendar.google.com", name: "Gym", color: "#33b679", mode: "all" },
      { id: "shared@example.com", name: "Shared", color: "#616161", mode: "off" },
    ],
  })}::jsonb)`;
  try {
    const busy = await googleBusy(zonedToDate("2026-12-01", "00:00"), zonedToDate("2026-12-04", "00:00"));
    const fmt = (t: number) => new Date(t).toLocaleString("en-CA", { timeZone: "America/Montreal", hour12: false });
    for (const b of busy) console.log(`${b.label}: ${fmt(b.start)} → ${fmt(b.end)}`);
    const labels = busy.map((b) => b.label).sort();
    const expected = ["Dentist", "Gym class", "Holiday"];
    console.log(JSON.stringify(labels) === JSON.stringify(expected) ? "PASS: only the right events block time" : `FAIL: got ${labels}`);
    // Booking slots (60 min) skip the blocked times, with the travel gap around them.
    const now = Date.parse("2026-11-20T12:00:00Z");
    const tue = await slotsOn("2026-12-01", 60, now);
    const wed = await slotsOn("2026-12-02", 60, now);
    console.log("Tue Dec 1 slots:", tue.join(" "));
    console.log("Wed Dec 2 slots:", wed.length ? wed.join(" ") : "(none, all-day block)");
    const ok = !tue.includes("10:00") && !tue.includes("09:30") && !tue.includes("18:00") && tue.includes("13:00") && wed.length === 0;
    console.log(ok ? "PASS: booking slots respect Google Calendar" : "FAIL: slots");
  } finally {
    await sql`DELETE FROM settings WHERE key = 'google'`;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
