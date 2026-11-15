import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendarToken } from "@/lib/bookings";
import { googleBusy } from "@/lib/google";
import type { Booking } from "@/lib/booking-data";
import { site } from "@/lib/site";
import { addDays, isDay, localDay, localTime, weekday, zonedToDate } from "@/lib/time";
import { BookingCard } from "@/components/admin/BookingCard";
import { CopyLink } from "@/components/admin/CopyLink";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Bookings" };

/** Monday of the week containing this day. */
const mondayOf = (d: string) => addDays(d, -((weekday(d) + 6) % 7));
const short = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-CA", { ...opts, timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  await requireAdmin();
  const { week, open } = await searchParams;
  const today = localDay(new Date());
  const monday = mondayOf(isDay(week) ? week : today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const sql = await db();
  const pending = (await sql`SELECT * FROM bookings WHERE status = 'pending' AND end_at > now() ORDER BY start_at`) as Booking[];
  const inWeek = (await sql`SELECT * FROM bookings WHERE status IN ('pending', 'confirmed')
    AND start_at >= ${zonedToDate(monday, "00:00").toISOString()}
    AND start_at < ${zonedToDate(addDays(monday, 7), "00:00").toISOString()}
    ORDER BY start_at`) as Booking[];
  const blocked = await googleBusy(zonedToDate(monday, "00:00"), zonedToDate(addDays(monday, 7), "00:00"));
  const selected = typeof open === "string" ? inWeek.find((b) => String(b.id) === open) : undefined;

  const token = calendarToken();
  const feed = token ? `${site.url}/api/calendar/${token}.ics` : null;
  const range = `${short(monday, { month: "short", day: "numeric" })} – ${short(days[6], { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <>
      <PageHeader
        title="Bookings"
        lead="Appointment requests from the website and your week at a glance."
        action={
          <Link
            href="/admin/bookings/availability"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy shadow-card ring-1 ring-mist/60 hover:ring-blue"
          >
            Opening hours & time off
          </Link>
        }
      />

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy">
          Awaiting your confirmation
          {pending.length > 0 && <span className="rounded-full bg-blue px-2 py-0.5 text-xs font-semibold text-white">{pending.length}</span>}
        </h2>
        {pending.length === 0 ? (
          <EmptyState title="No requests waiting" text="New appointment requests from the website will appear here." />
        ) : (
          <ul className="space-y-4">
            {pending.map((b) => (
              <li key={b.id}>
                <BookingCard b={b} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy">{range}</h2>
          <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-card ring-1 ring-mist/60">
            <WeekLink href={`/admin/bookings?week=${addDays(monday, -7)}`} label="Previous week" d="M15 6l-6 6 6 6" />
            <Link href="/admin/bookings" className="rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-surface">
              This week
            </Link>
            <WeekLink href={`/admin/bookings?week=${addDays(monday, 7)}`} label="Next week" d="M9 6l6 6-6 6" />
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="grid divide-y divide-mist/60 lg:grid-cols-7 lg:divide-x lg:divide-y-0">
            {days.map((d) => {
              const items = inWeek.filter((b) => localDay(new Date(b.start_at)) === d);
              const dayStart = zonedToDate(d, "00:00").getTime();
              const dayEnd = zonedToDate(addDays(d, 1), "00:00").getTime();
              const google = blocked.filter((g) => g.start < dayEnd && g.end > dayStart);
              const isToday = d === today;
              return (
                <div key={d} className={`min-h-28 p-3 lg:min-h-80 ${isToday ? "bg-blue/5" : ""}`}>
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.12em] ${isToday ? "text-blue-dark" : "text-muted"}`}>
                    {short(d, { weekday: "short" })}{" "}
                    <span className={`ml-0.5 text-base normal-case tracking-normal ${isToday ? "text-blue-dark" : "text-navy"}`}>
                      {short(d, { day: "numeric" })}
                    </span>
                  </p>
                  <ul className="space-y-2">
                    {items.map((b) => (
                      <li key={b.id}>
                        <Link
                          href={`/admin/bookings?week=${monday}&open=${b.id}#details`}
                          className={`block rounded-xl px-3 py-2 text-xs transition ${
                            b.status === "confirmed"
                              ? "bg-navy text-white hover:bg-navy-deep"
                              : "border border-dashed border-blue bg-blue/8 text-navy hover:bg-blue/15"
                          } ${selected?.id === b.id ? "ring-2 ring-green ring-offset-1" : ""}`}
                        >
                          <span className="block font-semibold">
                            {localTime(new Date(b.start_at))}–{localTime(new Date(b.end_at))}
                          </span>
                          <span className="block truncate">{b.name}</span>
                          <span className={`block truncate ${b.status === "confirmed" ? "text-white/70" : "text-muted"}`}>
                            {b.location === "home" ? "Home visit" : "Office"}
                            {b.status === "pending" && " · request"}
                          </span>
                        </Link>
                      </li>
                    ))}
                    {google.map((g, i) => (
                      <li
                        key={`g${i}`}
                        title="Blocked by your Google Calendar"
                        className="rounded-xl bg-[repeating-linear-gradient(135deg,#fde8e8_0,#fde8e8_6px,#fff_6px,#fff_12px)] px-3 py-2 text-xs text-[#9b1c1c] ring-1 ring-[#f5b5b5]"
                      >
                        <span className="block font-semibold">
                          {g.end - g.start >= 86_400_000 - 3_600_000 ? "All day" : `${localTime(new Date(Math.max(g.start, dayStart)))}–${localTime(new Date(Math.min(g.end, dayEnd)))}`}
                        </span>
                        <span className="block truncate">{g.label}</span>
                      </li>
                    ))}
                    {items.length === 0 && google.length === 0 && <li className="text-xs text-muted/60 lg:pt-2">—</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>
        <p className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-navy" /> Confirmed</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-dashed border-blue bg-blue/10" /> Awaiting confirmation</span>
          {blocked.length > 0 && (
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#fde8e8] ring-1 ring-[#f5b5b5]" /> Blocked in Google Calendar</span>
          )}
        </p>

        {selected && (
          <div id="details" className="mt-6 scroll-mt-24">
            <BookingCard b={selected} />
          </div>
        )}
      </section>

      <section className="mt-12">
        <Card className="p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-navy">See bookings in your phone calendar</h2>
          {feed ? (
            <>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Subscribe once and new bookings appear automatically in Google Calendar, Apple Calendar or Outlook.
                Requests show as tentative until you confirm them. Keep this link private.
              </p>
              <CopyLink url={feed} />
              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="font-semibold text-navy">iPhone</p>
                  <p className="mt-1 text-muted">
                    <a href={feed.replace(/^https:/, "webcal:")} className="font-medium text-blue-dark hover:underline">Tap here on your iPhone</a>{" "}
                    and choose Subscribe.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-navy">Google Calendar</p>
                  <p className="mt-1 text-muted">On a computer: Other calendars, +, From URL, then paste the link.</p>
                </div>
                <div>
                  <p className="font-semibold text-navy">Outlook</p>
                  <p className="mt-1 text-muted">Add calendar, Subscribe from web, then paste the link.</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted">Calendar apps refresh subscribed calendars on their own schedule, so a new booking can take a little while to appear.</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">Available once the admin login is fully set up (SESSION_SECRET).</p>
          )}
        </Card>
      </section>
    </>
  );
}

function WeekLink({ href, label, d }: { href: string; label: string; d: string }) {
  return (
    <Link href={href} aria-label={label} className="grid h-8 w-8 place-items-center rounded-full text-navy hover:bg-surface">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={d} />
      </svg>
    </Link>
  );
}
