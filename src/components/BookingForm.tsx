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
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const field = "h-10 bg-background px-3 shadow-xs";
const invalid = (err?: string) => (err ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" : "");
const card = "rounded-2xl border bg-card p-6 shadow-sm sm:p-8";
const option = "rounded-lg border bg-background shadow-xs transition-colors hover:bg-muted";
const optionOn = "border-primary bg-primary text-primary-foreground hover:bg-primary";
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
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="font-medium text-foreground sm:text-right">{value}</dd>
      </div>
    );
    return (
      <div>
        <Stepper labels={stepLabels} step={3} />
        <div role="status" className={cn(card, "mx-auto max-w-3xl border-green/40 sm:p-10")}>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-navy text-green">
              <Check aria-hidden className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t.receivedTitle}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{t.received}</p>
            </div>
          </div>
          {req && (
            <>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="h-7 px-3 text-sm font-normal text-muted-foreground">
                  {t.reference}: <span className="font-semibold text-foreground">{req.reference}</span>
                </Badge>
                <Badge variant="secondary" className="h-7 gap-1.5 px-3 text-sm">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
                  <Clock aria-hidden /> {t.statusPending}
                </Badge>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <dl className="divide-y rounded-xl border bg-muted/40 px-5 py-2">
                  {line(t.chooseService, req.service)}
                  {line(t.durationLabel, `${req.length ?? dur(req.minutes)} · ${req.price}`)}
                  {line(t.preferredTime, <span className="capitalize">{req.when}</span>)}
                  {line(t.where, req.where)}
                </dl>
                <dl className="divide-y rounded-xl border bg-muted/40 px-5 py-2">
                  <p className="py-3 text-sm font-medium text-muted-foreground">{t.yourDetails}</p>
                  {line(form.name, req.name)}
                  {line(t.email, <span className="break-all">{req.email}</span>)}
                  {line(form.phone, req.phone)}
                </dl>
              </div>
            </>
          )}
          <Separator className="mt-8" />
          <div className="pt-6">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{t.nextTitle}</h3>
            <ol className="mt-4 space-y-3">
              {t.nextSteps.map((n, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border bg-muted text-xs font-semibold text-navy tabular-nums">{i + 1}</span>
                  <span className="pt-0.5 leading-relaxed">{n.replace("{phone}", phone)}</span>
                </li>
              ))}
            </ol>
          </div>
          <a href="" className={cn(buttonVariants({ variant: "outline" }), "mt-8 h-10 px-4 shadow-xs rounded-[var(--btn-radius,0.625rem)]")}>
            {t.bookAnother}
          </a>
        </div>
      </div>
    );
  }

  if (!service || !rate) return null;

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex items-baseline justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
  const panel = "overflow-hidden rounded-xl border bg-card shadow-xs";
  const summary = (
    <aside className="h-fit space-y-6 lg:sticky lg:top-24">
      <div className={panel}>
        <p className="border-b bg-muted/40 px-6 py-4 font-semibold tracking-tight text-foreground">{t.summary}</p>
        <div className="px-6 pb-6 pt-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="font-semibold text-foreground">{service.title[locale]}</p>
            {step > 0 && (
              <button type="button" onClick={() => setStep(0)} className="inline-flex shrink-0 items-center gap-1 rounded-md text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
                <Pencil aria-hidden className="h-3 w-3" /> {t.changeTreatment}
              </button>
            )}
          </div>
          {row(t.durationLabel, service.perSession ? perSession.length : dur(rate.minutes))}
          {row(t.priceLabel, <span className="font-semibold tracking-tight tabular-nums">{`${formatPrice(rate.price, locale)} CAD`}</span>)}
          {date && row(t.dateLabel, <span className="capitalize">{longDay(date)}</span>)}
          {time && row(t.chooseTime, clock(time))}
          {step === 2 && row(t.where, location === "home" ? t.home : t.office)}
          {row(t.statusLabel, <span className="text-muted-foreground">{t.statusPending}</span>)}
          {promo && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-green/40 bg-background p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border bg-muted text-navy">
                <Tag aria-hidden className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-foreground">{promo}</p>
            </div>
          )}
          <p className="mt-4 border-t pt-4 text-xs leading-relaxed text-muted-foreground">{t.pendingNote}</p>
        </div>
      </div>
      <div className={cn(panel, "p-6")}>
        <p className="mb-5 font-semibold tracking-tight text-foreground">{t.whyTitle}</p>
        <ul className="space-y-5">
          {t.why.map((w, i) => {
            const Icon = whyIcons[i % whyIcons.length];
            return (
              <li key={w.title} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border bg-muted text-navy">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{w.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{w.text}</span>
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
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{t.chooseService}</h2>
              {services.length > 1 && (
                <label className="relative block w-full sm:max-w-sm">
                  <span className="sr-only">{t.search}</span>
                  <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={query}
                    onChange={(ev) => setQuery(ev.target.value)}
                    placeholder={t.search}
                    className="h-10 bg-background pl-9 pr-3 shadow-xs"
                  />
                </label>
              )}
            </div>
            <ul className="space-y-3">
              {shown.map((s) => {
                const active = s.id === service.id;
                return (
                  <li
                    key={s.id}
                    className={cn(
                      "flex flex-col gap-4 rounded-xl border bg-background p-4 shadow-xs transition-colors xl:flex-row xl:items-center",
                      active ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "hover:bg-muted/40",
                    )}
                  >
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setServiceId(s.id);
                        if (!s.rates.some((r) => r.minutes === minutes)) setMinutes(s.rates[0].minutes);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-4 rounded-lg text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted sm:h-24 sm:w-32">
                        <Image src={thumbnailFor(s.id)} alt="" fill sizes="144px" className="object-cover" />
                      </span>
                      <span>
                        <span className="block font-semibold tracking-tight text-foreground">{s.title[locale]}</span>
                        <span title={s.text[locale]} className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{s.text[locale]}</span>
                      </span>
                    </button>
                    <div className="grid shrink-0 grid-cols-3 gap-2 xl:flex xl:border-l xl:pl-4">
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
                            className={cn(
                              option,
                              "relative min-w-0 px-1.5 py-2.5 text-center text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:px-3 xl:min-w-[5.5rem] xl:flex-1",
                              on && optionOn,
                            )}
                          >
                            {on && (
                              <span className="absolute -top-2 left-1/2 grid h-4 w-4 -translate-x-1/2 place-items-center rounded-full bg-green text-navy ring-2 ring-background">
                                <Check aria-hidden className="h-2.5 w-2.5" strokeWidth={3} />
                              </span>
                            )}
                            <span className="block font-medium">{s.perSession ? perSession.title : dur(r.minutes)}</span>
                            <span className={cn("block text-sm font-semibold tracking-tight tabular-nums", on ? "text-primary-foreground/80" : "text-muted-foreground")}>{formatPrice(r.price, locale)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
              {shown.length === 0 && <li className="rounded-xl border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">{t.noMatch}</li>}
            </ul>
            <div className="mt-6 flex flex-col-reverse items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
              {show.home ? (
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border bg-muted text-navy">
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
              <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center">
                <p className="text-sm text-destructive">{t.loadError}</p>
                <button type="button" onClick={() => setReload((n) => n + 1)} className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-10 px-4 shadow-xs rounded-[var(--btn-radius,0.625rem)]")}>
                  {t.retry}
                </button>
              </div>
            ) : days === null ? (
              <p className="py-10 text-center text-muted-foreground">{t.loading}</p>
            ) : days.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">{t.noDays}</p>
            ) : (
              <div className="grid gap-8 md:grid-cols-[1fr_15rem]">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">{t.chooseDay}</h2>
                  <MonthPicker days={days} value={date} onChange={setDate} tag={tag} t={t} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">{t.chooseTime}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{t.timezone}</p>
                  {state.status === "taken" && (
                    <p role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {state.message}
                    </p>
                  )}
                  {!date ? (
                    <p className="mt-4 text-sm text-muted-foreground">{t.pickDay}</p>
                  ) : loading && !times ? (
                    <p className="mt-4 text-sm text-muted-foreground">{t.loading}</p>
                  ) : (
                    <div className="mt-4 grid max-h-80 grid-cols-3 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                      {(times ?? []).map((x) => (
                        <button
                          key={x}
                          type="button"
                          aria-pressed={x === time}
                          onClick={() => setTime(x)}
                          className={cn(
                            option,
                            "h-10 px-3 text-sm font-medium tabular-nums focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                            x === time && optionOn,
                          )}
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
              <legend className="mb-3 text-lg font-semibold tracking-tight text-foreground">{t.where}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(show.home ? (["office", "home"] as const) : (["office"] as const)).map((loc) => (
                  <label
                    key={loc}
                    className={cn(
                      "cursor-pointer rounded-lg border bg-background p-4 shadow-xs transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                      location === loc ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "hover:bg-muted",
                    )}
                  >
                    <input
                      type="radio"
                      name="location-choice"
                      value={loc}
                      checked={location === loc}
                      onChange={() => setLocation(loc)}
                      className="sr-only"
                    />
                    <span className="block font-medium text-foreground">{loc === "office" ? t.office : t.home}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{loc === "office" ? t.officeNote : t.homeNote}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {location === "home" && (
              <Field label={t.address} htmlFor="address" error={e.address} required={form.required}>
                <Input id="address" name="address" autoComplete="street-address" className={cn(field, invalid(e.address))} placeholder={t.addressPlaceholder} />
              </Field>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={form.name} htmlFor="b-name" error={e.name} required={form.required}>
                <Input id="b-name" name="name" autoComplete="name" className={cn(field, invalid(e.name))} placeholder={form.namePlaceholder} />
              </Field>
              <Field label={form.phone} htmlFor="b-phone" error={e.phone} required={form.required}>
                <Input id="b-phone" name="phone" type="tel" autoComplete="tel" className={cn(field, invalid(e.phone))} placeholder={form.phonePlaceholder} />
              </Field>
            </div>
            <Field label={t.email} htmlFor="b-email" error={e.email} required={form.required}>
              <Input id="b-email" name="email" type="email" autoComplete="email" className={cn(field, invalid(e.email))} placeholder={form.emailPlaceholder} />
            </Field>
            {show.notes && (
              <Field label={t.notes} htmlFor="b-notes">
                <Textarea id="b-notes" name="notes" rows={4} className="min-h-24 resize-y bg-background px-3 py-2 shadow-xs" placeholder={t.notesPlaceholder} />
              </Field>
            )}

            {show.receipt && (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-xs transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input name="receipt" type="checkbox" value="yes" className="h-4 w-4 shrink-0 cursor-pointer rounded accent-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">{form.receipt}</span>
                <span className="block text-xs text-muted-foreground">{form.receiptNote}</span>
              </span>
            </label>
            )}

            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
              <label htmlFor="b-company">Company</label>
              <input id="b-company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            {state.status === "error" && (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {e.slot ?? state.message}
              </p>
            )}

            <div>
              <label className={cn("flex cursor-pointer items-start gap-3 rounded-lg border bg-background px-4 py-3 shadow-xs transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5", (consentError || e.consent) && "border-destructive")}>
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
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-primary"
                />
                <span className="text-sm leading-relaxed text-foreground">
                  {t.consentLabel}{" "}
                  <a href={privacyHref} target="_blank" rel="noreferrer" className="font-medium text-foreground underline underline-offset-4 hover:text-navy">
                    {t.privacyLink}
                  </a>
                  <span className="text-destructive"> *</span>
                </span>
              </label>
              {(consentError || e.consent) && (
                <p id="consent-error" className="mt-1.5 text-sm text-destructive">
                  {t.errors.consent}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => setStep(1)} className={cn(buttonVariants({ variant: "ghost" }), "h-10 px-4 text-muted-foreground rounded-[var(--btn-radius,0.625rem)]")}>
                ← {t.back}
              </button>
              <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                className={cn(buttonVariants(), "group h-11 gap-2 px-6 shadow-xs hover:bg-primary/90 disabled:cursor-wait rounded-[var(--btn-radius,0.625rem)]")}
              >
                {pending ? t.sending : t.submit}
                {!pending && <ArrowRight aria-hidden className="h-4 w-4" />}
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
    <div className="mt-8 flex flex-col-reverse items-center justify-between gap-3 border-t pt-6 sm:flex-row">
      {back ? (
        <button type="button" onClick={onBack} className={cn(buttonVariants({ variant: "ghost" }), "h-10 px-4 text-muted-foreground rounded-[var(--btn-radius,0.625rem)]")}>
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
      className={cn(buttonVariants(), "group h-11 w-full gap-2 px-6 shadow-xs hover:bg-primary/90 sm:w-auto rounded-[var(--btn-radius,0.625rem)]")}
    >
      {children} <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-medium tabular-nums transition-colors",
              i === step ? "border-primary bg-primary text-primary-foreground" : i < step ? "border-green/50 bg-green/20 text-navy-deep" : "bg-background text-muted-foreground shadow-xs",
            )}
          >
            {i < step ? <Check aria-hidden className="h-4 w-4" strokeWidth={3} /> : i + 1}
          </span>
          <span className={cn("text-sm", i === step ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>{label}</span>
          {i < labels.length - 1 && <span aria-hidden className="hidden h-px w-8 bg-border sm:block" />}
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
        <p className="font-semibold capitalize text-foreground">{label}</p>
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
              className={cn(buttonVariants({ variant: "outline", size: "icon" }), "h-8 w-8 shadow-xs disabled:opacity-40")}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={b.p} />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w, i) => (
          <span key={i} className="pb-1 text-xs font-medium uppercase text-muted-foreground">
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
              className={cn(
                "aspect-square rounded-lg text-sm font-medium tabular-nums transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                selected
                  ? "bg-primary text-primary-foreground"
                  : available
                    ? "border bg-background text-foreground shadow-xs hover:bg-muted"
                    : "text-muted-foreground/40",
              )}
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
      <Label htmlFor={htmlFor} className="mb-2 block text-foreground">
        {label}
        {required && (
          <>
            <span aria-hidden className="ml-0.5 text-destructive">
              *
            </span>
            <span className="sr-only"> ({required})</span>
          </>
        )}
      </Label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
