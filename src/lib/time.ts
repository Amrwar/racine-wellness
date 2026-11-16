/** Date helpers pinned to Montréal time, so slots are right whatever the server's time zone. */

export const TZ = "America/Montreal";

const partsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** Minutes Montréal is ahead of UTC at this instant (negative: -300 in winter, -240 in summer). */
function offsetMinutes(at: Date) {
  const p = Object.fromEntries(partsFormat.formatToParts(at).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - Math.floor(at.getTime() / 1000) * 1000) / 60000);
}

/** "2026-11-20" + "09:30" in Montréal → the matching instant. */
export function zonedToDate(date: string, time: string) {
  const guess = new Date(`${date}T${time}:00Z`);
  let at = new Date(guess.getTime() - offsetMinutes(guess) * 60000);
  const second = offsetMinutes(at);
  if (second !== offsetMinutes(guess)) at = new Date(guess.getTime() - second * 60000);
  return at;
}

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** The Montréal calendar day of an instant, as "YYYY-MM-DD". */
export function localDay(at: Date) {
  return dayFormat.format(at);
}

/** The Montréal wall-clock time of an instant, as "HH:MM". */
export function localTime(at: Date) {
  return timeFormat.format(at);
}

/** Add whole days to a "YYYY-MM-DD" string. */
export function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday for a "YYYY-MM-DD" string. */
export function weekday(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
export const isTime = (v: unknown): v is string => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

/** "Friday, November 20" / "vendredi 20 novembre", plus the time, in Montréal. */
export function formatWhen(at: Date, locale: "en" | "fr") {
  const tag = locale === "fr" ? "fr-CA" : "en-CA";
  const day = new Intl.DateTimeFormat(tag, { timeZone: TZ, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(at);
  const time = new Intl.DateTimeFormat(tag, { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(at);
  return { day, time };
}

/** The current time in ms (server components read it once per request). */
export function nowMs() {
  return Date.now();
}
