import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPricing } from "@/lib/pricing";
import { formatPrice } from "@/lib/pricing-data";
import { Card, PageHeader } from "@/components/admin/ui";
import { MessageCard, type Message } from "@/components/admin/MessageCard";
import type { Booking } from "@/lib/booking-data";
import { formatWhen, localTime } from "@/lib/time";
import { getGoogleSettings, googleConfigured } from "@/lib/google";
import { Checklist, type ChecklistItem } from "@/components/admin/Checklist";

export default async function OverviewPage() {
  await requireAdmin();
  const sql = await db();
  const [counts] = await sql`SELECT
      count(*) FILTER (WHERE status = 'new')::int AS new,
      count(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS month,
      count(*)::int AS total
    FROM messages`;
  const recent = (await sql`SELECT * FROM messages WHERE status = 'new' ORDER BY created_at DESC LIMIT 3`) as Message[];
  const [bk] = await sql`SELECT
      count(*) FILTER (WHERE status = 'pending' AND end_at > now())::int AS pending,
      count(*) FILTER (WHERE status = 'confirmed' AND start_at > now() AND start_at < now() + interval '7 days')::int AS week
    FROM bookings`;
  const upcoming = (await sql`SELECT * FROM bookings WHERE status IN ('pending', 'confirmed') AND end_at > now()
    ORDER BY start_at LIMIT 4`) as Booking[];
  const pricing = await getPricing();
  const keys = new Set((await sql`SELECT key FROM settings`).map((r) => r.key as string));
  const google = await getGoogleSettings();
  const setup: ChecklistItem[] = [
    {
      done: keys.has("availability"),
      title: "Set your real opening hours",
      text: "The booking page uses sample hours until you save yours. Add your days off there too.",
      href: "/admin/bookings/availability",
      action: "Set hours",
    },
    {
      done: google.connected,
      title: "Connect your Google Calendar",
      text: googleConfigured()
        ? "Red events in your Google Calendar will block those times on the booking page."
        : "Your web developer is finishing the Google setup; then one click connects it here.",
      href: "/admin/bookings/availability#google",
      action: "Open",
    },
    {
      done: keys.has("admin_auth"),
      title: "Choose your own password",
      text: "Replace the password you were given with one only you know.",
      href: "/admin/settings#password",
      action: "Change",
    },
    {
      done: keys.has("business"),
      title: "Check your contact details",
      text: "Phone, email, Instagram, and the address that receives booking requests.",
      href: "/admin/settings",
      action: "Review",
    },
    {
      done: keys.has("content"),
      title: "Review your home page",
      text: "Read through the text and photos, in English and French, and adjust anything.",
      href: "/admin/website",
      action: "Review",
    },
  ];
  const prices = pricing.services.flatMap((s) => s.rates.map((r) => r.price));

  const stats = [
    { label: "Booking requests to confirm", value: bk.pending, href: "/admin/bookings", accent: bk.pending > 0 },
    { label: "Appointments, next 7 days", value: bk.week, href: "/admin/bookings" },
    { label: "New messages", value: counts.new, href: "/admin/messages", accent: counts.new > 0 },
  ];

  return (
    <>
      <PageHeader title="Hello, Ziad" lead="Here's what's happening on your website." />

      <Checklist items={setup} />

      <nav aria-label="Quick actions" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/admin/bookings/new", label: "Add a booking", d: "M12 5v14M5 12h14" },
          { href: "/admin/bookings/availability", label: "Hours & time off", d: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
          { href: "/admin/blog/new", label: "Write an article", d: "M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" },
          { href: "/admin/website", label: "Edit the website", d: "M3 5h18v14H3zM3 9h18" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-navy shadow-card ring-1 ring-mist/60 transition hover:-translate-y-0.5 hover:ring-blue"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-green">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={a.d} />
              </svg>
            </span>
            {a.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <Card className="h-full p-6 transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
              <p className="text-sm font-medium text-muted">{s.label}</p>
              <p className={`mt-2 text-4xl font-semibold tracking-tight ${s.accent ? "text-blue-dark" : "text-navy"}`}>
                {s.value}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Upcoming appointments</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-blue-dark hover:underline">
            Open calendar
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <Card className="p-6 text-sm text-muted">No upcoming appointments yet.</Card>
        ) : (
          <Card className="divide-y divide-mist/60">
            {upcoming.map((b) => {
              const start = new Date(b.start_at);
              return (
                <Link key={b.id} href="/admin/bookings" className="flex flex-wrap items-center gap-x-6 gap-y-1 px-6 py-4 transition hover:bg-surface">
                  <span className="w-56 text-sm font-semibold text-navy">
                    {formatWhen(start, "en").day.replace(/, \d{4}$/, "")} · {localTime(start)}
                  </span>
                  <span className="flex-1 text-ink">
                    {b.name} <span className="text-sm text-muted">· {b.service_title}, {b.minutes} min · {b.location === "home" ? "Home visit" : "Office"}</span>
                  </span>
                  {b.status === "pending" ? (
                    <span className="rounded-full bg-blue/12 px-2.5 py-0.5 text-xs font-semibold text-blue-dark">To confirm</span>
                  ) : (
                    <span className="rounded-full bg-green/15 px-2.5 py-0.5 text-xs font-semibold text-[#007a43]">Confirmed</span>
                  )}
                </Link>
              );
            })}
          </Card>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">Latest new messages</h2>
            <Link href="/admin/messages" className="text-sm font-semibold text-blue-dark hover:underline">
              See all
            </Link>
          </div>
          {recent.length === 0 ? (
            <Card className="p-6 text-sm text-muted">No new messages. You&apos;re all caught up.</Card>
          ) : (
            <ul className="space-y-3">
              {recent.map((m) => (
                <li key={m.id}>
                  <Link href="/admin/messages" className="block transition hover:-translate-y-0.5">
                    <MessageCard m={m} compact />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">Pricing on the site</h2>
            <Link href="/admin/pricing" className="text-sm font-semibold text-blue-dark hover:underline">
              Edit
            </Link>
          </div>
          <Card className="overflow-hidden">
            <div className={`px-6 py-4 text-sm font-semibold ${pricing.promo.enabled ? "bg-navy text-white" : "bg-surface text-muted"}`}>
              {pricing.promo.enabled ? (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green" /> {pricing.promo.en}
                </span>
              ) : (
                "No promotion running"
              )}
            </div>
            <ul className="divide-y divide-mist/60">
              {pricing.services.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <span className="font-medium text-ink">{s.title.en}</span>
                  <span className="shrink-0 text-sm text-muted">
                    from {formatPrice(Math.min(...s.rates.map((r) => r.price)), "en")}
                  </span>
                </li>
              ))}
            </ul>
            {prices.length > 0 && (
              <p className="border-t border-mist/60 px-6 py-3 text-xs text-muted">
                {formatPrice(Math.min(...prices), "en")} to {formatPrice(Math.max(...prices), "en")} across all sessions
              </p>
            )}
          </Card>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-navy">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Online bookings",
              text: "Clients request a time on the booking page. Nothing is final until you confirm it in Bookings; the client is emailed when you confirm, decline or cancel.",
            },
            {
              title: "Your availability",
              text: "Only times inside your opening hours, outside your days off and away from other appointments (plus your travel gap) are offered to clients.",
            },
            {
              title: "Messages",
              text: "Contact form messages arrive here and by email. Mark them handled once you've replied so the count stays useful.",
            },
            {
              title: "Your website",
              text: "Every text, photo, price and article can be changed from this admin. Changes appear on the site as soon as you save.",
            },
            {
              title: "English and French",
              text: "Every text has both languages. “Translate from English” writes a French draft for you to read over before saving.",
            },
            {
              title: "On your phone",
              text: "This admin works on your phone. Add it to your home screen, and subscribe to the bookings calendar link on the Bookings page.",
            },
          ].map((h) => (
            <Card key={h.title} className="p-5">
              <h3 className="font-semibold text-navy">{h.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{h.text}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
