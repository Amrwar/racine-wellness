import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPricing } from "@/lib/pricing";
import { formatPrice } from "@/lib/pricing-data";
import { Card, PageHeader } from "@/components/admin/ui";
import { MessageCard, type Message } from "@/components/admin/MessageCard";

export default async function OverviewPage() {
  await requireAdmin();
  const sql = await db();
  const [counts] = await sql`SELECT
      count(*) FILTER (WHERE status = 'new')::int AS new,
      count(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS month,
      count(*)::int AS total
    FROM messages`;
  const recent = (await sql`SELECT * FROM messages WHERE status = 'new' ORDER BY created_at DESC LIMIT 3`) as Message[];
  const pricing = await getPricing();
  const prices = pricing.services.flatMap((s) => s.rates.map((r) => r.price));

  const stats = [
    { label: "New messages", value: counts.new, href: "/admin/messages", accent: counts.new > 0 },
    { label: "Messages, last 30 days", value: counts.month, href: "/admin/messages?show=all" },
    { label: "Massage services listed", value: pricing.services.length, href: "/admin/pricing" },
  ];

  return (
    <>
      <PageHeader title="Hello, Ziad" lead="Here's what's happening on your website." />

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
    </>
  );
}
