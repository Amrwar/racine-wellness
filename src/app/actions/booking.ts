"use server";

import { fill, getDictionary } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";
import { db } from "@/lib/db";
import { getPricing } from "@/lib/pricing";
import { formatPrice } from "@/lib/pricing-data";
import { openDays, slotsOn } from "@/lib/bookings";
import { ownerEmail, sendEmail } from "@/lib/email";
import { formatWhen, isDay, isTime, zonedToDate } from "@/lib/time";
import { site } from "@/lib/site";
import { revalidatePath } from "next/cache";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v: FormDataEntryValue | null, max = 500) => String(v ?? "").trim().slice(0, max);

async function findRate(serviceId: string, minutes: number) {
  const pricing = await getPricing();
  const service = pricing.services.find((s) => s.id === serviceId);
  const rate = service?.rates.find((r) => r.minutes === minutes);
  return service && rate ? { service, rate } : null;
}

/** Days with at least one free slot for this treatment length. */
export async function availableDays(serviceId: string, minutes: number): Promise<string[]> {
  if (!(await findRate(serviceId, minutes))) return [];
  return openDays(minutes);
}

/** Free start times on a day for this treatment length. */
export async function availableTimes(serviceId: string, minutes: number, date: string): Promise<string[]> {
  if (!isDay(date) || !(await findRate(serviceId, minutes))) return [];
  return slotsOn(date, minutes);
}

export type BookingState = {
  status: "idle" | "success" | "error" | "taken";
  message?: string;
  errors?: Partial<Record<"name" | "phone" | "email" | "address" | "slot", string>>;
};

export async function requestBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const rawLocale = clean(formData.get("locale"), 5);
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const t = dict.booking;

  if (clean(formData.get("company"))) return { status: "success", message: fill(t.success, { name: "", when: "" }) };

  const serviceId = clean(formData.get("service"), 40);
  const minutes = Number(formData.get("minutes"));
  const date = clean(formData.get("date"), 10);
  const time = clean(formData.get("time"), 5);
  const location = formData.get("location") === "home" ? "home" : "office";
  const address = clean(formData.get("address"), 300);
  const name = clean(formData.get("name"), 120);
  const phone = clean(formData.get("phone"), 40);
  const email = clean(formData.get("email"), 200);
  const notes = clean(formData.get("notes"), 2000);
  const wantsReceipt = formData.get("receipt") === "yes";

  const errors: BookingState["errors"] = {};
  if (name.length < 2) errors.name = dict.form.errors.name;
  if (phone.replace(/\D/g, "").length < 10) errors.phone = dict.form.errors.phone;
  if (!EMAIL_RE.test(email)) errors.email = dict.form.errors.email;
  if (location === "home" && address.length < 6) errors.address = t.errors.address;
  const found = await findRate(serviceId, minutes);
  if (!found || !isDay(date) || !isTime(time)) errors.slot = t.errors.slot;
  if (Object.keys(errors).length) return { status: "error", message: dict.form.fixFields, errors };

  // The slot must still be free right now.
  if (!(await slotsOn(date, minutes)).includes(time)) return { status: "taken", message: t.taken };

  const { service, rate } = found!;
  const start = zonedToDate(date, time);
  const end = new Date(start.getTime() + minutes * 60_000);
  const sql = await db();
  const [row] = await sql`INSERT INTO bookings
      (start_at, end_at, service_id, service_title, minutes, price, location, address, name, phone, email, notes, wants_receipt, locale)
    VALUES (${start.toISOString()}, ${end.toISOString()}, ${service.id}, ${service.title.en}, ${minutes}, ${rate.price},
      ${location}, ${location === "home" ? address : null}, ${name}, ${phone}, ${email}, ${notes || null}, ${wantsReceipt}, ${locale})
    RETURNING id`;

  // Two people could submit the same slot at once: the earlier request keeps it.
  const [clash] = await sql`SELECT id FROM bookings WHERE id < ${row.id} AND status IN ('pending', 'confirmed')
    AND start_at < ${end.toISOString()} AND end_at > ${start.toISOString()} LIMIT 1`;
  if (clash) {
    await sql`DELETE FROM bookings WHERE id = ${row.id}`;
    return { status: "taken", message: t.taken };
  }

  const when = formatWhen(start, locale);
  const whenText = `${when.day}, ${when.time}`;
  const enWhen = formatWhen(start, "en");
  const serviceLine = `${service.title[locale]}, ${minutes} min (${formatPrice(rate.price, locale)})`;

  await Promise.all([
    sendEmail({
      to: ownerEmail(),
      replyTo: email,
      subject: `Booking request: ${name}, ${enWhen.day} at ${enWhen.time}`,
      text: [
        `New booking request (confirm or decline it in the admin):`,
        `${site.url}/admin/bookings`,
        "",
        `When: ${enWhen.day}, ${enWhen.time}`,
        `Treatment: ${service.title.en}, ${minutes} min (${formatPrice(rate.price, "en")})`,
        `Where: ${location === "home" ? `Home visit, ${address}` : "Office"}`,
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Insurance receipt: ${wantsReceipt ? "Yes" : "No"}`,
        `Language: ${locale === "fr" ? "Français" : "English"}`,
        "",
        notes || "(No notes)",
      ].join("\n"),
    }),
    sendEmail({
      to: email,
      replyTo: ownerEmail(),
      subject: t.emails.requestSubject,
      text: fill(t.emails.request, {
        name: name.split(" ")[0],
        when: whenText,
        service: serviceLine,
        where: location === "home" ? `${t.home}: ${address}` : `${t.office} (${dict.contact.office})`,
        phone: site.phone,
      }),
    }),
  ]);

  revalidatePath("/admin", "layout");
  return { status: "success", message: fill(t.success, { name: name.split(" ")[0], when: whenText }) };
}
