import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { readSetting, writeSetting } from "./settings";

/**
 * Single-owner admin login. The first password comes from the ADMIN_PASSWORD environment variable;
 * once Ziad changes it in Admin → Settings, a scrypt hash in the settings table takes over.
 * Sessions are HMAC-signed cookies keyed by SESSION_SECRET and carry a version number:
 * bumping it (password change, "sign out everywhere") ends every other session.
 * To reset a forgotten password, delete the 'admin_auth' settings row: ADMIN_PASSWORD works again.
 */
export const SESSION_COOKIE = "hz_admin";
const SESSION_DAYS = 14;
const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

type AuthRecord = { hash?: string; salt?: string; v: number; changedAt?: string };

export function authConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

const authRecord = cache(async () => readSetting<AuthRecord>("admin_auth"));

function sign(payload: string) {
  return createHmac("sha256", process.env.SESSION_SECRET!).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function passwordMatches(input: string) {
  const record = await authRecord();
  if (record?.hash && record.salt) {
    const hash = await scryptAsync(input, Buffer.from(record.salt, "base64url"), 32);
    return timingSafeEqual(hash, Buffer.from(record.hash, "base64url"));
  }
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(input, expected!);
}

/** When the password was last changed from the admin (null = still the original one). */
export async function passwordChangedAt() {
  return (await authRecord())?.changedAt ?? null;
}

async function bumpVersion(changes: Partial<AuthRecord>) {
  const record = await authRecord();
  const next: AuthRecord = { ...record, ...changes, v: (record?.v ?? 0) + 1 };
  await writeSetting("admin_auth", next);
  return next.v;
}

/** Saves a new password, signs out every other device and keeps this one signed in. */
export async function changePassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 32);
  const v = await bumpVersion({ hash: hash.toString("base64url"), salt: salt.toString("base64url"), changedAt: new Date().toISOString() });
  await startSession(v);
}

/** Ends the session on every other phone or computer; this one stays signed in. */
export async function signOutEverywhere() {
  await startSession(await bumpVersion({}));
}

export async function startSession(version?: number) {
  const v = version ?? (await authRecord())?.v ?? 0;
  const exp = Date.now() + SESSION_DAYS * 864e5;
  const payload = Buffer.from(JSON.stringify({ exp, v })).toString("base64url");
  (await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // Whole site, so editing on the website itself (Admin → Edit on the website) is recognised.
    path: "/",
    expires: new Date(exp),
  });
}

export async function endSession() {
  const jar = await cookies();
  // Sessions from before the whole-site cookie were scoped to /admin.
  jar.delete({ name: SESSION_COOKIE, path: "/admin" });
  jar.delete({ name: SESSION_COOKIE, path: "/" });
}

export async function isAdmin() {
  if (!authConfigured()) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac || !safeEqual(mac, sign(payload))) return false;
  try {
    const { exp, v = 0 } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof exp !== "number" || exp <= Date.now()) return false;
    return v === ((await authRecord())?.v ?? 0);
  } catch {
    return false;
  }
}

/** Call at the top of every admin page and admin Server Action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
