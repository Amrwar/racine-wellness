"use client";

import type { FormFields } from "@/lib/design-data";
import { startTransition, useActionState } from "react";
import { sendContact, type ContactState } from "@/app/actions/contact";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Arrow } from "./ui/site";

const initial: ContactState = { status: "idle" };

const field = "h-10 bg-background px-3 shadow-xs";
const invalid = (err?: string) => (err ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" : "");

export function ContactForm({ t, fields }: { t: Dictionary["form"]; fields?: Pick<FormFields, "contactEmail" | "contactMessage" | "contactReceipt"> }) {
  const show = { email: fields?.contactEmail !== false, message: fields?.contactMessage !== false, receipt: fields?.contactReceipt !== false };
  const locale = useLocale();
  const [state, action, pending] = useActionState(sendContact, initial);
  const e = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="animate-fade-up rounded-xl border border-green/40 bg-card p-8 text-center shadow-xs sm:p-10"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-navy text-green">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{t.successTitle}</h3>
        <p className="mt-3 text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    // Submitted via onSubmit so a validation error doesn't reset what the visitor typed.
    <form
      noValidate
      className="space-y-5"
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.name} htmlFor="name" error={e.name} required={t.required}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            className={cn(field, invalid(e.name))}
            placeholder={t.namePlaceholder}
          />
        </Field>
        <Field label={t.phone} htmlFor="phone" error={e.phone} required={t.required}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className={cn(field, invalid(e.phone))}
            placeholder={t.phonePlaceholder}
          />
        </Field>
      </div>

      {show.email && (
      <Field label={t.email} htmlFor="email" error={e.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={cn(field, invalid(e.email))}
          placeholder={t.emailPlaceholder}
        />
      </Field>
      )}

      {show.message && (
      <Field label={t.message} htmlFor="message" error={e.message}>
        <Textarea
          id="message"
          name="message"
          rows={5}
          className={cn("min-h-28 resize-y bg-background px-3 py-2 shadow-xs", invalid(e.message))}
          placeholder={t.messagePlaceholder}
        />
      </Field>
      )}

      {show.receipt && (
      <label
        htmlFor="receipt"
        className="flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-xs transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
      >
        <input
          id="receipt"
          name="receipt"
          type="checkbox"
          value="yes"
          className="h-4 w-4 shrink-0 cursor-pointer rounded accent-primary"
        />
        <span>
          <span className="block text-sm font-medium text-foreground">{t.receipt}</span>
          <span className="block text-xs text-muted-foreground">{t.receiptNote}</span>
        </span>
      </label>
      )}

      {/* Honeypot */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && !Object.keys(e).length && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">{t.consent}</p>
        <button
          type="submit"
          disabled={pending}
          className={cn(buttonVariants(), "group h-11 shrink-0 gap-2 rounded-[var(--btn-radius,0.625rem)] px-6 shadow-xs hover:bg-primary/90 disabled:cursor-wait")}
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
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  /** Screen-reader text for the star shown on required fields. */
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
        <p className="mt-1.5 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
