"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "@/app/actions/contact";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { Arrow } from "./ui";

const initial: ContactState = { status: "idle" };

const field =
  "w-full rounded-xl border bg-surface px-4 py-3 text-ink placeholder:text-muted/60 transition focus:border-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue/30";

export function ContactForm({ t }: { t: Dictionary["form"] }) {
  const locale = useLocale();
  const [state, action, pending] = useActionState(sendContact, initial);
  const e = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="animate-fade-up rounded-2xl bg-surface p-10 text-center"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-navy text-green">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-navy">{t.successTitle}</h3>
        <p className="mt-3 text-muted">{state.message}</p>
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
            className={`${field} ${e.name ? "border-danger" : "border-mist"}`}
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
            className={`${field} ${e.email ? "border-danger" : "border-mist"}`}
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
            className={`${field} border-mist`}
            placeholder={t.phonePlaceholder}
          />
        </Field>
        <Field label={t.interest} htmlFor="interest" error={e.interest}>
          <select
            id="interest"
            name="interest"
            required
            defaultValue=""
            className={`${field} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2020%2020'%20fill='none'%20stroke='%23004575'%20stroke-width='1.75'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='m6%208%204%204%204-4'/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_0.9rem_center] bg-no-repeat pr-10 ${e.interest ? "border-danger" : "border-mist"}`}
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
          className={`${field} resize-y ${e.message ? "border-danger" : "border-mist"}`}
          placeholder={t.messagePlaceholder}
        />
      </Field>

      {/* Honeypot */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && !Object.keys(e).length && (
        <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted">{t.consent}</p>
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-blue-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 transition hover:-translate-y-0.5 hover:bg-[#00649f] hover:shadow-xl hover:shadow-blue/30 disabled:cursor-wait disabled:opacity-60"
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
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-navy">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
