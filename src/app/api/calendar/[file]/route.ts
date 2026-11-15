import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { calendarToken } from "@/lib/bookings";
import type { Booking } from "@/lib/booking-data";
import { formatPrice } from "@/lib/pricing-data";
import { site } from "@/lib/site";

/**
 * Private iCalendar feed of upcoming bookings, for Ziad's phone calendar:
 * /api/calendar/<secret token>.ics. Pending requests are marked tentative.
 */
export const dynamic = "force-dynamic";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Lines longer than 75 octets must be folded (RFC 5545). */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = " " + rest.slice(cut);
  }
  out.push(rest);
  return out.join("\r\n");
}

export async function GET(_req: Request, ctx: RouteContext<"/api/calendar/[file]">) {
  const { file } = await ctx.params;
  const expected = calendarToken();
  const given = file.replace(/\.ics$/, "");
  if (!expected || given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
    return new Response("Not found", { status: 404 });
  }

  const sql = await db();
  const rows = (await sql`SELECT * FROM bookings WHERE status IN ('pending', 'confirmed')
    AND end_at > now() - interval '30 days' ORDER BY start_at`) as Booking[];

  const now = stamp(new Date());
  const events = rows.flatMap((b) => {
    const pending = b.status === "pending";
    const where = b.location === "home" ? b.address ?? "Home visit" : "HealthyZone office, Saint-Jean";
    const description = [
      `${b.service_title}, ${b.minutes} min (${formatPrice(Number(b.price), "en")})`,
      `Phone: ${b.phone}`,
      b.email ? `Email: ${b.email}` : "",
      b.wants_receipt ? "Insurance receipt requested" : "",
      b.notes ? `Notes: ${b.notes}` : "",
      pending ? `Awaiting confirmation: ${site.url}/admin/bookings` : "",
    ]
      .filter(Boolean)
      .join("\n");
    return [
      "BEGIN:VEVENT",
      `UID:booking-${b.id}@healthyzone.ca`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(new Date(b.start_at))}`,
      `DTEND:${stamp(new Date(b.end_at))}`,
      `SUMMARY:${esc(`${pending ? "Request: " : ""}${b.name} · ${b.service_title}`)}`,
      `LOCATION:${esc(where)}`,
      `DESCRIPTION:${esc(description)}`,
      `STATUS:${pending ? "TENTATIVE" : "CONFIRMED"}`,
      "END:VEVENT",
    ];
  });

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HealthyZone//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:HealthyZone bookings",
    "X-WR-TIMEZONE:America/Montreal",
    "REFRESH-INTERVAL;VALUE=DURATION:PT15M",
    "X-PUBLISHED-TTL:PT15M",
    ...events,
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");

  return new Response(body + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="healthyzone-bookings.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
