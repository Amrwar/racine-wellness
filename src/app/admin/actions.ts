"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { authConfigured, changePassword, endSession, passwordMatches, requireAdmin, signOutEverywhere, startSession } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";
import { getPricing, savePricing } from "@/lib/pricing";
import { serviceLine, parsePricing, type Pricing } from "@/lib/pricing-data";
import { hoursOn, parseAvailability, type Availability, type BookingStatus } from "@/lib/booking-data";
import { getAvailability, getBooking, saveAvailability } from "@/lib/bookings";
import { sendEmail, ownerEmail } from "@/lib/email";
import { fill } from "@/i18n";
import { localePath } from "@/i18n/config";
import { site } from "@/lib/site";
import { getBusiness, saveBusiness } from "@/lib/business";
import { parseBusiness } from "@/lib/business-data";
import { getContent, getText, saveContent, saveTextOverrides } from "@/lib/content";
import { cleanOverrides, type TextOverrides } from "@/lib/text-data";
import { getDesign, saveDesign } from "@/lib/design";
import { saveClientNotes } from "@/lib/clients";
import { deleteUnused } from "@/lib/photos";
import { historyKeys, writeDraft, writeSetting, type PreviewableKey } from "@/lib/settings";
import { designSectionNames, normalizeSections, parseDesign, type Design } from "@/lib/design-data";
import { contentProblems, parseContent, type SiteContent } from "@/lib/content-data";
import { addDays, formatWhen, isDay, isTime, localDay, localTime, toMinutes, weekday, zonedToDate } from "@/lib/time";
import { parsePost } from "@/lib/post-data";
import { deletePost, savePost, slugTaken } from "@/lib/posts";
import type { Post } from "@/lib/blog";
import { disconnectGoogle, googleBusy, saveGoogleChoices } from "@/lib/google";
import { googleColors, type CalendarMode } from "@/lib/google-data";

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

  if (!(await passwordMatches(password))) {
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
  // Re-render the public pages (EN and FR) that show prices.
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/book", "page");
  revalidatePath("/[locale]/pricing", "page");
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
    const dict = await getText(locale);
    const t = dict.booking;
    const when = formatWhen(new Date(booking.start_at), locale);
    const pricing = await getPricing();
    const priced = pricing.services.find((s) => s.id === booking.service_id);
    const title = priced?.title[locale] ?? booking.service_title;
    await sendEmail({
      to: booking.email,
      replyTo: await ownerEmail(),
      subject: t.emails[`${move.email}Subject`],
      text: fill(t.emails[move.email], {
        name: booking.name.split(" ")[0],
        when: `${when.day}, ${when.time}`,
        service: serviceLine(priced, title, booking.minutes, Number(booking.price), locale, dict.pricing.perSession),
        where: booking.location === "home" ? `${t.home}: ${booking.address ?? ""}` : `${t.office} (${dict.contact.office})`,
        phone: (await getBusiness()).phone,
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
  // "new" adds an appointment Ziad took by phone or in person; it is confirmed straight away.
  const isNew = formData.get("id") === "new";
  const id = isNew ? -1 : Number(formData.get("id"));
  const booking = !isNew && Number.isInteger(id) ? await getBooking(id) : null;
  if (!isNew && (!booking || (booking.status !== "pending" && booking.status !== "confirmed"))) {
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
  if (isNew && !serviceId) errors.push("Choose a treatment.");
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
    for (const g of await googleBusy(new Date(start.getTime() - buffer), new Date(end.getTime() + buffer))) {
      const overlap = g.start < end.getTime() && g.end > start.getTime();
      warnings.push(
        `${overlap ? "Overlaps" : `Leaves less than ${a.bufferMinutes} min before or after`} "${g.label}" in your Google Calendar (${localTime(new Date(g.start))}–${localTime(new Date(g.end))}).`,
      );
    }
    for (const c of clashes) {
      const s = new Date(c.start_at);
      const overlap = s < end && new Date(c.end_at) > start;
      warnings.push(
        `${overlap ? "Overlaps" : `Leaves less than ${a.bufferMinutes} min before or after`} ${c.name}'s appointment (${localTime(s)}–${localTime(new Date(c.end_at))}).`,
      );
    }
    const hours = hoursOn(a, date);
    const endDay = localDay(end);
    if (!hours.open) {
      warnings.push("That day is closed in your opening hours.");
    } else if (toMinutes(time) < toMinutes(hours.start) || endDay !== date || toMinutes(localTime(end)) > toMinutes(hours.end)) {
      warnings.push(`That time is outside your opening hours (${hours.start}–${hours.end}).`);
    }
    if (start.getTime() < Date.now()) warnings.push("That time is in the past.");
    if (warnings.length) return { status: "warn", warnings };
  }

  const pricing = await getPricing();
  const service = pricing.services.find((s) => s.id === serviceId);
  const serviceTitle = service?.title.en ?? booking?.service_title ?? serviceId;
  const locale = (isNew ? formData.get("locale") : booking?.locale) === "fr" ? "fr" : "en";
  const receipt = formData.get("receipt") === "yes";
  let bookingId = id;
  if (isNew) {
    if (!service) return { status: "error", errors: ["Choose a treatment."] };
    const [row] = await sql`INSERT INTO bookings
        (start_at, end_at, service_id, service_title, minutes, price, location, address, name, phone, email, notes, wants_receipt, locale, status)
      VALUES (${start.toISOString()}, ${end.toISOString()}, ${service.id}, ${serviceTitle}, ${minutes}, ${price}, ${location},
        ${location === "home" ? address : null}, ${name}, ${phone}, ${email || null}, ${notes || null}, ${receipt}, ${locale}, 'confirmed')
      RETURNING id`;
    bookingId = row.id;
  } else await sql`UPDATE bookings SET start_at = ${start.toISOString()}, end_at = ${end.toISOString()},
      service_id = ${service?.id ?? booking!.service_id}, service_title = ${serviceTitle}, minutes = ${minutes}, price = ${price},
      location = ${location}, address = ${location === "home" ? address : null}, name = ${name}, phone = ${phone},
      email = ${email || null}, notes = ${notes || null}, wants_receipt = ${receipt}
    WHERE id = ${id}`;

  if (email && formData.get("notify") === "yes") {
    const dict = await getText(locale);
    const t = dict.booking;
    const when = formatWhen(start, locale);
    await sendEmail({
      to: email,
      replyTo: await ownerEmail(),
      subject: isNew ? t.emails.confirmedSubject : t.emails.updatedSubject,
      text: fill(isNew ? t.emails.confirmed : t.emails.updated, {
        name: name.split(" ")[0],
        when: `${when.day}, ${when.time}`,
        service: serviceLine(service, service?.title[locale] ?? serviceTitle, minutes, price, locale, dict.pricing.perSession),
        where: location === "home" ? `${t.home}: ${address}` : `${t.office} (${dict.contact.office})`,
        phone: (await getBusiness()).phone,
      }),
    });
  }

  revalidatePath("/admin", "layout");
  const monday = addDays(date, -((weekday(date) + 6) % 7));
  redirect(`/admin/bookings?week=${monday}&open=${bookingId}#details`);
}

/* ---------------- Google Calendar ---------------- */

export type GoogleState = { status: "idle" | "saved" | "error"; message?: string };

export async function updateGoogle(_prev: GoogleState, formData: FormData): Promise<GoogleState> {
  await requireAdmin();
  try {
    const raw = JSON.parse(String(formData.get("google") ?? "{}"));
    const modes: CalendarMode[] = ["colors", "all", "off"];
    const calendars = (Array.isArray(raw.calendars) ? raw.calendars : [])
      .filter((c: { id?: unknown; mode?: unknown }) => typeof c?.id === "string" && modes.includes(c.mode as CalendarMode))
      .map((c: { id: string; mode: CalendarMode }) => ({ id: c.id, mode: c.mode }));
    const valid = new Set<string>(googleColors.map((c) => c.id));
    const colors = (Array.isArray(raw.colors) ? raw.colors : []).map(String).filter((c: string) => valid.has(c));
    await saveGoogleChoices(calendars, colors);
  } catch (err) {
    console.error("[admin] save google failed:", err);
    return { status: "error", message: "Saving failed. Please try again." };
  }
  revalidatePath("/admin", "layout");
  return { status: "saved" };
}

export async function removeGoogle() {
  await requireAdmin();
  await disconnectGoogle();
  revalidatePath("/admin", "layout");
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

/* ---------------- Website text and photos ---------------- */

export type ContentState = { status: "idle" | "saved" | "error"; message?: string; content?: SiteContent };

export async function updateContent(prev: ContentState, formData: FormData): Promise<ContentState> {
  await requireAdmin();
  let content: SiteContent;
  try {
    content = parseContent(JSON.parse(String(formData.get("content") ?? "")));
  } catch {
    return { status: "error", message: "The form data couldn't be read. Please reload and try again.", content: prev.content };
  }
  const problems = contentProblems(content);
  if (problems.length) return { status: "error", message: problems.join(" "), content: prev.content };
  try {
    await saveContent(content);
  } catch (err) {
    console.error("[admin] save content failed:", err);
    return { status: "error", message: "Saving failed. Please try again in a moment.", content: prev.content };
  }
  revalidatePath("/", "layout");
  return { status: "saved", content };
}

/* ---------------- Automatic French translation ---------------- */

export type TranslateResult = { text?: string; error?: string };

/**
 * Tried in order. Claude needs paid AI Gateway credits; until the team has them, the gateway
 * refuses it and the free-tier models answer instead.
 */
const TRANSLATION_MODELS = ["anthropic/claude-sonnet-5.5", "google/gemini-2.5-flash", "openai/gpt-5-mini"];
const TRANSLATION_INSTRUCTIONS =
  "You translate website text for HealthyZone, a registered massage therapy and personal training practice in Montréal's West Island, " +
  "from English into natural Québec French. Keep a professional, clinical and warm tone and use the formal \"vous\" unless the English speaks as Ziad in the first person. " +
  "Use standard Québec terms (massothérapeute agréé, massothérapie, reçus d'assurance, entraîneur personnel, Ouest-de-l'Île). " +
  "Keep line breaks, numbers, prices, names and anything in {curly braces} exactly as they are. Reply with the French text only, with no quotes or notes.";

/** Drafts the French version of a piece of website text. Ziad reviews it before saving. */
export async function translateToFrench(english: string): Promise<TranslateResult> {
  await requireAdmin();
  const source = english.trim().slice(0, 4000);
  if (!source) return { error: "Write the English text first." };
  for (const model of TRANSLATION_MODELS) {
    try {
      const { text } = await generateText({ model, instructions: TRANSLATION_INSTRUCTIONS, prompt: source });
      const french = text.trim();
      if (french) return { text: french };
    } catch (err) {
      console.error(`[admin] translation with ${model} failed:`, (err as Error).message);
    }
  }
  return { error: "The translation service isn't available right now. Please try again, or write the French yourself." };
}

/* ---------------- Settings: contact details and password ---------------- */

export type SettingsState = { status: "idle" | "saved" | "error"; message?: string };

export async function updateBusiness(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const { value, errors } = parseBusiness(Object.fromEntries(formData));
  if (!value) return { status: "error", message: errors.join(" ") };
  try {
    await saveBusiness(value);
  } catch (err) {
    console.error("[admin] save business failed:", err);
    return { status: "error", message: "Saving failed. Please try again in a moment." };
  }
  revalidatePath("/", "layout");
  return { status: "saved", message: "Saved. The website now shows these details." };
}

export async function updatePassword(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  if (!(await passwordMatches(current))) return { status: "error", message: "Your current password isn't right." };
  if (next.length < 10) return { status: "error", message: "Choose a new password of at least 10 characters." };
  if (next.length > 200) return { status: "error", message: "That password is too long." };
  if (next !== String(formData.get("confirm") ?? "")) return { status: "error", message: "The two new passwords don't match." };
  if (next === current) return { status: "error", message: "The new password is the same as the current one." };
  await changePassword(next);
  revalidatePath("/admin", "layout");
  return { status: "saved", message: "Password changed. Other phones and computers have been signed out." };
}

export async function signOutOtherDevices(): Promise<SettingsState> {
  await requireAdmin();
  await signOutEverywhere();
  return { status: "saved", message: "Done. Every other phone and computer has been signed out." };
}

/* ---------------- All other text ---------------- */

export type TextState = { status: "idle" | "saved" | "error"; message?: string; overrides?: TextOverrides };

export async function updateText(prev: TextState, formData: FormData): Promise<TextState> {
  await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("text") ?? ""));
  } catch {
    return { status: "error", message: "The form data couldn't be read. Please reload and try again.", overrides: prev.overrides };
  }
  const { value, problems } = cleanOverrides(raw);
  if (problems.length) return { status: "error", message: problems.slice(0, 3).join(" "), overrides: prev.overrides };
  try {
    await saveTextOverrides(value);
  } catch (err) {
    console.error("[admin] save text failed:", err);
    return { status: "error", message: "Saving failed. Please try again in a moment.", overrides: prev.overrides };
  }
  revalidatePath("/", "layout");
  return { status: "saved", overrides: value };
}

/* ---------------- Design ---------------- */

export type DesignState = { status: "idle" | "saved" | "error"; message?: string; design?: Design };

export async function updateDesign(prev: DesignState, formData: FormData): Promise<DesignState> {
  await requireAdmin();
  let design: Design;
  try {
    design = parseDesign(JSON.parse(String(formData.get("design") ?? "")));
  } catch {
    return { status: "error", message: "The form data couldn't be read. Please reload and try again.", design: prev.design };
  }
  try {
    await saveDesign(design);
  } catch (err) {
    console.error("[admin] save design failed:", err);
    return { status: "error", message: "Saving failed. Please try again in a moment.", design: prev.design };
  }
  revalidatePath("/", "layout");
  return { status: "saved", design };
}

/* ---------------- Clients ---------------- */

export async function updateClientNotes(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  if (!/^\d{4,10}$/.test(key)) return { status: "error", message: "Unknown client." };
  try {
    await saveClientNotes(key, String(formData.get("notes") ?? "").trim().slice(0, 5000));
  } catch (err) {
    console.error("[admin] save client notes failed:", err);
    return { status: "error", message: "Saving failed. Please try again." };
  }
  revalidatePath("/admin/clients", "layout");
  return { status: "saved", message: "Notes saved." };
}

/* ---------------- Message replies ---------------- */

export async function replyToMessage(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const reply = String(formData.get("reply") ?? "").trim().slice(0, 10000);
  if (!Number.isInteger(id)) return { status: "error", message: "Unknown message." };
  if (reply.length < 5) return { status: "error", message: "Write your reply first." };
  const sql = await db();
  const [m] = await sql`SELECT name, email, message, locale FROM messages WHERE id = ${id}`;
  if (!m?.email) return { status: "error", message: "This person didn't leave an email address. Call them instead." };
  const quoted = m.message ? `\n\n----\n${String(m.message).split("\n").map((l: string) => `> ${l}`).join("\n")}` : "";
  const sent = await sendEmail({
    to: m.email,
    replyTo: await ownerEmail(),
    subject: m.locale === "fr" ? "Réponse à votre message · HealthyZone" : "Reply to your message · HealthyZone",
    text: reply + quoted,
  });
  if (!sent) return { status: "error", message: "The email couldn't be sent. Please try again in a moment." };
  await sql`UPDATE messages SET reply = ${reply}, replied_at = now(), status = 'handled' WHERE id = ${id}`;
  revalidatePath("/admin", "layout");
  return { status: "saved", message: `Reply sent to ${m.email}.` };
}

/* ---------------- Preview drafts ---------------- */

/** Stores unsaved edits so the preview (Ziad's browser only) can show them. Nothing goes live. */
export async function savePreviewDraft(kind: PreviewableKey, json: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    const raw = JSON.parse(json);
    const value = kind === "content" ? parseContent(raw) : kind === "design" ? parseDesign(raw) : cleanOverrides(raw).value;
    await writeDraft(kind, value);
    return { ok: true };
  } catch (err) {
    console.error("[admin] preview draft failed:", err);
    return { ok: false };
  }
}

/* ---------------- Change history ---------------- */

export async function restoreVersion(id: number): Promise<SettingsState> {
  await requireAdmin();
  const sql = await db();
  const [row] = await sql`SELECT key, value FROM settings_history WHERE id = ${id}`;
  if (!row || !(historyKeys as readonly string[]).includes(row.key)) return { status: "error", message: "That version no longer exists." };
  // writeSetting keeps the version being replaced, so a restore can be undone too.
  await writeSetting(row.key, row.value);
  revalidatePath("/", "layout");
  return { status: "saved", message: "Restored." };
}

/* ---------------- Photo library ---------------- */

export async function removePhoto(url: string): Promise<SettingsState> {
  await requireAdmin();
  try {
    if (!(await deleteUnused(url))) return { status: "error", message: "This photo is in use, so it was kept." };
  } catch (err) {
    console.error("[admin] delete photo failed:", err);
    return { status: "error", message: "Deleting failed. Please try again." };
  }
  revalidatePath("/admin/photos");
  return { status: "saved", message: "Deleted." };
}

/* ---------------- Editing on the website itself ---------------- */

export type EditState = { sections: { key: string; name: string; visible: boolean }[] };

/** Sections for the on-site editor's panel (including hidden ones). */
export async function getEditState(): Promise<EditState> {
  await requireAdmin();
  const [design, content] = await Promise.all([getDesign(), getContent()]);
  const names: Record<string, string> = {
    ...designSectionNames,
    ...Object.fromEntries(content.blocks.map((b) => [b.id, b.title.en || "Your section"])),
  };
  return {
    sections: normalizeSections(design, content.blocks.map((b) => b.id)).map((s) => ({ key: s.key, name: names[s.key] ?? s.key, visible: s.visible })),
  };
}

/**
 * Publishes edits made directly on the website: changed texts (for the language being viewed)
 * and the section order and visibility.
 */
export async function saveInlineEdits(input: {
  locale: string;
  texts: Record<string, string>;
  sections?: { key: string; visible: boolean }[];
}): Promise<SettingsState> {
  await requireAdmin();
  const locale = input.locale === "fr" ? "fr" : "en";
  const entries = Object.entries(input.texts ?? {}).slice(0, 200);
  try {
    if (entries.length) {
      const content = structuredClone(await getContent()) as unknown as Record<string, unknown>;
      for (const [path, value] of entries) {
        const keys = path.split(".");
        if (keys.some((k) => !/^[a-zA-Z0-9]+$/.test(k))) continue;
        let node: unknown = content;
        for (const k of keys) node = (node as Record<string, unknown> | undefined)?.[k];
        // Only existing English/French text pairs can be changed.
        if (!node || typeof node !== "object" || typeof (node as Record<string, unknown>)[locale] !== "string") continue;
        (node as Record<string, string>)[locale] = String(value).replace(/[ \t]+\n/g, "\n").trim().slice(0, 3000);
      }
      const next = parseContent(content);
      const problems = contentProblems(next);
      if (problems.length) return { status: "error", message: problems.join(" ") };
      await saveContent(next);
    }
    if (input.sections?.length) {
      const design = await getDesign();
      await saveDesign(parseDesign({ ...design, sections: input.sections }));
    }
  } catch (err) {
    console.error("[admin] inline save failed:", err);
    return { status: "error", message: "Saving failed. Please try again." };
  }
  revalidatePath("/", "layout");
  return { status: "saved", message: "Saved. Visitors now see your changes." };
}
