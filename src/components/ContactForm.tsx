"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "@/app/actions/contact";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { Arrow } from "./ui";

const initial: ContactState = { status: "idle" };

const field =
  "w-full rounded-2xl border bg-white/70 px-4 py-3.5 text-ink placeholder:text-stone/50 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-clay/60";

export function ContactForm({ t }: { t: Dictionary["form"] }) {
  const locale = useLocale();
  const [state, action, pending] = useActionState(sendContact, initial);
  const e = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="animate-fade-up rounded-3xl border border-sage/60 bg-white/70 p-10 text-center"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest text-sage">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h3 className="mt-6 font-display text-2xl font-medium text-forest">{t.successTitle}</h3>
        <p className="mt-3 text-stone">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.name} htmlFor="name" error={e.name}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            className={`${field} ${e.name ? "border-clay" : "border-sand-dark"}`}
            placeholder={t.namePlaceholder}
          />
        </Field>
        <Field label={t.email} htmlFor="email" error={e.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`${field} ${e.email ? "border-clay" : "border-sand-dark"}`}
            placeholder={t.emailPlaceholder}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.phone} htmlFor="phone" error={e.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={`${field} border-sand-dark`}
            placeholder={t.phonePlaceholder}
          />
        </Field>
        <Field label={t.interest} htmlFor="interest" error={e.interest}>
          <select
            id="interest"
            name="interest"
            required
            defaultValue=""
            className={`${field} appearance-none ${e.interest ? "border-clay" : "border-sand-dark"}`}
          >
            <option value="" disabled>
              {t.choose}
            </option>
            {t.interests.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t.message} htmlFor="message" error={e.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={`${field} resize-y ${e.message ? "border-clay" : "border-sand-dark"}`}
          placeholder={t.messagePlaceholder}
        />
      </Field>

      {/* Honeypot */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && !Object.keys(e).length && (
        <p role="alert" className="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-stone/80">{t.consent}</p>
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-soft disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? t.sending : t.submit}
          {!pending && <Arrow />}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-forest">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-clay-dark" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
