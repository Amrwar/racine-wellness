"use client";

import { useActionState, useState } from "react";
import { updateAvailability, type AvailabilityState } from "@/app/admin/actions";
import { dayNames, type Availability } from "@/lib/booking-data";

const input =
  "rounded-xl border border-mist bg-white px-3 py-2 text-ink outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/15";

/** Monday first, the way a working week reads. */
const order = [1, 2, 3, 4, 5, 6, 0];

function Section({ title, text, children }: { title: string; text?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-mist/60 sm:p-7">
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      {text && <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function NumberField({ label, suffix, value, onChange, min, max }: { label: string; suffix: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className="relative block">
        <input
          type="number"
          min={min}
          max={max}
          value={Number.isNaN(value) ? "" : value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`${input} w-full pr-16`}
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>
      </span>
    </label>
  );
}

export function AvailabilityEditor({ initial, today }: { initial: Availability; today: string }) {
  const [a, setA] = useState(initial);
  const [state, action, pending] = useActionState<AvailabilityState, FormData>(updateAvailability, { status: "idle" });
  const saved = state.availability ?? initial;
  const dirty = JSON.stringify(a) !== JSON.stringify(saved);
  const [newDate, setNewDate] = useState("");
  const [special, setSpecial] = useState({ date: "", start: "09:00", end: "12:00" });
  const upcoming = a.closedDates.filter((d) => d >= today);

  const setDay = (i: number, patch: Partial<Availability["week"][number]>) =>
    setA((x) => ({ ...x, week: x.week.map((d, j) => (j === i ? { ...d, ...patch } : d)) }));
  const fmt = (d: string) =>
    new Intl.DateTimeFormat("en-CA", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
      new Date(`${d}T12:00:00Z`),
    );

  return (
    <form action={action} className="space-y-6 pb-28">
      <input type="hidden" name="availability" value={JSON.stringify(a)} />

      <Section title="Weekly hours" text="Clients can request appointments that start and end within these hours.">
        <ul className="divide-y divide-mist/60">
          {order.map((i) => {
            const d = a.week[i];
            const invalid = d.open && d.start >= d.end;
            return (
              <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <label className="flex w-36 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={d.open}
                    onChange={(e) => setDay(i, { open: e.target.checked })}
                    className="h-5 w-5 cursor-pointer accent-navy"
                  />
                  <span className={`font-medium ${d.open ? "text-navy" : "text-muted-foreground"}`}>{dayNames[i]}</span>
                </label>
                {d.open ? (
                  <div className="flex items-center gap-2">
                    <input type="time" step={1800} value={d.start} onChange={(e) => setDay(i, { start: e.target.value })} aria-label={`${dayNames[i]} start`} className={`${input} ${invalid ? "border-danger" : ""}`} />
                    <span className="text-muted-foreground">to</span>
                    <input type="time" step={1800} value={d.end} onChange={(e) => setDay(i, { end: e.target.value })} aria-label={`${dayNames[i]} end`} className={`${input} ${invalid ? "border-danger" : ""}`} />
                    {invalid && <span className="text-sm text-danger">End must be after start</span>}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Closed</span>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Booking rules">
        <div className="grid gap-5 sm:grid-cols-3">
          <NumberField label="Time between appointments" suffix="min" min={0} max={240} value={a.bufferMinutes} onChange={(n) => setA((x) => ({ ...x, bufferMinutes: n }))} />
          <NumberField label="Book at least" suffix="hours ahead" min={0} max={336} value={a.minNoticeHours} onChange={(n) => setA((x) => ({ ...x, minNoticeHours: n }))} />
          <NumberField label="Calendar open for" suffix="days" min={1} max={365} value={a.maxDaysAhead} onChange={(n) => setA((x) => ({ ...x, maxDaysAhead: n }))} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Time between appointments leaves room for travel and set-up, especially for home visits.</p>
      </Section>

      <Section title="Special hours" text="Different hours on one date, such as a holiday eve. They replace that day's usual hours.">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Date</span>
            <input type="date" min={today} value={special.date} onChange={(e) => setSpecial((s) => ({ ...s, date: e.target.value }))} className={input} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">From</span>
            <input type="time" step={900} value={special.start} onChange={(e) => setSpecial((s) => ({ ...s, start: e.target.value }))} className={input} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">To</span>
            <input type="time" step={900} value={special.end} onChange={(e) => setSpecial((s) => ({ ...s, end: e.target.value }))} className={input} />
          </label>
          <button
            type="button"
            disabled={!special.date || !special.start || !special.end || special.start >= special.end}
            onClick={() => {
              setA((x) => ({
                ...x,
                specialHours: [...x.specialHours.filter((s) => s.date !== special.date), special].sort((p, q) => p.date.localeCompare(q.date)),
                closedDates: x.closedDates.filter((d) => d !== special.date),
              }));
              setSpecial({ date: "", start: "09:00", end: "12:00" });
            }}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-40"
          >
            Add
          </button>
        </div>
        {a.specialHours.filter((s) => s.date >= today).length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {a.specialHours
              .filter((s) => s.date >= today)
              .map((s) => (
                <li key={s.date} className="flex items-center gap-1 rounded-full bg-surface py-1 pl-4 pr-1 text-sm text-navy ring-1 ring-mist/70">
                  {fmt(s.date)} · {s.start}–{s.end}
                  <button
                    type="button"
                    aria-label={`Remove special hours on ${fmt(s.date)}`}
                    onClick={() => setA((x) => ({ ...x, specialHours: x.specialHours.filter((c) => c.date !== s.date) }))}
                    className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-white hover:text-danger"
                  >
                    ×
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No special hours coming up.</p>
        )}
      </Section>

      <Section title="Time off" text="Days when no online bookings are accepted, such as holidays.">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Add a day off</span>
            <input type="date" min={today} value={newDate} onChange={(e) => setNewDate(e.target.value)} className={input} />
          </label>
          <button
            type="button"
            disabled={!newDate}
            onClick={() => {
              setA((x) => ({ ...x, closedDates: [...new Set([...x.closedDates, newDate])].sort() }));
              setNewDate("");
            }}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-40"
          >
            Add
          </button>
        </div>
        {upcoming.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {upcoming.map((d) => (
              <li key={d} className="flex items-center gap-1 rounded-full bg-surface py-1 pl-4 pr-1 text-sm text-navy ring-1 ring-mist/70">
                {fmt(d)}
                <button
                  type="button"
                  aria-label={`Remove ${fmt(d)}`}
                  onClick={() => setA((x) => ({ ...x, closedDates: x.closedDates.filter((c) => c !== d) }))}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-white hover:text-danger"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No upcoming days off.</p>
        )}
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist/70 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="text-sm" role="status" aria-live="polite">
            {state.status === "error" ? (
              <span className="text-danger">{state.message}</span>
            ) : dirty ? (
              <span className="text-muted-foreground">You have unsaved changes.</span>
            ) : state.status === "saved" ? (
              <span className="font-medium text-[#007a43]">Saved. Online booking now uses these hours.</span>
            ) : (
              <span className="text-muted-foreground">Everything is up to date.</span>
            )}
          </p>
          <div className="flex shrink-0 gap-2">
            {dirty && (
              <button type="button" onClick={() => setA(saved)} className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-navy">
                Undo changes
              </button>
            )}
            <button
              disabled={!dirty || pending}
              className="rounded-full bg-blue-dark px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 transition hover:bg-[#00649f] disabled:opacity-50 disabled:shadow-none"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
