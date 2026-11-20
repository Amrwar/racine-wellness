"use client";

import { useActionState, useState } from "react";
import { removeGoogle, updateGoogle, type GoogleState } from "@/app/admin/actions";
import { googleColors, type CalendarMode, type GoogleSettings } from "@/lib/google-data";

const flashes: Record<string, { tone: "ok" | "bad"; text: string }> = {
  connected: { tone: "ok", text: "Google Calendar is connected. Choose below which events block bookings." },
  cancelled: { tone: "bad", text: "Google sign-in was cancelled." },
  expired: { tone: "bad", text: "The sign-in took too long. Please try again." },
  failed: { tone: "bad", text: "Connecting to Google didn't work. Please try again." },
  "not-configured": { tone: "bad", text: "Google sign-in isn't set up on the server yet." },
};

const modeLabels: Record<CalendarMode, string> = {
  colors: "Only events in the chosen colours",
  all: "All events",
  off: "Ignore this calendar",
};

export function GoogleCalendarSettings({
  settings,
  configured,
  flash,
}: {
  settings: GoogleSettings;
  configured: boolean;
  flash?: string;
}) {
  const [colors, setColors] = useState(settings.colors);
  const [calendars, setCalendars] = useState(settings.calendars);
  const [state, action, pending] = useActionState<GoogleState, FormData>(updateGoogle, { status: "idle" });
  const dirty =
    JSON.stringify(colors) !== JSON.stringify(settings.colors) || JSON.stringify(calendars) !== JSON.stringify(settings.calendars);
  const f = flash ? flashes[flash] : undefined;

  return (
    <section id="google" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-card ring-1 ring-mist/60 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" />
              <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
              <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9L6.4 14Z" />
              <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.7 9.4 6 12 6Z" />
            </svg>
            Google Calendar
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Times you mark in Google Calendar are taken out of online booking, so clients can&apos;t book over them.
            HealthyZone only reads your calendar; it never changes it.
          </p>
        </div>
        {settings.connected && (
          <form action={removeGoogle}>
            <button className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-danger/8 hover:text-danger">Disconnect</button>
          </form>
        )}
      </div>

      {f && (
        <p className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${f.tone === "ok" ? "bg-green/12 text-[#00663a]" : "bg-danger/8 text-danger"}`}>{f.text}</p>
      )}

      {!configured ? (
        <p className="mt-5 rounded-xl bg-surface px-4 py-3 text-sm text-muted-foreground">
          Waiting for the Google sign-in keys (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) to be added on the server.
        </p>
      ) : !settings.connected ? (
        // A plain form GET: the sign-in goes through a server redirect to Google, so it needs a full page load.
        <form action="/admin/google/connect" method="get" className="mt-5">
          <button className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep">
            Connect Google Calendar
          </button>
        </form>
      ) : (
        <form
          className="mt-5 space-y-6"
          action={action}
        >
          <input type="hidden" name="google" value={JSON.stringify({ colors, calendars })} />
          <p className="text-sm text-ink">
            Connected as <span className="font-semibold">{settings.account || "your Google account"}</span>
          </p>
          {settings.lastError && (
            <p className="rounded-xl bg-danger/8 px-4 py-2.5 text-sm text-danger">
              Google Calendar couldn&apos;t be read on the last try, so it isn&apos;t blocking times right now. Try disconnecting and connecting
              again. ({settings.lastError})
            </p>
          )}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Event colours that block bookings</p>
            <div className="flex flex-wrap gap-2">
              {googleColors.map((c) => {
                const on = colors.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setColors((x) => (on ? x.filter((y) => y !== c.id) : [...x, c.id]))}
                    className={`flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5 text-sm font-medium transition ${
                      on ? "bg-navy text-white" : "bg-surface text-muted-foreground ring-1 ring-mist hover:text-navy"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full ring-2 ring-white/70" style={{ background: c.hex }} />
                    {c.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              In Google Calendar, open an event and pick its colour. Tomato is Google&apos;s red. Events that use the calendar&apos;s default
              colour don&apos;t count; set that calendar to &quot;All events&quot; instead.
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Your calendars</p>
            <ul className="divide-y divide-mist/60 rounded-xl ring-1 ring-mist/70">
              {calendars.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: c.color }} />
                    <span className="truncate text-sm font-medium text-ink">{c.name}</span>
                  </span>
                  <select
                    value={c.mode}
                    aria-label={`What ${c.name} blocks`}
                    onChange={(e) => setCalendars((x) => x.map((y) => (y.id === c.id ? { ...y, mode: e.target.value as CalendarMode } : y)))}
                    className="rounded-lg border border-mist bg-white px-2.5 py-1.5 text-sm text-ink"
                  >
                    {(Object.keys(modeLabels) as CalendarMode[]).map((m) => (
                      <option key={m} value={m}>
                        {modeLabels[m]}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mist/60 pt-4">
            <p className="text-sm" role="status">
              {state.status === "error" ? (
                <span className="text-danger">{state.message}</span>
              ) : dirty ? (
                <span className="text-muted-foreground">You have unsaved changes.</span>
              ) : state.status === "saved" ? (
                <span className="font-medium text-[#007a43]">Saved. Online booking now follows these settings.</span>
              ) : null}
            </p>
            <button
              disabled={!dirty || pending}
              className="rounded-full bg-blue-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00649f] disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save Google settings"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
