"use client";

import { useActionState, useState, useTransition } from "react";
import { signOutOtherDevices, updateBusiness, updatePassword, type SettingsState } from "@/app/admin/actions";
import { socialFields, type Business } from "@/lib/business-data";
import { Field, Section, input } from "./fields";

function Status({ state }: { state: SettingsState }) {
  if (state.status === "idle") return null;
  return (
    <p role="status" className={`text-sm ${state.status === "error" ? "text-danger" : "font-medium text-[#007a43]"}`}>
      {state.message}
    </p>
  );
}

const button =
  "rounded-full bg-blue-dark px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 transition hover:bg-[#00649f] disabled:opacity-50";

export function BusinessForm({ initial, fallbackNotify }: { initial: Business; fallbackNotify: string }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateBusiness, { status: "idle" });
  return (
    <form action={action}>
      <Section id="contact" title="Contact details" text="Shown in the header, contact section, footer, booking page and the emails clients receive.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input name="phone" type="tel" required defaultValue={initial.phone} className={input} />
          </Field>
          <Field label="Public email">
            <input name="email" type="email" required defaultValue={initial.email} className={input} />
          </Field>
          <Field
            label="Send booking requests and messages to"
            hint={`Leave empty to use ${fallbackNotify}.`}
            className="sm:col-span-2"
          >
            <input name="notifyEmail" type="email" defaultValue={initial.notifyEmail} placeholder={fallbackNotify} className={input} />
          </Field>
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-navy">Social profiles</p>
          <p className="mb-3 text-sm text-muted">Each link you fill in shows as an icon in the footer and helps Google connect your profiles. Leave empty to hide.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {socialFields.map((f) => (
              <Field key={f.key} label={f.label}>
                <input name={f.key} type="url" defaultValue={initial[f.key]} placeholder="https://…" className={input} />
              </Field>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-3 rounded-xl bg-surface px-4 py-3 ring-1 ring-mist/60">
          <input type="checkbox" name="reminders" value="yes" defaultChecked={initial.reminders} className="mt-1 h-4 w-4 accent-navy" />
          <span>
            <span className="block text-sm font-semibold text-navy">Send appointment reminders</span>
            <span className="block text-sm text-muted">
              Each morning, clients with a confirmed appointment the next day get a reminder email (in their language). The wording is under Text &amp; photos → All other text → Booking page and client emails.
            </span>
          </span>
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Status state={state} />
          <button disabled={pending} className={`${button} ml-auto`}>
            {pending ? "Saving…" : "Save contact details"}
          </button>
        </div>
      </Section>
    </form>
  );
}

export function PasswordForm({ changedAt }: { changedAt: string | null }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updatePassword, { status: "idle" });
  const [show, setShow] = useState(false);
  const [devices, setDevices] = useState<SettingsState>({ status: "idle" });
  const [signingOut, startSignOut] = useTransition();
  const type = show ? "text" : "password";

  return (
    <Section
      id="password"
      title="Password"
      text={
        changedAt
          ? `Last changed ${new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "America/Montreal" }).format(new Date(changedAt))}.`
          : "You're using the password you were given. You can choose your own here."
      }
    >
      <form
        action={action}
        key={state.status === "saved" ? state.message : "form"}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Current password">
            <input name="current" type={type} autoComplete="current-password" required className={input} />
          </Field>
          <Field label="New password" hint="At least 10 characters.">
            <input name="password" type={type} autoComplete="new-password" minLength={10} required className={input} />
          </Field>
          <Field label="New password again">
            <input name="confirm" type={type} autoComplete="new-password" minLength={10} required className={input} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="h-4 w-4 accent-navy" />
          Show passwords
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Status state={state} />
          <button disabled={pending} className={`${button} ml-auto`}>
            {pending ? "Saving…" : "Change password"}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mist/60 pt-5">
        <div>
          <p className="font-medium text-ink">Signed in on a phone or computer you no longer use?</p>
          <p className="text-sm text-muted">This signs out everywhere except here.</p>
          <div className="mt-1">
            <Status state={devices} />
          </div>
        </div>
        <button
          type="button"
          disabled={signingOut}
          onClick={() => startSignOut(async () => setDevices(await signOutOtherDevices()))}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy ring-1 ring-mist hover:ring-blue disabled:opacity-50"
        >
          {signingOut ? "Signing out…" : "Sign out other devices"}
        </button>
      </div>
      <p className="text-xs text-muted">Forgot your password? Ask your web developer to reset it.</p>
    </Section>
  );
}
