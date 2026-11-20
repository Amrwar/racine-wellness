import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendarToken, getAvailability } from "@/lib/bookings";
import { googleBusy } from "@/lib/google";
import type { Booking } from "@/lib/booking-data";
import { site } from "@/lib/site";
import { addDays, isDay, localDay, localTime, nowMs, weekday, zonedToDate } from "@/lib/time";
import { BookingCard } from "@/components/admin/BookingCard";
import { CopyLink } from "@/components/admin/CopyLink";
import { MonthGrid, WeekGrid, WeekList, type CalEvent } from "@/components/admin/Calendar";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Bookings" };

/** Monday of the week containing this day. */
const mondayOf = (d: string) => addDays(d, -((weekday(d) + 6) % 7));
const short = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-CA", { ...opts, timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  await requireAdmin();
  const { week, month: monthParam, view: viewParam, open } = await searchParams;
  const now = nowMs();
  const today = localDay(new Date(now));
  const view = viewParam === "month" ? "month" : "week";
  const monday = mondayOf(isDay(week) ? week : today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const month = typeof monthParam === "string" && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : (isDay(week) ? week : today).slice(0, 7);
  const monthStart = addDays(`${month}-01`, -((weekday(`${month}-01`) + 6) % 7));
  // The range the current view shows.
  const [from, to] = view === "month" ? [monthStart, addDays(monthStart, 42)] : [monday, addDays(monday, 7)];

  const sql = await db();
  const pending = (await sql`SELECT * FROM bookings WHERE status = 'pending' AND end_at > now() ORDER BY start_at`) as Booking[];
  const inRange = (await sql`SELECT * FROM bookings WHERE status IN ('pending', 'confirmed')
    AND start_at >= ${zonedToDate(from, "00:00").toISOString()}
    AND start_at < ${zonedToDate(to, "00:00").toISOString()}
    ORDER BY start_at`) as Booking[];
  const [blocked, availability] = await Promise.all([googleBusy(zonedToDate(from, "00:00"), zonedToDate(to, "00:00")), getAvailability()]);
  const selected = typeof open === "string" ? inRange.find((b) => String(b.id) === open) : undefined;
  const events: CalEvent[] = [
    ...inRange.map((b) => ({
      id: String(b.id),
      start: new Date(b.start_at).getTime(),
      end: new Date(b.end_at).getTime(),
      kind: b.status === "confirmed" ? ("confirmed" as const) : ("pending" as const),
      title: b.name,
      sub: `${b.service_title}, ${b.minutes} min · ${b.location === "home" ? "Home visit" : "Office"}${b.status === "pending" ? " · request" : ""}`,
      href: `/admin/bookings?week=${mondayOf(localDay(new Date(b.start_at)))}&open=${b.id}#details`,
    })),
    ...blocked.map((g, i) => ({ id: `g${i}`, start: g.start, end: g.end, kind: "google" as const, title: g.label, sub: "Google Calendar" })),
  ];
  const monthName = new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-15T12:00:00Z`));
  const shiftMonth = (n: number) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  };

  const token = calendarToken();
  const feed = token ? `${site.url}/api/calendar/${token}.ics` : null;
  const range = `${short(monday, { month: "short", day: "numeric" })} – ${short(days[6], { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <>
      <PageHeader
        title="Bookings"
        lead="Appointment requests from the website and your week at a glance."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/bookings/availability"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy shadow-card ring-1 ring-mist/60 hover:ring-blue"
            >
              Opening hours & time off
            </Link>
            <a
              href="/admin/export/bookings.csv"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy shadow-card ring-1 ring-mist/60 hover:ring-blue"
            >
              Download spreadsheet
            </a>
            <Link
              href="/admin/bookings/new"
              className="inline-flex items-center gap-2 rounded-full bg-blue-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 hover:bg-[#00649f]"
            >
              + New booking
            </Link>
          </div>
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
          <h2 className="text-lg font-semibold text-navy">{view === "month" ? monthName : range}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-card ring-1 ring-mist/60">
              {(["week", "month"] as const).map((v) => (
                <Link
                  key={v}
                  href={v === "month" ? `/admin/bookings?view=month&month=${monday.slice(0, 7)}` : `/admin/bookings?week=${view === "month" ? `${month}-01` : monday}`}
                  aria-current={view === v ? "page" : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${view === v ? "bg-navy text-white" : "text-navy hover:bg-surface"}`}
                >
                  {v === "week" ? "Week" : "Month"}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-card ring-1 ring-mist/60">
              <WeekLink
                href={view === "month" ? `/admin/bookings?view=month&month=${shiftMonth(-1)}` : `/admin/bookings?week=${addDays(monday, -7)}`}
                label={view === "month" ? "Previous month" : "Previous week"}
                d="M15 6l-6 6 6 6"
              />
              <Link href={view === "month" ? "/admin/bookings?view=month" : "/admin/bookings"} className="rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-surface">
                Today
              </Link>
              <WeekLink
                href={view === "month" ? `/admin/bookings?view=month&month=${shiftMonth(1)}` : `/admin/bookings?week=${addDays(monday, 7)}`}
                label={view === "month" ? "Next month" : "Next week"}
                d="M9 6l6 6-6 6"
              />
            </div>
          </div>
        </div>

        {view === "month" ? (
          <MonthGrid month={month} events={events} availability={availability} today={today} />
        ) : (
          <>
            <div className="hidden md:block">
              <WeekGrid days={days} events={events} availability={availability} today={today} now={now} selectedId={selected ? String(selected.id) : undefined} />
            </div>
            <div className="md:hidden">
              <WeekList days={days} events={events} availability={availability} today={today} now={now} selectedId={selected ? String(selected.id) : undefined} />
            </div>
          </>
        )}
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-navy" /> Confirmed</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-dashed border-blue bg-blue/10" /> Awaiting confirmation</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-surface ring-1 ring-mist" /> Outside opening hours</span>
          {blocked.length > 0 && (
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#fde8e8] ring-1 ring-[#f5b5b5]" /> Blocked in Google Calendar</span>
          )}
          {view === "week" && <span className="hidden md:inline">Click an empty time to add a booking there.</span>}
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
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Subscribe once and new bookings appear automatically in Google Calendar, Apple Calendar or Outlook.
                Requests show as tentative until you confirm them. Keep this link private.
              </p>
              <CopyLink url={feed} />
              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="font-semibold text-navy">iPhone</p>
                  <p className="mt-1 text-muted-foreground">
                    <a href={feed.replace(/^https:/, "webcal:")} className="font-medium text-blue-dark hover:underline">Tap here on your iPhone</a>{" "}
                    and choose Subscribe.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-navy">Google Calendar</p>
                  <p className="mt-1 text-muted-foreground">On a computer: Other calendars, +, From URL, then paste the link.</p>
                </div>
                <div>
                  <p className="font-semibold text-navy">Outlook</p>
                  <p className="mt-1 text-muted-foreground">Add calendar, Subscribe from web, then paste the link.</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Calendar apps refresh subscribed calendars on their own schedule, so a new booking can take a little while to appear.</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Available once the admin login is fully set up (SESSION_SECRET).</p>
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
