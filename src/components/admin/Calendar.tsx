import Link from "next/link";
import type { Availability } from "@/lib/booking-data";
import { addDays, fromMinutes, localDay, localTime, toMinutes, weekday, zonedToDate } from "@/lib/time";

/** One block on the calendar: a booking (confirmed or awaiting confirmation) or a Google Calendar block. */
export type CalEvent = {
  id: string;
  start: number;
  end: number;
  kind: "confirmed" | "pending" | "google";
  title: string;
  sub: string;
  href?: string;
};

const HOUR_PX = 52;
const shortDate = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-CA", { ...opts, timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

const tone = {
  confirmed: "bg-navy text-white hover:bg-navy-deep",
  pending: "border border-dashed border-blue bg-[#e8f5ff] text-navy hover:bg-[#d6eeff]",
  google: "bg-[repeating-linear-gradient(135deg,#fde8e8_0,#fde8e8_6px,#fff_6px,#fff_12px)] text-[#9b1c1c] ring-1 ring-[#f5b5b5]",
};

/** Parts of a day an event covers, in minutes from that day's midnight (Montréal time). */
function span(e: CalEvent, day: string) {
  const dayStart = zonedToDate(day, "00:00").getTime();
  const dayEnd = zonedToDate(addDays(day, 1), "00:00").getTime();
  if (e.end <= dayStart || e.start >= dayEnd) return null;
  const from = e.start <= dayStart ? 0 : toMinutes(localTime(new Date(e.start)));
  const to = e.end >= dayEnd ? 24 * 60 : toMinutes(localTime(new Date(e.end)));
  return { from, to: Math.max(to, from + 15), allDay: e.start <= dayStart && e.end >= dayEnd };
}

