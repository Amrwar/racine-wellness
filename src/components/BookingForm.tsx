"use client";

import { startTransition, useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { availableDays, availableTimes, requestBooking, type BookingState } from "@/app/actions/booking";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { formatPrice, type PricedService } from "@/lib/pricing-data";
import { Arrow } from "./ui";

const field =
  "w-full rounded-xl border bg-surface px-4 py-3 text-ink placeholder:text-muted/60 transition focus:border-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue/30";
const card = "rounded-3xl bg-white p-6 shadow-card ring-1 ring-mist/60 sm:p-8";

type Props = {
  t: Dictionary["booking"];
  form: Dictionary["form"];
  durationLabel: string;
  services: PricedService[];
  promo: string;
};

export function BookingForm({ t, form, durationLabel, services, promo }: Props) {
  const locale = useLocale();
  const tag = locale === "fr" ? "fr-CA" : "en-CA";
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const service = services.find((s) => s.id === serviceId) ?? services[0];
  const [minutes, setMinutes] = useState(service?.rates[0]?.minutes ?? 60);
  const rate = service?.rates.find((r) => r.minutes === minutes) ?? service?.rates[0];

  const [days, setDays] = useState<string[] | null>(null);
  const [date, setDate] = useState("");
  const [times, setTimes] = useState<string[] | null>(null);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState<"office" | "home">("office");
  const [loading, startLoading] = useTransition();
  // A slot taken in the meantime sends the client back to pick another time.
  const [state, action, pending] = useActionState<BookingState, FormData>(async (prev, fd) => {
    const result = await requestBooking(prev, fd);
    if (result.status === "taken") {
      setTime("");
      setStep(1);
      if (date && service) setTimes(await availableTimes(service.id, minutes, date));
    }
    return result;
  }, { status: "idle" });
  const e = state.errors ?? {};

  const dur = (n: number) => durationLabel.replace("{n}", String(n));
  const longDay = (d: string) =>
    new Intl.DateTimeFormat(tag, { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));
  const clock = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return new Intl.DateTimeFormat(tag, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
  };

  // Load open days whenever the treatment length changes and the client is on the date step.
  useEffect(() => {
    if (step !== 1 || !service) return;
    startLoading(async () => {
      const list = await availableDays(service.id, minutes);
      setDays(list);
      setDate((d) => (list.includes(d) ? d : ""));
    });
  }, [step, service, minutes]);

  useEffect(() => {
    if (!date || !service) return;
    startLoading(async () => {
      const list = await availableTimes(service.id, minutes, date);
      setTimes(list);
      setTime((x) => (list.includes(x) ? x : ""));
    });
  }, [date, service, minutes]);

  if (state.status === "success") {
    return (
      <div role="status" className={`${card} mx-auto max-w-2xl text-center sm:p-12`}>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-navy text-green">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-navy">{t.successTitle}</h2>
        <p className="mt-3 leading-relaxed text-muted">{state.message}</p>
      </div>
    );
  }

  if (!service || !rate) return null;

  const summary = (
    <aside className={`${card} h-fit lg:sticky lg:top-24`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-dark">{t.summary}</p>
      <p className="mt-3 text-lg font-semibold text-navy">{service.title[locale]}</p>
      <p className="mt-1 text-muted">
        {dur(rate.minutes)} · <span className="font-semibold text-navy">{formatPrice(rate.price, locale)}</span>
      </p>
      {date && (
        <p className="mt-4 border-t border-mist/60 pt-4 font-medium text-ink">
          <span className="capitalize">{longDay(date)}</span>
          {time && <span className="block text-muted">{clock(time)}</span>}
        </p>
      )}
      {step === 2 && (
        <p className="mt-4 border-t border-mist/60 pt-4 text-sm text-muted">
          {location === "home" ? t.home : `${t.office}, ${t.officeNote}`}
        </p>
      )}
      {promo && (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
          {promo}
        </p>
      )}
      <p className="mt-5 text-xs leading-relaxed text-muted">{t.pendingNote}</p>
    </aside>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div>
        <ol className="mb-6 flex flex-wrap gap-x-6 gap-y-2" aria-label="Steps">
          {t.steps.map((label, i) => (
            <li
              key={label}
              aria-current={i === step ? "step" : undefined}
              className={`flex items-center gap-2 text-sm font-medium ${i === step ? "text-navy" : i < step ? "text-blue-dark" : "text-muted/70"}`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${
                  i === step ? "bg-navy text-white" : i < step ? "bg-blue/15 text-blue-dark" : "bg-white text-muted ring-1 ring-mist"
                }`}
              >
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>

        {/* Submitted via onSubmit so a validation error doesn't reset what the client typed. */}
        <form
          noValidate
          onSubmit={(ev) => {
            ev.preventDefault();
            const data = new FormData(ev.currentTarget);
            startTransition(() => action(data));
          }}
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="service" value={service.id} />
          <input type="hidden" name="minutes" value={minutes} />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="time" value={time} />
          <input type="hidden" name="location" value={location} />

          {/* Step 1: treatment */}
          <div hidden={step !== 0} className={card}>
            <h2 className="text-lg font-semibold text-navy">{t.chooseService}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={s.id === service.id}
                  onClick={() => {
                    setServiceId(s.id);
                    if (!s.rates.some((r) => r.minutes === minutes)) setMinutes(s.rates[0].minutes);
                  }}
                  className={`rounded-2xl border-2 p-5 text-left transition ${
                    s.id === service.id ? "border-blue bg-blue/5" : "border-mist/70 hover:border-blue/50"
                  }`}
                >
                  <span className="block font-semibold text-navy">{s.title[locale]}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{s.text[locale]}</span>
                </button>
              ))}
            </div>
            <h2 className="mt-8 text-lg font-semibold text-navy">{t.chooseDuration}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {service.rates.map((r) => (
                <button
                  key={r.minutes}
                  type="button"
                  aria-pressed={r.minutes === minutes}
                  onClick={() => setMinutes(r.minutes)}
                  className={`rounded-2xl border-2 px-5 py-3 text-left transition ${
                    r.minutes === minutes ? "border-blue bg-blue/5" : "border-mist/70 hover:border-blue/50"
                  }`}
                >
                  <span className="block font-semibold text-navy">{dur(r.minutes)}</span>
                  <span className="block text-sm text-muted">{formatPrice(r.price, locale)}</span>
                </button>
              ))}
            </div>
            <StepNav next={t.next} onNext={() => setStep(1)} />
          </div>

          {/* Step 2: date and time */}
          <div hidden={step !== 1} className={card}>
            {days === null ? (
              <p className="py-10 text-center text-muted">{t.loading}</p>
            ) : days.length === 0 ? (
              <p className="py-10 text-center text-muted">{t.noDays}</p>
            ) : (
              <div className="grid gap-8 md:grid-cols-[1fr_15rem]">
                <div>
                  <h2 className="text-lg font-semibold text-navy">{t.chooseDay}</h2>
                  <MonthPicker days={days} value={date} onChange={setDate} tag={tag} t={t} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-navy">{t.chooseTime}</h2>
                  {state.status === "taken" && (
                    <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                      {state.message}
                    </p>
                  )}
                  {!date ? (
                    <p className="mt-4 text-sm text-muted">{t.pickDay}</p>
                  ) : loading && !times ? (
                    <p className="mt-4 text-sm text-muted">{t.loading}</p>
                  ) : (
                    <div className="mt-4 grid max-h-80 grid-cols-3 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                      {(times ?? []).map((x) => (
                        <button
                          key={x}
                          type="button"
                          aria-pressed={x === time}
                          onClick={() => setTime(x)}
                          className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                            x === time ? "border-navy bg-navy text-white" : "border-mist/70 text-navy hover:border-blue"
                          }`}
                        >
                          {clock(x)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <StepNav back={t.back} onBack={() => setStep(0)} next={t.next} onNext={() => setStep(2)} nextDisabled={!date || !time} />
          </div>

          {/* Step 3: details */}
          <div hidden={step !== 2} className={`${card} space-y-5`}>
            <fieldset>
              <legend className="mb-3 text-lg font-semibold text-navy">{t.where}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["office", "home"] as const).map((loc) => (
                  <label
                    key={loc}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                      location === loc ? "border-blue bg-blue/5" : "border-mist/70 hover:border-blue/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="location-choice"
                      value={loc}
                      checked={location === loc}
                      onChange={() => setLocation(loc)}
                      className="sr-only"
                    />
                    <span className="block font-semibold text-navy">{loc === "office" ? t.office : t.home}</span>
                    <span className="mt-0.5 block text-sm text-muted">{loc === "office" ? t.officeNote : t.homeNote}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {location === "home" && (
              <Field label={t.address} htmlFor="address" error={e.address} required={form.required}>
                <input id="address" name="address" autoComplete="street-address" className={`${field} ${e.address ? "border-danger" : "border-mist"}`} placeholder={t.addressPlaceholder} />
              </Field>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={form.name} htmlFor="b-name" error={e.name} required={form.required}>
                <input id="b-name" name="name" autoComplete="name" className={`${field} ${e.name ? "border-danger" : "border-mist"}`} placeholder={form.namePlaceholder} />
              </Field>
              <Field label={form.phone} htmlFor="b-phone" error={e.phone} required={form.required}>
                <input id="b-phone" name="phone" type="tel" autoComplete="tel" className={`${field} ${e.phone ? "border-danger" : "border-mist"}`} placeholder={form.phonePlaceholder} />
              </Field>
            </div>
            <Field label={t.email} htmlFor="b-email" error={e.email} required={form.required}>
              <input id="b-email" name="email" type="email" autoComplete="email" className={`${field} ${e.email ? "border-danger" : "border-mist"}`} placeholder={form.emailPlaceholder} />
            </Field>
            <Field label={t.notes} htmlFor="b-notes">
              <textarea id="b-notes" name="notes" rows={4} className={`${field} resize-y border-mist`} placeholder={t.notesPlaceholder} />
            </Field>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-mist bg-surface px-4 py-3 transition has-[:checked]:border-blue has-[:checked]:bg-blue/5">
              <input name="receipt" type="checkbox" value="yes" className="h-5 w-5 shrink-0 cursor-pointer rounded accent-navy" />
              <span>
                <span className="block text-sm font-medium text-navy">{form.receipt}</span>
                <span className="block text-xs text-muted">{form.receiptNote}</span>
              </span>
            </label>

            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
              <label htmlFor="b-company">Company</label>
              <input id="b-company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            {state.status === "error" && (
              <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {e.slot ?? state.message}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-mist/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-muted hover:text-navy">
                ← {t.back}
              </button>
              <button
                type="submit"
                disabled={pending}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 transition hover:-translate-y-0.5 hover:bg-[#00649f] disabled:cursor-wait disabled:opacity-60"
              >
                {pending ? t.sending : t.submit}
                {!pending && <Arrow />}
              </button>
            </div>
            <p className="text-xs leading-relaxed text-muted">{form.consent}</p>
          </div>
        </form>
      </div>
      {summary}
    </div>
  );
}

function StepNav({
  back,
  onBack,
  next,
  onNext,
  nextDisabled,
}: {
  back?: string;
  onBack?: () => void;
  next: string;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-mist/60 pt-5">
      {back ? (
        <button type="button" onClick={onBack} className="text-sm font-semibold text-muted hover:text-navy">
          ← {back}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="group inline-flex items-center gap-2 rounded-full bg-blue-dark px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue/25 transition hover:bg-[#00649f] disabled:opacity-40 disabled:shadow-none"
      >
        {next} <Arrow />
      </button>
    </div>
  );
}

function MonthPicker({
  days,
  value,
  onChange,
  tag,
  t,
}: {
  days: string[];
  value: string;
  onChange: (d: string) => void;
  tag: string;
  t: Dictionary["booking"];
}) {
  const open = useMemo(() => new Set(days), [days]);
  const months = useMemo(() => [...new Set(days.map((d) => d.slice(0, 7)))], [days]);
  const [mi, setMi] = useState(0);
  const month = months[Math.min(mi, months.length - 1)];
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = first.getUTCDay();
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(tag, { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 1 + i))),
  );
  const label = new Intl.DateTimeFormat(tag, { month: "long", year: "numeric", timeZone: "UTC" }).format(first);

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold capitalize text-navy">{label}</p>
        <div className="flex gap-1">
          {[
            { d: -1, l: t.prevMonth, p: "M15 6l-6 6 6 6" },
            { d: 1, l: t.nextMonth, p: "M9 6l6 6-6 6" },
          ].map((b) => (
            <button
              key={b.d}
              type="button"
              aria-label={b.l}
              disabled={b.d < 0 ? mi === 0 : mi >= months.length - 1}
              onClick={() => setMi((v) => v + b.d)}
              className="grid h-9 w-9 place-items-center rounded-full text-navy hover:bg-surface disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={b.p} />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w, i) => (
          <span key={i} className="pb-1 text-xs font-semibold uppercase text-muted">
            {w}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`x${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = `${month}-${String(i + 1).padStart(2, "0")}`;
          const available = open.has(d);
          const selected = d === value;
          return (
            <button
              key={d}
              type="button"
              disabled={!available}
              aria-pressed={selected}
              onClick={() => onChange(d)}
              className={`aspect-square rounded-xl text-sm font-medium transition ${
                selected
                  ? "bg-navy text-white"
                  : available
                    ? "bg-blue/8 text-navy hover:bg-blue/20"
                    : "text-muted/40"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-navy">
        {label}
        {required && (
          <>
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> ({required})</span>
          </>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
