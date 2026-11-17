"use client";

import type { FormFields } from "@/lib/design-data";
import { startTransition, useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { availableDays, availableTimes, requestBooking, type BookingState } from "@/app/actions/booking";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { formatPrice, type PricedService } from "@/lib/pricing-data";
import Image from "next/image";
import { ArrowRight, Check, Clock, Heart, House, MapPin, Pencil, Receipt, Search, Stethoscope, Tag } from "lucide-react";
import { filterServices, thumbnailFor } from "@/lib/booking-ui";

const field =
  "w-full rounded-xl border bg-surface px-4 py-3 text-ink placeholder:text-muted/60 transition focus:border-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue/30";
const shadow = "shadow-card";
const card = `rounded-3xl bg-white p-6 ${shadow} ring-1 ring-navy/5 sm:p-8`;
const whyIcons = [House, Stethoscope, Receipt, Heart];

type Props = {
  t: Dictionary["booking"];
  form: Dictionary["form"];
  durationLabel: string;
  /** "Per session" and "Length adapted to you", for fixed per-session prices. */
  perSession: { title: string; length: string };
  services: PricedService[];
  /** Optional fields switched on or off in Admin → Design. */
  fields?: Pick<FormFields, "bookingHomeVisits" | "bookingNotes" | "bookingReceipt">;
  promo: string;
  /** Treatment and length chosen on the pricing page (from the link). */
  initial?: { service?: string; minutes?: number };
  /** Business phone, shown in the next steps after a request. */
  phone: string;
  privacyHref: string;
};

export function BookingForm({ t, form, durationLabel, perSession, services, promo, fields, initial, phone, privacyHref }: Props) {
  const show = { home: fields?.bookingHomeVisits !== false, notes: fields?.bookingNotes !== false, receipt: fields?.bookingReceipt !== false };
  const locale = useLocale();
  const tag = locale === "fr" ? "fr-CA" : "en-CA";
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(services.find((s) => s.id === initial?.service)?.id ?? services[0]?.id ?? "");
  const service = services.find((s) => s.id === serviceId) ?? services[0];
  const [minutes, setMinutes] = useState(service?.rates.find((r) => r.minutes === initial?.minutes)?.minutes ?? service?.rates[0]?.minutes ?? 60);
  const rate = service?.rates.find((r) => r.minutes === minutes) ?? service?.rates[0];

  const [days, setDays] = useState<string[] | null>(null);
  const [date, setDate] = useState("");
  const [times, setTimes] = useState<string[] | null>(null);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState<"office" | "home">("office");
  const [query, setQuery] = useState("");
  const shown = filterServices(services, query, locale);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const stepLabels = [...t.steps, t.confirmStep];
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
      try {
        const list = await availableDays(service.id, minutes);
        setLoadError(false);
        setDays(list);
        setDate((d) => (list.includes(d) ? d : ""));
      } catch {
        setLoadError(true);
      }
    });
  }, [step, service, minutes, reload]);

  useEffect(() => {
    if (!date || !service) return;
    startLoading(async () => {
      try {
        const list = await availableTimes(service.id, minutes, date);
        setLoadError(false);
        setTimes(list);
        setTime((x) => (list.includes(x) ? x : ""));
      } catch {
        setLoadError(true);
      }
    });
  }, [date, service, minutes]);

  if (state.status === "success") {
    const req = state.request;
    const line = (label: string, value: React.ReactNode) => (
      <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <dt className="text-sm text-muted">{label}</dt>
        <dd className="font-semibold text-navy sm:text-right">{value}</dd>
      </div>
    );
    return (
      <div>
        <Stepper labels={stepLabels} step={3} />
        <div role="status" className={`${card} mx-auto max-w-3xl sm:p-10`}>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-navy text-green">
              <Check aria-hidden className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{t.receivedTitle}</h2>
              <p className="mt-2 leading-relaxed text-muted">{t.received}</p>
            </div>
          </div>
          {req && (
            <>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-surface px-4 py-1.5 text-sm text-ink ring-1 ring-navy/10">
                  {t.reference}: <span className="font-semibold text-navy">{req.reference}</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-green/15 px-4 py-1.5 text-sm font-semibold text-navy ring-1 ring-green/40">
                  <Clock aria-hidden className="h-4 w-4" /> {t.statusPending}
                </span>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <dl className="divide-y divide-navy/10 rounded-2xl bg-surface px-5 py-2">
                  {line(t.chooseService, req.service)}
                  {line(t.durationLabel, `${req.length ?? dur(req.minutes)} · ${req.price}`)}
                  {line(t.preferredTime, <span className="capitalize">{req.when}</span>)}
                  {line(t.where, req.where)}
                </dl>
                <dl className="divide-y divide-navy/10 rounded-2xl bg-surface px-5 py-2">
                  <p className="py-3 text-sm font-semibold uppercase tracking-wider text-muted">{t.yourDetails}</p>
                  {line(form.name, req.name)}
                  {line(t.email, <span className="break-all">{req.email}</span>)}
                  {line(form.phone, req.phone)}
                </dl>
              </div>
            </>
          )}
          <div className="mt-8 border-t border-navy/10 pt-6">
            <h3 className="text-lg font-semibold text-navy">{t.nextTitle}</h3>
            <ol className="mt-4 space-y-3">
              {t.nextSteps.map((n, i) => (
                <li key={i} className="flex items-start gap-3 text-ink">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-xs font-semibold text-white">{i + 1}</span>
                  <span className="pt-0.5">{n.replace("{phone}", phone)}</span>
                </li>
              ))}
            </ol>
          </div>
          <a href="" className="mt-8 inline-flex text-sm font-semibold text-navy underline underline-offset-4 hover:text-blue-dark">
            {t.bookAnother}
          </a>
        </div>
      </div>
    );
  }

  if (!service || !rate) return null;

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex items-baseline justify-between gap-4 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold text-navy">{value}</span>
    </div>
  );
  const panel = `overflow-hidden rounded-3xl bg-white ${shadow} ring-1 ring-navy/5`;
  const summary = (
    <aside className="h-fit space-y-6 lg:sticky lg:top-24">
      <div className={panel}>
        <p className="bg-surface px-6 py-4 text-lg font-semibold text-navy">{t.summary}</p>
        <div className="px-6 pb-6 pt-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="font-semibold text-ink">{service.title[locale]}</p>
            {step > 0 && (
              <button type="button" onClick={() => setStep(0)} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-navy underline underline-offset-4 hover:text-blue-dark">
                <Pencil aria-hidden className="h-3 w-3" /> {t.changeTreatment}
              </button>
            )}
          </div>
          {row(t.durationLabel, service.perSession ? perSession.length : dur(rate.minutes))}
          {row(t.priceLabel, `${formatPrice(rate.price, locale)} CAD`)}
          {date && row(t.dateLabel, <span className="capitalize">{longDay(date)}</span>)}
          {time && row(t.chooseTime, clock(time))}
          {step === 2 && row(t.where, location === "home" ? t.home : t.office)}
          {row(t.statusLabel, <span className="text-muted">{t.statusPending}</span>)}
          {promo && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-green/10 p-4 ring-1 ring-green/30">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-navy shadow-sm">
                <Tag aria-hidden className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-navy">{promo}</p>
            </div>
          )}
          <p className="mt-4 border-t border-navy/10 pt-4 text-xs leading-relaxed text-muted">{t.pendingNote}</p>
        </div>
      </div>
      <div className={`${panel} p-6`}>
        <p className="mb-5 text-lg font-semibold text-navy">{t.whyTitle}</p>
        <ul className="space-y-5">
          {t.why.map((w, i) => {
            const Icon = whyIcons[i % whyIcons.length];
            return (
              <li key={w.title} className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface text-navy">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-navy">{w.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{w.text}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(18rem,3fr)]">
      <div className="min-w-0">
        <Stepper labels={stepLabels} step={step} />

        {/* Submitted via onSubmit so a validation error doesn't reset what the client typed. */}
        <form
          noValidate
          onSubmit={(ev) => {
            ev.preventDefault();
            if (pending) return; // no double submissions
            if (!consent) {
              setConsentError(true);
              return;
            }
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
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{t.chooseService}</h2>
              {services.length > 1 && (
                <label className="relative block w-full sm:max-w-sm">
                  <span className="sr-only">{t.search}</span>
                  <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                  <input
                    type="search"
                    value={query}
                    onChange={(ev) => setQuery(ev.target.value)}
                    placeholder={t.search}
                    className="w-full rounded-full border border-navy/15 bg-white py-3 pl-12 pr-4 text-sm text-ink placeholder:text-muted/70 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
                  />
                </label>
              )}
            </div>
            <ul className="space-y-4">
              {shown.map((s) => {
                const active = s.id === service.id;
                return (
                  <li
                    key={s.id}
                    className={`flex flex-col gap-5 rounded-2xl p-4 transition xl:flex-row xl:items-center ${
                      active ? "bg-blue/5 ring-2 ring-blue-dark" : "ring-1 ring-navy/10 hover:ring-navy/30"
                    }`}
                  >
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setServiceId(s.id);
                        if (!s.rates.some((r) => r.minutes === minutes)) setMinutes(s.rates[0].minutes);
                      }}
                      className="flex flex-1 items-center gap-5 text-left"
                    >
                      <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface sm:h-28 sm:w-36">
                        <Image src={thumbnailFor(s.id)} alt="" fill sizes="144px" className="object-cover" />
                      </span>
                      <span>
                        <span className="block text-lg font-semibold text-ink">{s.title[locale]}</span>
                        <span title={s.text[locale]} className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{s.text[locale]}</span>
                      </span>
                    </button>
                    <div className="grid shrink-0 grid-cols-3 gap-2 border-navy/10 pt-2 sm:gap-3 xl:flex xl:border-l xl:pl-5 xl:pt-0">
                      {s.rates.map((r) => {
                        const on = active && r.minutes === minutes;
                        return (
                          <button
                            key={r.minutes}
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                              setServiceId(s.id);
                              setMinutes(r.minutes);
                            }}
                            className={`relative min-w-0 rounded-xl px-1.5 py-3 text-center text-sm transition sm:px-3 sm:text-base xl:min-w-[5.5rem] xl:flex-1 ${
                              on ? "bg-blue-dark text-white shadow-md shadow-blue/25" : "bg-white text-navy ring-1 ring-navy/15 hover:ring-blue"
                            }`}
                          >
                            {on && (
                              <span className="absolute -top-2.5 left-1/2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full bg-green text-navy ring-2 ring-white">
                                <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
                              </span>
                            )}
                            <span className="block font-semibold">{s.perSession ? perSession.title : dur(r.minutes)}</span>
                            <span className={`block text-sm ${on ? "text-white/85" : "text-muted"}`}>{formatPrice(r.price, locale)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
              {shown.length === 0 && <li className="rounded-2xl bg-surface p-6 text-center text-sm text-muted">{t.noMatch}</li>}
            </ul>
            <div className="mt-6 flex flex-col-reverse items-start justify-between gap-4 border-t border-navy/10 pt-6 sm:flex-row sm:items-center">
              {show.home ? (
                <p className="flex items-center gap-3 text-sm text-muted">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-navy">
                    <MapPin aria-hidden className="h-5 w-5" />
                  </span>
                  {t.homeNote}
                </p>
              ) : (
                <span />
              )}
              <ContinueButton onClick={() => setStep(1)}>{t.continueDate}</ContinueButton>
            </div>
          </div>

          {/* Step 2: date and time */}
          <div hidden={step !== 1} className={card}>
            {loadError ? (
              <div role="alert" className="py-10 text-center">
                <p className="text-danger">{t.loadError}</p>
                <button type="button" onClick={() => setReload((n) => n + 1)} className="mt-4 rounded-full px-5 py-2 text-sm font-semibold text-navy ring-1 ring-navy/20 hover:bg-surface">
                  {t.retry}
                </button>
              </div>
            ) : days === null ? (
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
                  <p className="mt-1 text-xs text-muted">{t.timezone}</p>
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
            <StepNav back={t.back} onBack={() => setStep(0)} next={t.continueDetails} onNext={() => setStep(2)} nextDisabled={!date || !time} />
          </div>

          {/* Step 3: details */}
          <div hidden={step !== 2} className={`${card} space-y-5`}>
            <fieldset>
              <legend className="mb-3 text-lg font-semibold text-navy">{t.where}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(show.home ? (["office", "home"] as const) : (["office"] as const)).map((loc) => (
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
            {show.notes && (
              <Field label={t.notes} htmlFor="b-notes">
                <textarea id="b-notes" name="notes" rows={4} className={`${field} resize-y border-mist`} placeholder={t.notesPlaceholder} />
              </Field>
            )}

            {show.receipt && (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-mist bg-surface px-4 py-3 transition has-[:checked]:border-blue has-[:checked]:bg-blue/5">
              <input name="receipt" type="checkbox" value="yes" className="h-5 w-5 shrink-0 cursor-pointer rounded accent-navy" />
              <span>
                <span className="block text-sm font-medium text-navy">{form.receipt}</span>
                <span className="block text-xs text-muted">{form.receiptNote}</span>
              </span>
            </label>
            )}

            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
              <label htmlFor="b-company">Company</label>
              <input id="b-company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            {state.status === "error" && (
              <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {e.slot ?? state.message}
              </p>
            )}

            <div>
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${consentError || e.consent ? "border-danger" : "border-mist"} has-[:checked]:border-navy has-[:checked]:bg-blue/5`}>
                <input
                  name="consent"
                  type="checkbox"
                  value="yes"
                  checked={consent}
                  onChange={(ev) => {
                    setConsent(ev.target.checked);
                    if (ev.target.checked) setConsentError(false);
                  }}
                  aria-invalid={consentError || Boolean(e.consent)}
                  aria-describedby={consentError || e.consent ? "consent-error" : undefined}
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-navy"
                />
                <span className="text-sm text-ink">
                  {t.consentLabel}{" "}
                  <a href={privacyHref} target="_blank" rel="noreferrer" className="font-medium text-navy underline underline-offset-2">
                    {t.privacyLink}
                  </a>
                  <span className="text-danger"> *</span>
                </span>
              </label>
              {(consentError || e.consent) && (
                <p id="consent-error" className="mt-1.5 text-sm text-danger">
                  {t.errors.consent}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-mist/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-muted hover:text-navy">
                ← {t.back}
              </button>
              <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                className="group inline-flex items-center justify-center gap-2 rounded-[var(--btn-radius,9999px)] bg-blue-dark px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue/25 transition hover:-translate-y-0.5 hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                {pending ? t.sending : t.submit}
                {!pending && <ArrowRight aria-hidden className="h-5 w-5" />}
              </button>
            </div>
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
    <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t border-navy/10 pt-6 sm:flex-row">
      {back ? (
        <button type="button" onClick={onBack} className="text-sm font-semibold text-muted hover:text-navy">
          ← {back}
        </button>
      ) : (
        <span />
      )}
      <ContinueButton onClick={onNext} disabled={nextDisabled}>
        {next}
      </ContinueButton>
    </div>
  );
}

function ContinueButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group inline-flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--btn-radius,9999px)] bg-blue-dark px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue/25 transition hover:-translate-y-0.5 hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none sm:w-auto"
    >
      {children} <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

/** Four numbered steps joined by lines; the current one is filled. */
function Stepper({ labels, step }: { labels: string[]; step: number }) {
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-3" aria-label="Steps">
      {labels.map((label, i) => (
        <li key={label} aria-current={i === step ? "step" : undefined} className="flex items-center gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold transition ${
              i === step ? "bg-navy text-white" : i < step ? "bg-green text-navy" : "bg-white text-navy ring-1 ring-navy/25"
            }`}
          >
            {i < step ? <Check aria-hidden className="h-4 w-4" strokeWidth={3} /> : i + 1}
          </span>
          <span className={`text-sm ${i === step ? "font-semibold text-navy" : "font-medium text-ink/80"}`}>{label}</span>
          {i < labels.length - 1 && <span aria-hidden className="hidden h-px w-8 bg-navy/15 sm:block" />}
        </li>
      ))}
    </ol>
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