/** Side-by-side columns for overlapping events. */
function lanes<T extends { from: number; to: number }>(items: T[]) {
  const sorted = [...items].sort((a, b) => a.from - b.from || b.to - a.to);
  const out: (T & { lane: number; lanes: number })[] = [];
  let group: (T & { lane: number; lanes: number })[] = [];
  let groupEnd = -1;
  const flush = () => {
    const n = Math.max(1, ...group.map((g) => g.lane + 1));
    group.forEach((g) => (g.lanes = n));
    out.push(...group);
    group = [];
  };
  for (const it of sorted) {
    if (it.from >= groupEnd && group.length) flush();
    const used = new Set(group.filter((g) => g.to > it.from).map((g) => g.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    group.push({ ...it, lane, lanes: 1 });
    groupEnd = Math.max(groupEnd, it.to);
  }
  if (group.length) flush();
  return out;
}

function openHours(a: Availability, day: string) {
  const h = a.week[weekday(day)];
  if (!h.open || a.closedDates.includes(day)) return null;
  return { from: toMinutes(h.start), to: toMinutes(h.end) };
}

/** Week as a time grid (computers and tablets): click an empty half-hour to add a booking there. */
export function WeekGrid({
  days,
  events,
  availability,
  today,
  now,
  selectedId,
}: {
  days: string[];
  events: CalEvent[];
  availability: Availability;
  today: string;
  now: number;
  selectedId?: string;
}) {
  // Show at least 8:00–20:00, stretched to fit opening hours and any appointment.
  let first = 8 * 60;
  let last = 20 * 60;
  for (const d of days) {
    const o = openHours(availability, d);
    if (o) {
      first = Math.min(first, o.from);
      last = Math.max(last, o.to);
    }
    for (const e of events) {
      const s = span(e, d);
      if (s && !s.allDay) {
        first = Math.min(first, s.from);
        last = Math.max(last, s.to);
      }
    }
  }
  first = Math.floor(first / 60) * 60;
  last = Math.ceil(last / 60) * 60;
  const height = ((last - first) / 60) * HOUR_PX;
  const y = (min: number) => ((Math.min(Math.max(min, first), last) - first) / 60) * HOUR_PX;
  const hours = Array.from({ length: (last - first) / 60 }, (_, i) => first + i * 60);
  const allDay = days.map((d) => events.filter((e) => span(e, d)?.allDay));
  const hasAllDay = allDay.some((l) => l.length);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-mist/60">
      {/* Day headings */}
      <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b border-mist/60">
        <div />
        {days.map((d) => {
          const isToday = d === today;
          const closed = !openHours(availability, d);
          return (
            <div key={d} className="border-l border-mist/60 px-2 py-3 text-center">
              <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${isToday ? "text-blue-dark" : "text-muted"}`}>
                {shortDate(d, { weekday: "short" })}
              </p>
              <p
                className={`mx-auto mt-1 grid h-9 w-9 place-items-center rounded-full text-lg font-semibold ${
                  isToday ? "bg-blue-dark text-white" : "text-navy"
                }`}
              >
                {shortDate(d, { day: "numeric" })}
              </p>
              {closed && <p className="mt-0.5 text-[0.7rem] text-muted">Closed</p>}
            </div>
          );
        })}
      </div>

      {hasAllDay && (
        <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b border-mist/60 bg-surface/60">
          <p className="self-center pr-2 text-right text-[0.65rem] font-semibold uppercase text-muted">All day</p>
          {allDay.map((list, i) => (
            <div key={i} className="space-y-1 border-l border-mist/60 p-1">
              {list.map((e) => (
                <p key={e.id} title={`${e.title} (Google Calendar)`} className={`truncate rounded-md px-2 py-1 text-xs font-medium ${tone[e.kind]}`}>
                  {e.title}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Time grid */}
      <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
        <div className="relative" style={{ height }}>
          {hours.map((h) => (
            <span key={h} className="absolute right-2 -translate-y-1/2 text-[0.7rem] font-medium text-muted" style={{ top: y(h) }}>
              {h === first ? "" : fromMinutes(h)}
            </span>
          ))}
        </div>
        {days.map((d) => {
          const open = openHours(availability, d);
          const dayEvents = lanes(
            events
              .map((e) => ({ e, s: span(e, d) }))
              .filter((x): x is { e: CalEvent; s: NonNullable<ReturnType<typeof span>> } => Boolean(x.s && !x.s.allDay))
              .map(({ e, s }) => ({ ...e, from: s.from, to: s.to })),
          );
          const nowMin = d === today ? toMinutes(localTime(new Date(now))) : -1;
          const slots = [];
          for (let m = first; m < last; m += 30) {
            if (zonedToDate(d, fromMinutes(m)).getTime() <= now) continue;
            slots.push(m);
          }
          return (
            <div key={d} className="relative border-l border-mist/60" style={{ height }}>
              {/* Closed time, shaded */}
              {!open ? (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#f3f5f7_0,#f3f5f7_8px,#fafbfc_8px,#fafbfc_16px)]" />
              ) : (
                <>
                  <div className="absolute inset-x-0 top-0 bg-surface/80" style={{ height: y(open.from) }} />
                  <div className="absolute inset-x-0 bottom-0 bg-surface/80" style={{ top: y(open.to) }} />
                </>
              )}
              {/* Hour lines */}
              {hours.map((h) => (
                <div key={h} className="absolute inset-x-0 border-t border-mist/50" style={{ top: y(h) }} />
              ))}
              {/* Empty half-hours: click to add a booking */}
              {slots.map((m) => (
                <Link
                  key={m}
                  href={`/admin/bookings/new?date=${d}&time=${fromMinutes(m)}`}
                  title={`New booking ${fromMinutes(m)}`}
                  className="group absolute inset-x-0 z-0 flex items-center px-2 hover:bg-blue/8"
                  style={{ top: y(m), height: HOUR_PX / 2 }}
                >
                  <span className="hidden text-[0.7rem] font-semibold text-blue-dark group-hover:inline">+ {fromMinutes(m)}</span>
                </Link>
              ))}
              {/* Appointments and Google blocks */}
              {dayEvents.map((e) => {
                const style = {
                  top: y(e.from) + 1,
                  height: Math.max(y(e.to) - y(e.from) - 2, 20),
                  left: `calc(${(e.lane / e.lanes) * 100}% + 2px)`,
                  width: `calc(${100 / e.lanes}% - 4px)`,
                };
                const body = (
                  <>
                    <span className="block font-semibold">
                      {fromMinutes(e.from)}–{e.to >= 24 * 60 ? "24:00" : fromMinutes(e.to)}
                    </span>
                    <span className="block truncate">{e.title}</span>
                    {e.to - e.from >= 60 && <span className="block truncate opacity-75">{e.sub}</span>}
                  </>
                );
                const cls = `absolute z-10 overflow-hidden rounded-lg px-2 py-1 text-[0.72rem] leading-snug shadow-sm transition ${tone[e.kind]} ${
                  selectedId === e.id ? "ring-2 ring-green ring-offset-1" : ""
                }`;
                return e.href ? (
                  <Link key={e.id} href={e.href} className={cls} style={style}>
                    {body}
                  </Link>
                ) : (
                  <div key={e.id} title={`${e.title} (Google Calendar)`} className={cls} style={style}>
                    {body}
                  </div>
                );
              })}
              {/* Now */}
              {nowMin >= first && nowMin <= last && (
                <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: y(nowMin) }}>
                  <div className="h-0.5 bg-danger" />
                  <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-danger" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Week as a simple list (phones). */
export function WeekList({ days, events, availability, today, now, selectedId }: { days: string[]; events: CalEvent[]; availability: Availability; today: string; now: number; selectedId?: string }) {
  return (
    <div className="divide-y divide-mist/60 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-mist/60">
      {days.map((d) => {
        const items = events.filter((e) => span(e, d)).sort((a, b) => a.start - b.start);
        const isToday = d === today;
        return (
          <div key={d} className={`flex gap-4 p-4 ${isToday ? "bg-blue/5" : ""}`}>
            <div className="w-12 shrink-0 text-center">
              <p className={`text-xs font-semibold uppercase ${isToday ? "text-blue-dark" : "text-muted"}`}>{shortDate(d, { weekday: "short" })}</p>
              <p className={`text-xl font-semibold ${isToday ? "text-blue-dark" : "text-navy"}`}>{shortDate(d, { day: "numeric" })}</p>
            </div>
            <ul className="min-w-0 flex-1 space-y-2">
              {items.map((e) => {
                const s = span(e, d)!;
                const inner = (
                  <>
                    <span className="font-semibold">{s.allDay ? "All day" : `${fromMinutes(s.from)}–${s.to >= 1440 ? "24:00" : fromMinutes(s.to)}`}</span>{" "}
                    <span>{e.title}</span>
                    <span className="block truncate opacity-75">{e.sub}</span>
                  </>
                );
                const cls = `block rounded-xl px-3 py-2 text-sm ${tone[e.kind]} ${selectedId === e.id ? "ring-2 ring-green ring-offset-1" : ""}`;
                return <li key={e.id}>{e.href ? <Link href={e.href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>}</li>;
              })}
              {items.length === 0 && (
                <li className="pt-2 text-sm text-muted">
                  {openHours(availability, d) ? "Nothing booked" : "Closed"}
                  {openHours(availability, d) && zonedToDate(d, "23:59").getTime() > now && (
                    <Link href={`/admin/bookings/new?date=${d}`} className="ml-2 font-semibold text-blue-dark hover:underline">
                      + Add
                    </Link>
                  )}
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** Month overview: up to three appointments per day; click a day to open its week. */
export function MonthGrid({ month, events, availability, today }: { month: string; events: CalEvent[]; availability: Availability; today: string }) {
  const first = `${month}-01`;
  const start = addDays(first, -((weekday(first) + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-mist/60">
      <div className="grid grid-cols-7 border-b border-mist/60">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <p key={d} className="py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {d}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const items = events.filter((e) => e.kind !== "google" && localDay(new Date(e.start)) === d).sort((a, b) => a.start - b.start);
          const blocked = events.some((e) => e.kind === "google" && span(e, d));
          const inMonth = d.startsWith(month);
          const isToday = d === today;
          const closed = !openHours(availability, d);
          return (
            <Link
              key={d}
              href={`/admin/bookings?week=${d}`}
              className={`group min-h-20 border-mist/60 p-1.5 transition hover:bg-blue/5 sm:min-h-28 sm:p-2 ${i % 7 ? "border-l" : ""} ${i >= 7 ? "border-t" : ""} ${
                closed && inMonth ? "bg-surface/70" : ""
              }`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-sm font-semibold ${
                  isToday ? "bg-blue-dark text-white" : inMonth ? "text-navy" : "text-muted/50"
                }`}
              >
                {Number(d.slice(8))}
              </span>
              <span className="mt-1 hidden space-y-1 sm:block">
                {items.slice(0, 3).map((e) => (
                  <span key={e.id} className={`block truncate rounded-md px-1.5 py-0.5 text-[0.7rem] ${tone[e.kind]}`}>
                    {localTime(new Date(e.start))} {e.title}
                  </span>
                ))}
                {items.length > 3 && <span className="block px-1.5 text-[0.7rem] font-semibold text-muted">+{items.length - 3} more</span>}
              </span>
              {/* Phones: dots */}
              <span className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                {items.slice(0, 4).map((e) => (
                  <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${e.kind === "confirmed" ? "bg-navy" : "bg-blue"}`} />
                ))}
              </span>
              {blocked && <span className="mt-1 block h-1 rounded-full bg-[#f5b5b5]" title="Blocked in Google Calendar" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
