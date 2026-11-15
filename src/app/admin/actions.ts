"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authConfigured, endSession, passwordMatches, requireAdmin, startSession } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";
import { getPricing, savePricing } from "@/lib/pricing";
import { formatPrice, parsePricing, type Pricing } from "@/lib/pricing-data";
import { parseAvailability, type Availability, type BookingStatus } from "@/lib/booking-data";
import { getAvailability, getBooking, saveAvailability } from "@/lib/bookings";
import { sendEmail, ownerEmail } from "@/lib/email";
import { fill, getDictionary } from "@/i18n";
import { localePath } from "@/i18n/config";
import { site } from "@/lib/site";
import { addDays, formatWhen, isDay, isTime, localDay, localTime, toMinutes, weekday, zonedToDate } from "@/lib/time";
import { parsePost } from "@/lib/post-data";
import { deletePost, savePost, slugTaken } from "@/lib/posts";
import type { Post } from "@/lib/blog";

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

/* ---------------- Edit a booking ---------------- */

export type EditBookingState = {
  status: "idle" | "error" | "warn";
  errors?: string[];
  /** Clashes or times outside opening hours; saving again with force=yes goes ahead. */
  warnings?: string[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function editBooking(_prev: EditBookingState, formData: FormData): Promise<EditBookingState> {
  await requireAdmin();
  const get = (k: string, max = 500) => String(formData.get(k) ?? "").trim().slice(0, max);
  const id = Number(formData.get("id"));
  const booking = Number.isInteger(id) ? await getBooking(id) : null;
  if (!booking || (booking.status !== "pending" && booking.status !== "confirmed")) {
    return { status: "error", errors: ["This booking can no longer be edited."] };
  }

  const date = get("date", 10);
  const time = get("time", 5);
  const minutes = Math.round(Number(formData.get("minutes")));
  const price = Math.round(Number(formData.get("price")) * 100) / 100;
  const serviceId = get("service", 40);
  const location = formData.get("location") === "home" ? "home" : "office";
  const address = get("address", 300);
  const name = get("name", 120);
  const phone = get("phone", 40);
  const email = get("email", 200);
  const notes = get("notes", 2000);

  const errors: string[] = [];
  if (!isDay(date) || !isTime(time)) errors.push("Choose a date and start time.");
  if (!(minutes >= 15 && minutes <= 600)) errors.push("The length must be between 15 and 600 minutes.");
  if (!(price >= 0 && price <= 10000)) errors.push("Enter a price between $0 and $10,000.");
  if (location === "home" && address.length < 6) errors.push("Enter the address for the home visit.");
  if (name.length < 2) errors.push("Enter the client's name.");
  if (phone.replace(/\D/g, "").length < 10) errors.push("Enter a valid phone number.");
  if (email && !EMAIL_RE.test(email)) errors.push("Enter a valid email address, or leave it empty.");
  if (errors.length) return { status: "error", errors };

  const start = zonedToDate(date, time);
  const end = new Date(start.getTime() + minutes * 60_000);
  const sql = await db();

  if (formData.get("force") !== "yes") {
    const warnings: string[] = [];
    const a = await getAvailability();
    const buffer = a.bufferMinutes * 60_000;
    const clashes = await sql`SELECT name, start_at, end_at FROM bookings
      WHERE id <> ${id} AND status IN ('pending', 'confirmed')
        AND start_at < ${new Date(end.getTime() + buffer).toISOString()}
        AND end_at > ${new Date(start.getTime() - buffer).toISOString()}
      ORDER BY start_at`;
    for (const c of clashes) {
      const s = new Date(c.start_at);
      const overlap = s < end && new Date(c.end_at) > start;
      warnings.push(
        `${overlap ? "Overlaps" : `Leaves less than ${a.bufferMinutes} min before or after`} ${c.name}'s appointment (${localTime(s)}–${localTime(new Date(c.end_at))}).`,
      );
    }
    const hours = a.week[weekday(date)];
    const endDay = localDay(end);
    if (!hours.open || a.closedDates.includes(date)) {
      warnings.push("That day is closed in your opening hours.");
    } else if (toMinutes(time) < toMinutes(hours.start) || endDay !== date || toMinutes(localTime(end)) > toMinutes(hours.end)) {
      warnings.push(`That time is outside your opening hours (${hours.start}–${hours.end}).`);
    }
    if (start.getTime() < Date.now()) warnings.push("That time is in the past.");
    if (warnings.length) return { status: "warn", warnings };
  }

  const pricing = await getPricing();
  const service = pricing.services.find((s) => s.id === serviceId);
  const serviceTitle = service?.title.en ?? booking.service_title;
  await sql`UPDATE bookings SET start_at = ${start.toISOString()}, end_at = ${end.toISOString()},
      service_id = ${service?.id ?? booking.service_id}, service_title = ${serviceTitle}, minutes = ${minutes}, price = ${price},
      location = ${location}, address = ${location === "home" ? address : null}, name = ${name}, phone = ${phone},
      email = ${email || null}, notes = ${notes || null}, wants_receipt = ${formData.get("receipt") === "yes"}
    WHERE id = ${id}`;

  if (email && formData.get("notify") === "yes") {
    const locale = booking.locale === "fr" ? "fr" : "en";
    const dict = getDictionary(locale);
    const t = dict.booking;
    const when = formatWhen(start, locale);
    await sendEmail({
      to: email,
      replyTo: ownerEmail(),
      subject: t.emails.updatedSubject,
      text: fill(t.emails.updated, {
        name: name.split(" ")[0],
        when: `${when.day}, ${when.time}`,
        service: `${service?.title[locale] ?? serviceTitle}, ${minutes} min (${formatPrice(price, locale)})`,
        where: location === "home" ? `${t.home}: ${address}` : `${t.office} (${dict.contact.office})`,
        phone: site.phone,
      }),
    });
  }

  revalidatePath("/admin", "layout");
  const monday = addDays(date, -((weekday(date) + 6) % 7));
  redirect(`/admin/bookings?week=${monday}&open=${id}#details`);
}

/* ---------------- Blog ---------------- */

function refreshBlog(slugs: string[]) {
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/blog", "page");
  for (const slug of slugs) {
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/fr/blog/${slug}`);
  }
  revalidatePath("/[locale]/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin", "layout");
}

export type PostState = { status: "idle" | "saved" | "error"; problems?: string[]; post?: Post };

export async function updatePost(prev: PostState, formData: FormData): Promise<PostState> {
  await requireAdmin();
  const previousSlug = String(formData.get("previousSlug") ?? "") || undefined;
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("post") ?? ""));
  } catch {
    return { status: "error", problems: ["The form couldn't be read. Please reload and try again."], post: prev.post };
  }
  const result = parsePost(raw);
  if ("problems" in result) return { status: "error", problems: result.problems, post: prev.post };
  const post = result.post;

  if (post.slug !== previousSlug && (await slugTaken(post.slug))) {
    return { status: "error", problems: ["Another article already uses this web address."], post: prev.post };
  }
  try {
    await savePost(post, previousSlug);
  } catch (err) {
    console.error("[admin] save post failed:", err);
    return { status: "error", problems: ["Saving failed. Please try again in a moment."], post: prev.post };
  }
  refreshBlog([post.slug, ...(previousSlug && previousSlug !== post.slug ? [previousSlug] : [])]);
  // A new article (or a renamed one) moves to its own address in the editor.
  if (post.slug !== previousSlug) redirect(`/admin/blog/${post.slug}?saved=1`);
  return { status: "saved", post };
}

export async function removePost(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await deletePost(slug);
  refreshBlog([slug]);
  redirect("/admin/blog");
}
