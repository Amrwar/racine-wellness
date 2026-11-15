"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authConfigured, endSession, passwordMatches, requireAdmin, startSession } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";
import { getPricing, savePricing } from "@/lib/pricing";
import { formatPrice, parsePricing, type Pricing } from "@/lib/pricing-data";
import { parseAvailability, type Availability, type BookingStatus } from "@/lib/booking-data";
import { getBooking, saveAvailability } from "@/lib/bookings";
import { sendEmail, ownerEmail } from "@/lib/email";
import { fill, getDictionary } from "@/i18n";
import { localePath } from "@/i18n/config";
import { site } from "@/lib/site";
import { formatWhen } from "@/lib/time";

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
  revalidatePath("/[locale]/book", "page");
  revalidatePath("/admin", "layout");
  return { status: "saved", pricing };
}

/* ---------------- Bookings ---------------- */

const transitions: Record<string, { from: BookingStatus[]; to: BookingStatus; email: "confirmed" | "declined" | "cancelled" }> = {
  confirm: { from: ["pending"], to: "confirmed", email: "confirmed" },
  decline: { from: ["pending"], to: "declined", email: "declined" },
  cancel: { from: ["confirmed", "pending"], to: "cancelled", email: "cancelled" },
};

/** Confirm, decline or cancel a booking, then email the client. */
export async function updateBooking(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const move = transitions[String(formData.get("action"))];
  if (!Number.isInteger(id) || !move) return;
  const booking = await getBooking(id);
  if (!booking || !move.from.includes(booking.status)) return;

  const sql = await db();
  await sql`UPDATE bookings SET status = ${move.to} WHERE id = ${id}`;

  if (booking.email && formData.get("notify") !== "no") {
    const locale = booking.locale === "fr" ? "fr" : "en";
    const dict = getDictionary(locale);
    const t = dict.booking;
    const when = formatWhen(new Date(booking.start_at), locale);
    const pricing = await getPricing();
    const title = pricing.services.find((s) => s.id === booking.service_id)?.title[locale] ?? booking.service_title;
    await sendEmail({
      to: booking.email,
      replyTo: ownerEmail(),
      subject: t.emails[`${move.email}Subject`],
      text: fill(t.emails[move.email], {
        name: booking.name.split(" ")[0],
        when: `${when.day}, ${when.time}`,
        service: `${title}, ${booking.minutes} min (${formatPrice(Number(booking.price), locale)})`,
        where: booking.location === "home" ? `${t.home}: ${booking.address ?? ""}` : `${t.office} (${dict.contact.office})`,
        phone: site.phone,
        link: `${site.url}${localePath(locale, "/book")}`,
      }),
    });
  }
  revalidatePath("/admin", "layout");
}

export type AvailabilityState = { status: "idle" | "saved" | "error"; message?: string; availability?: Availability };

export async function updateAvailability(prev: AvailabilityState, formData: FormData): Promise<AvailabilityState> {
  await requireAdmin();
  let parsed: Availability | null = null;
  try {
    parsed = parseAvailability(JSON.parse(String(formData.get("availability") ?? "")));
  } catch {}
  if (!parsed) {
    return {
      status: "error",
      message: "Check the opening hours: each open day needs a start time before its end time.",
      availability: prev.availability,
    };
  }
  try {
    await saveAvailability(parsed);
  } catch (err) {
    console.error("[admin] save availability failed:", err);
    return { status: "error", message: "Saving failed. Please try again in a moment.", availability: prev.availability };
  }
  revalidatePath("/admin", "layout");
  return { status: "saved", availability: parsed };
}
