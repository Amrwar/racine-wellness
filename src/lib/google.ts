import { db, hasDatabase } from "./db";
import { decrypt, encrypt } from "./crypto";
import { defaultColors, type CalendarMode, type GoogleCalendarChoice, type GoogleSettings } from "./google-data";
import { addDays, zonedToDate } from "./time";

/**
 * Read-only Google Calendar connection. Ziad signs in once from the admin; the refresh token is
 * stored encrypted. Events in his chosen calendars (red ones, or all) block online booking.
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (a Google Cloud "Web application" OAuth client).
 */

const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const API = "https://www.googleapis.com/calendar/v3";

type Stored = Omit<GoogleSettings, "connected"> & { refreshToken?: string };

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

async function readStored(): Promise<Stored | null> {
  if (!hasDatabase()) return null;
  const sql = await db();
  const [row] = await sql`SELECT value FROM settings WHERE key = 'google'`;
  return (row?.value as Stored) ?? null;
}

async function writeStored(value: Stored) {
  const sql = await db();
  await sql`INSERT INTO settings (key, value, updated_at) VALUES ('google', ${JSON.stringify(value)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
  cache.clear();
}

export async function getGoogleSettings(): Promise<GoogleSettings> {
  const s = await readStored();
  return {
    connected: Boolean(s?.refreshToken),
    account: s?.account ?? "",
    calendars: s?.calendars ?? [],
    colors: s?.colors ?? defaultColors,
    lastError: s?.lastError,
  };
}

export async function saveGoogleChoices(calendars: { id: string; mode: CalendarMode }[], colors: string[]) {
  const s = await readStored();
  if (!s) return;
  const modes = new Map(calendars.map((c) => [c.id, c.mode]));
  await writeStored({
    ...s,
    calendars: s.calendars.map((c) => ({ ...c, mode: modes.get(c.id) ?? c.mode })),
    colors,
  });
}

export async function disconnectGoogle() {
  const s = await readStored();
  if (s?.refreshToken) {
    // Revoke at Google too, so the access really ends.
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(decrypt(s.refreshToken))}`, { method: "POST" }).catch(() => {});
  }
  const sql = await db();
  await sql`DELETE FROM settings WHERE key = 'google'`;
  cache.clear();
}

/* ---------------- OAuth ---------------- */

export function authUrl(redirectUri: string, state: string) {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      ...params,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Google token error: ${json.error_description ?? json.error ?? res.status}`);
  return json as { access_token: string; refresh_token?: string; expires_in: number };
}

let accessToken: { token: string; expires: number } | null = null;

async function getAccessToken(refreshToken: string) {
  if (accessToken && accessToken.expires > Date.now() + 60_000) return accessToken.token;
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
  accessToken = { token: t.access_token, expires: Date.now() + t.expires_in * 1000 };
  return t.access_token;
}

async function api<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`Google Calendar error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<T>;
}

type CalendarListItem = { id: string; summary: string; summaryOverride?: string; backgroundColor?: string; primary?: boolean; accessRole: string };

/** Finishes sign-in: stores the refresh token and the account's calendars (keeping earlier choices). */
export async function completeConnection(code: string, redirectUri: string) {
  const t = await tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
  if (!t.refresh_token) throw new Error("Google did not return a refresh token. Please try connecting again.");
  accessToken = { token: t.access_token, expires: Date.now() + t.expires_in * 1000 };
  const list = await api<{ items: CalendarListItem[] }>(t.access_token, "/users/me/calendarList?maxResults=250");
  const previous = await readStored();
  const prevModes = new Map((previous?.calendars ?? []).map((c) => [c.id, c.mode]));
  const primary = list.items.find((c) => c.primary);
  const calendars: GoogleCalendarChoice[] = list.items
    // Skip the HealthyZone bookings feed if it was subscribed in Google: those times are already known.
    .filter((c) => !/healthyzone/i.test(c.summary ?? ""))
    .map((c) => ({
      id: c.id,
      name: c.summaryOverride || c.summary || c.id,
      color: c.backgroundColor ?? "#9e9e9e",
      // His own calendars check red events by default; calendars shared with him are ignored until chosen.
      mode: prevModes.get(c.id) ?? (c.accessRole === "owner" ? "colors" : "off"),
    }));
  await writeStored({
    refreshToken: encrypt(t.refresh_token),
    account: primary?.id ?? "",
    calendars,
    colors: previous?.colors ?? defaultColors,
  });
}

/* ---------------- Busy times ---------------- */

export type GoogleBusy = { start: number; end: number; label: string };

type GEvent = {
  status?: string;
  colorId?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

const cache = new Map<string, { at: number; data: GoogleBusy[] }>();
const CACHE_MS = 60_000;

/**
 * Times blocked by Google Calendar between two instants. Cached for a minute per window.
 * If Google can't be reached the error is recorded for the admin and nothing is blocked,
 * so online booking keeps working; bookings still need Ziad's confirmation.
 */
export async function googleBusy(from: Date, to: Date): Promise<GoogleBusy[]> {
  if (!googleConfigured()) return [];
  const key = `${from.toISOString()}|${to.toISOString()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;

  const s = await readStored().catch(() => null);
  if (!s?.refreshToken) return [];
  const active = s.calendars.filter((c) => c.mode !== "off");
  if (!active.length) return [];
  const colors = new Set(s.colors ?? defaultColors);

  try {
    const token = await getAccessToken(decrypt(s.refreshToken));
    const busy: GoogleBusy[] = [];
    for (const cal of active) {
      let pageToken = "";
      do {
        const q = new URLSearchParams({
          timeMin: from.toISOString(),
          timeMax: to.toISOString(),
          singleEvents: "true",
          maxResults: "2500",
          fields: "items(status,colorId,summary,start,end),nextPageToken",
          ...(pageToken && { pageToken }),
        });
        const page = await api<{ items?: GEvent[]; nextPageToken?: string }>(token, `/calendars/${encodeURIComponent(cal.id)}/events?${q}`);
        for (const e of page.items ?? []) {
          if (e.status === "cancelled") continue;
          if (cal.mode === "colors" && !(e.colorId && colors.has(e.colorId))) continue;
          const start = e.start?.dateTime ? new Date(e.start.dateTime) : e.start?.date ? zonedToDate(e.start.date, "00:00") : null;
          const end = e.end?.dateTime ? new Date(e.end.dateTime) : e.end?.date ? zonedToDate(e.end.date, "00:00") : start && e.start?.date ? zonedToDate(addDays(e.start.date, 1), "00:00") : null;
          if (start && end && end > start) busy.push({ start: start.getTime(), end: end.getTime(), label: e.summary?.trim() || "Busy" });
        }
        pageToken = page.nextPageToken ?? "";
      } while (pageToken);
    }
    cache.set(key, { at: Date.now(), data: busy });
    if (s.lastError) await writeStored({ ...s, lastError: undefined });
    return busy;
  } catch (err) {
    const message = (err as Error).message;
    console.error("[google] busy lookup failed:", message);
    if (s.lastError !== message) await writeStored({ ...s, lastError: message }).catch(() => {});
    return [];
  }
}
