"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authConfigured, endSession, passwordMatches, requireAdmin, startSession } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";
import { savePricing } from "@/lib/pricing";
import { parsePricing, type Pricing } from "@/lib/pricing-data";

/* ---------------- Login ---------------- */

export type LoginState = { error?: string };

const MAX_ATTEMPTS = 8;
const WINDOW_MINUTES = 15;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!authConfigured()) return { error: "The admin login isn't set up yet (ADMIN_PASSWORD and SESSION_SECRET)." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const password = String(formData.get("password") ?? "");

  // Throttle guessing: a handful of attempts per IP in a rolling window.
  const sql = hasDatabase() ? await db() : null;
  if (sql) {
    const [{ count }] = await sql`SELECT count(*)::int AS count FROM login_attempts
      WHERE ip = ${ip} AND at > now() - make_interval(mins => ${WINDOW_MINUTES})`;
    if (count >= MAX_ATTEMPTS) {
      return { error: `Too many attempts. Please wait ${WINDOW_MINUTES} minutes and try again.` };
    }
  }

  if (!passwordMatches(password)) {
    if (sql) await sql`INSERT INTO login_attempts (ip) VALUES (${ip})`;
    await new Promise((r) => setTimeout(r, 600));
    return { error: "That password isn't right." };
  }

  if (sql) await sql`DELETE FROM login_attempts WHERE ip = ${ip} OR at < now() - interval '1 day'`;
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* ---------------- Messages ---------------- */

export async function setMessageStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = formData.get("status") === "handled" ? "handled" : "new";
  if (!Number.isInteger(id)) return;
  const sql = await db();
  await sql`UPDATE messages SET status = ${status} WHERE id = ${id}`;
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  const sql = await db();
  await sql`DELETE FROM messages WHERE id = ${id}`;
  revalidatePath("/admin", "layout");
}

/* ---------------- Pricing ---------------- */

export type PricingState = { status: "idle" | "saved" | "error"; message?: string; pricing?: Pricing };

export async function updatePricing(prev: PricingState, formData: FormData): Promise<PricingState> {
  await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("pricing") ?? ""));
  } catch {
    return { status: "error", message: "The form data couldn't be read. Please reload and try again.", pricing: prev.pricing };
  }
  const pricing = parsePricing(raw);
  if (!pricing) {
    return {
      status: "error",
      message: "Each service needs an English and French name, and every duration (up to 600 min) needs a price up to $10,000.",
      pricing: prev.pricing,
    };
  }
  try {
    await savePricing(pricing);
  } catch (err) {
    console.error("[admin] save pricing failed:", err);
    return { status: "error", message: "Saving failed. Please try again in a moment.", pricing: prev.pricing };
  }
  // Re-render the public home pages (EN and FR) with the new prices.
  revalidatePath("/[locale]", "page");
  revalidatePath("/admin", "layout");
  return { status: "saved", pricing };
}
