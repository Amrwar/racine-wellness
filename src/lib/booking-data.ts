/** Booking availability settings, edited in /admin/bookings/availability. Safe to import on the client. */

export type DayHours = { open: boolean; start: string; end: string };

export type Availability = {
  /** Index 0 = Sunday … 6 = Saturday. */
  week: DayHours[];
  /** Minutes kept free after each appointment for travel and set-up. */
  bufferMinutes: number;
  /** How far in advance a client must book. */
  minNoticeHours: number;
  /** How far ahead the calendar opens. */
  maxDaysAhead: number;
  /** Days Ziad is away, as "YYYY-MM-DD". */
  closedDates: string[];
  /** One-off hours for a date (e.g. Dec 24, 9:00–12:00), replacing that weekday's usual hours. */
  specialHours: SpecialHours[];
};

export type SpecialHours = { date: string; start: string; end: string };

/** The hours that apply on a date: day off, special hours, or the usual weekday hours. */
export function hoursOn(a: Availability, date: string): DayHours {
  const usual = a.week[new Date(`${date}T12:00:00Z`).getUTCDay()];
  if (a.closedDates.includes(date)) return { ...usual, open: false };
  const special = a.specialHours.find((s) => s.date === date);
  if (special) return { open: true, start: special.start, end: special.end };
  return usual;
}

export const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const defaultAvailability: Availability = {
  week: [
    { open: false, start: "10:00", end: "16:00" },
    { open: true, start: "09:00", end: "19:00" },
    { open: true, start: "09:00", end: "19:00" },
    { open: true, start: "09:00", end: "19:00" },
    { open: true, start: "09:00", end: "19:00" },
    { open: true, start: "09:00", end: "19:00" },
    { open: true, start: "09:00", end: "15:00" },
  ],
  bufferMinutes: 30,
  minNoticeHours: 12,
  maxDaysAhead: 60,
  closedDates: [],
  specialHours: [],
};

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const clamp = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/** Validates untrusted input. Returns null when unusable. */
export function parseAvailability(input: unknown): Availability | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  if (!Array.isArray(o.week) || o.week.length !== 7) return null;
  const week: DayHours[] = [];
  for (const d of o.week) {
    const r = (d ?? {}) as Record<string, unknown>;
    const start = String(r.start ?? "");
    const end = String(r.end ?? "");
    if (!TIME.test(start) || !TIME.test(end)) return null;
    if (r.open === true && start >= end) return null;
    week.push({ open: r.open === true, start, end });
  }
  const closedDates = (Array.isArray(o.closedDates) ? o.closedDates : [])
    .map(String)
    .filter((d) => DAY.test(d))
    .slice(0, 366);
  return {
    week,
    bufferMinutes: clamp(o.bufferMinutes, 0, 240, defaultAvailability.bufferMinutes),
    minNoticeHours: clamp(o.minNoticeHours, 0, 24 * 14, defaultAvailability.minNoticeHours),
    maxDaysAhead: clamp(o.maxDaysAhead, 1, 365, defaultAvailability.maxDaysAhead),
    closedDates: [...new Set(closedDates)].sort(),
    specialHours: (Array.isArray(o.specialHours) ? o.specialHours : [])
      .map((s) => {
        const r = (s ?? {}) as Record<string, unknown>;
        return { date: String(r.date ?? ""), start: String(r.start ?? ""), end: String(r.end ?? "") };
      })
      .filter((s) => DAY.test(s.date) && TIME.test(s.start) && TIME.test(s.end) && s.start < s.end)
      .filter((s, i, all) => all.findIndex((x) => x.date === s.date) === i)
      .sort((x, y) => x.date.localeCompare(y.date))
      .slice(0, 366),
  };
}

export type BookingStatus = "pending" | "confirmed" | "declined" | "cancelled";
export type BookingLocation = "office" | "home";

export type Booking = {
  id: number;
  created_at: string;
  start_at: string;
  end_at: string;
  service_id: string;
  service_title: string;
  minutes: number;
  price: number;
  location: BookingLocation;
  address: string | null;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  wants_receipt: boolean;
  locale: "en" | "fr";
  status: BookingStatus;
};
