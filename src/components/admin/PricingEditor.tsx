"use client";

import { useActionState, useState } from "react";
import { updatePricing, type PricingState } from "@/app/admin/actions";
import type { Bilingual, Pricing, PricedService } from "@/lib/pricing-data";

const input =
  "w-full rounded-xl border border-mist bg-white px-3.5 py-2.5 text-ink outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function BilingualFields({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: Bilingual;
  onChange: (v: Bilingual) => void;
  multiline?: boolean;
}) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(["en", "fr"] as const).map((lang) => (
        <Field key={lang} label={`${label} · ${lang === "en" ? "English" : "Français"}`}>
          <Tag
            value={value[lang]}
            onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
            rows={multiline ? 4 : undefined}
            className={`${input} ${multiline ? "resize-y leading-relaxed" : ""}`}
          />
        </Field>
      ))}
    </div>
  );
}

function Section({ title, text, children, action }: { title: string; text?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-mist/60 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          {text && <p className="mt-0.5 text-sm text-muted">{text}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

const newService = (): PricedService => ({
  id: `service-${Date.now().toString(36)}`,
  title: { en: "", fr: "" },
  text: { en: "", fr: "" },
  rates: [{ minutes: 60, price: 0 }],
});

export function PricingEditor({ initial }: { initial: Pricing }) {
  const [pricing, setPricing] = useState(initial);
  const [state, action, pending] = useActionState<PricingState, FormData>(updatePricing, { status: "idle" });
  // What the website shows now: the last successful save, or what the page loaded with.
  const saved = state.pricing ?? initial;
  const dirty = JSON.stringify(pricing) !== JSON.stringify(saved);

  const setService = (i: number, s: PricedService) =>
    setPricing((p) => ({ ...p, services: p.services.map((x, j) => (j === i ? s : x)) }));
  const moveService = (i: number, d: -1 | 1) =>
    setPricing((p) => {
      const services = [...p.services];
      [services[i], services[i + d]] = [services[i + d], services[i]];
      return { ...p, services };
    });

  return (
    <form action={action} className="space-y-6 pb-28">
      <input type="hidden" name="pricing" value={JSON.stringify(pricing)} />

      <Section
        title="First-session promotion"
        text="Shown as a badge next to the Pricing heading."
        action={
          <button
            type="button"
            role="switch"
            aria-checked={pricing.promo.enabled}
            aria-label="Show the promotion"
            onClick={() => setPricing((p) => ({ ...p, promo: { ...p.promo, enabled: !p.promo.enabled } }))}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${pricing.promo.enabled ? "bg-green" : "bg-mist"}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${pricing.promo.enabled ? "left-6" : "left-1"}`}
            />
          </button>
        }
      >
        <div className={pricing.promo.enabled ? "" : "opacity-50"}>
          <BilingualFields
            label="Promotion text"
            value={pricing.promo}
            onChange={(v) => setPricing((p) => ({ ...p, promo: { ...p.promo, ...v } }))}
          />
        </div>
      </Section>

      {pricing.services.map((s, i) => (
        <Section
          key={s.id}
          title={s.title.en || "New service"}
          action={
            <div className="flex shrink-0 items-center gap-1">
              <IconButton label="Move up" disabled={i === 0} onClick={() => moveService(i, -1)} d="M12 19V5M5 12l7-7 7 7" />
              <IconButton
                label="Move down"
                disabled={i === pricing.services.length - 1}
                onClick={() => moveService(i, 1)}
                d="M12 5v14M5 12l7 7 7-7"
              />
              <IconButton
                label="Remove service"
                danger
                disabled={pricing.services.length === 1}
                onClick={() => setPricing((p) => ({ ...p, services: p.services.filter((_, j) => j !== i) }))}
                d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
              />
            </div>
          }
        >
          <BilingualFields label="Name" value={s.title} onChange={(title) => setService(i, { ...s, title })} />
          <BilingualFields label="Description" value={s.text} onChange={(text) => setService(i, { ...s, text })} multiline />

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">Durations and prices</span>
            <ul className="space-y-2">
              {s.rates.map((r, k) => (
                <li key={k} className="flex items-center gap-3">
                  <div className="relative w-36">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={5}
                      max={600}
                      step={5}
                      required
                      aria-label="Duration in minutes"
                      value={r.minutes || ""}
                      onChange={(e) =>
                        setService(i, { ...s, rates: s.rates.map((x, j) => (j === k ? { ...x, minutes: Number(e.target.value) } : x)) })
                      }
                      className={`${input} pr-12`}
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">min</span>
                  </div>
                  <div className="relative w-36">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={10000}
                      step="any"
                      required
                      aria-label="Price in dollars"
                      value={Number.isNaN(r.price) ? "" : r.price}
                      onChange={(e) =>
                        setService(i, { ...s, rates: s.rates.map((x, j) => (j === k ? { ...x, price: Number(e.target.value) } : x)) })
                      }
                      className={`${input} pl-8`}
                    />
                  </div>
                  <IconButton
                    label="Remove this duration"
                    danger
                    disabled={s.rates.length === 1}
                    onClick={() => setService(i, { ...s, rates: s.rates.filter((_, j) => j !== k) })}
                    d="M6 6l12 12M18 6 6 18"
                  />
                </li>
              ))}
            </ul>
            {s.rates.length < 8 && (
              <button
                type="button"
                onClick={() => {
                  const last = s.rates[s.rates.length - 1];
                  setService(i, { ...s, rates: [...s.rates, { minutes: (last?.minutes ?? 30) + 30, price: last?.price ?? 0 }] });
                }}
                className="mt-3 text-sm font-semibold text-blue-dark hover:underline"
              >
                + Add a duration
              </button>
            )}
          </div>
        </Section>
      ))}

      {pricing.services.length < 12 && (
        <button
          type="button"
          onClick={() => setPricing((p) => ({ ...p, services: [...p.services, newService()] }))}
          className="w-full rounded-2xl border-2 border-dashed border-mist px-6 py-5 font-semibold text-navy transition hover:border-blue hover:bg-white"
        >
          + Add a massage service
        </button>
      )}

      <Section title="Home visits note" text="Shown under the price cards. Leave both empty to hide it.">
        <BilingualFields label="Note" value={pricing.homeVisits} onChange={(homeVisits) => setPricing((p) => ({ ...p, homeVisits }))} />
      </Section>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist/70 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="text-sm" role="status" aria-live="polite">
            {state.status === "error" ? (
              <span className="text-danger">{state.message}</span>
            ) : dirty ? (
              <span className="text-muted">You have unsaved changes.</span>
            ) : state.status === "saved" ? (
              <span className="font-medium text-[#007a43]">Saved. The website now shows these prices.</span>
            ) : (
              <span className="text-muted">Everything is up to date.</span>
            )}
          </p>
          <div className="flex shrink-0 gap-2">
            {dirty && (
              <button
                type="button"
                onClick={() => setPricing(saved)}
                className="rounded-full px-4 py-2.5 text-sm font-medium text-muted hover:text-navy"
              >
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

function IconButton({
  label,
  d,
  onClick,
  disabled,
  danger = false,
}: {
  label: string;
  d: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition disabled:opacity-30 ${
        danger ? "hover:bg-danger/8 hover:text-danger" : "hover:bg-surface hover:text-navy"
      } disabled:hover:bg-transparent disabled:hover:text-muted`}
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={d} />
      </svg>
    </button>
  );
}
