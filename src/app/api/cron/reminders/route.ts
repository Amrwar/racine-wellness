import { db } from "@/lib/db";
import { fill } from "@/i18n";
import { getText } from "@/lib/content";
import { getBusiness, notifyEmail } from "@/lib/business";
import { sendEmail } from "@/lib/email";
import { formatPrice } from "@/lib/pricing-data";
import { getPricing } from "@/lib/pricing";
import { addDays, formatWhen, localDay, zonedToDate } from "@/lib/time";

/**
 * Daily (vercel.json cron): emails a reminder to every client with a confirmed appointment
 * tomorrow (Montréal time) who hasn't had one yet. Safe to run twice: reminded_at is set.
 * Vercel sends "Authorization: Bearer $CRON_SECRET" when that variable is set; without it,
 * only Vercel's cron user agent is accepted.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorized = secret
    ? request.headers.get("authorization") === `Bearer ${secret}`
    : (request.headers.get("user-agent") ?? "").includes("vercel-cron");
  if (!authorized) return new Response("Unauthorized", { status: 401 });

  const business = await getBusiness();
  if (!business.reminders) return Response.json({ sent: 0, skipped: "reminders are switched off" });

  const tomorrow = addDays(localDay(new Date()), 1);
  const sql = await db();
  const due = await sql`SELECT * FROM bookings
    WHERE status = 'confirmed' AND email IS NOT NULL AND reminded_at IS NULL
      AND start_at >= ${zonedToDate(tomorrow, "00:00").toISOString()}
      AND start_at < ${zonedToDate(addDays(tomorrow, 1), "00:00").toISOString()}`;

  const pricing = await getPricing();
  let sent = 0;
  for (const b of due) {
    const locale = b.locale === "fr" ? "fr" : "en";
    const dict = await getText(locale);
    const t = dict.booking;
    const when = formatWhen(new Date(b.start_at), locale);
    const title = pricing.services.find((s) => s.id === b.service_id)?.title[locale] ?? b.service_title;
    const ok = await sendEmail({
      to: b.email,
      replyTo: await notifyEmail(),
      subject: t.emails.reminderSubject,
      text: fill(t.emails.reminder, {
        name: String(b.name).split(" ")[0],
        when: `${when.day}, ${when.time}`,
        service: `${title}, ${b.minutes} min (${formatPrice(Number(b.price), locale)})`,
        where: b.location === "home" ? `${t.home}: ${b.address ?? ""}` : `${t.office} (${dict.contact.office})`,
        phone: business.phone,
      }),
    });
    if (ok) {
      await sql`UPDATE bookings SET reminded_at = now() WHERE id = ${b.id}`;
      sent++;
    }
  }
  return Response.json({ sent, due: due.length, date: tomorrow });
}
