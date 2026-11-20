import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/pricing-data";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Stats" };

const TZ = "America/Montreal";
const monthLabel = (ym: string, opts: Intl.DateTimeFormatOptions = { month: "short" }) =>
  new Intl.DateTimeFormat("en-CA", { ...opts, timeZone: "UTC" }).format(new Date(`${ym}-15T12:00:00Z`));
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** One single-series bar chart (one hue, no legend; each bar has a hover label). */
function Bars({ data, format, label }: { data: { key: string; label: string; value: number }[]; format: (n: number) => string; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);
  return (
    <figure>
      <div className="flex h-44 items-end gap-[2px]" role="img" aria-label={label}>
        {data.map((d) => (
          <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.label}: ${format(d.value)}`}>
            {/* Hover label */}
            <span className="pointer-events-none absolute -top-1 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:block">
              {d.label}: {format(d.value)}
            </span>
            {d.key === peak.key && d.value > 0 && <span className="mb-1 text-center text-[0.7rem] font-semibold text-navy">{format(d.value)}</span>}
            <div
              className="w-full rounded-t-[4px] bg-navy transition group-hover:bg-blue-dark"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[2px] border-t border-mist pt-1.5">
        {data.map((d) => (
          <span key={d.key} className="flex-1 text-center text-[0.7rem] text-muted-foreground">
            {d.label}
          </span>
        ))}
      </div>
    </figure>
  );
}

export default async function StatsPage() {
  await requireAdmin();
  const sql = await db();
  const [monthly, weekdays, services, [totals]] = await Promise.all([
    sql`SELECT to_char(date_trunc('month', start_at AT TIME ZONE ${TZ}), 'YYYY-MM') AS ym,
        count(*)::int AS n, coalesce(sum(price), 0)::float AS revenue
      FROM bookings WHERE status = 'confirmed' AND start_at > now() - interval '13 months'
      GROUP BY 1`,
    sql`SELECT extract(isodow FROM start_at AT TIME ZONE ${TZ})::int AS dow, count(*)::int AS n
      FROM bookings WHERE status = 'confirmed' GROUP BY 1`,
    sql`SELECT service_title AS title, count(*)::int AS n, coalesce(sum(price), 0)::float AS revenue
      FROM bookings WHERE status = 'confirmed' GROUP BY 1 ORDER BY n DESC LIMIT 6`,
    sql`SELECT
        count(*) FILTER (WHERE status = 'confirmed' AND date_trunc('month', start_at AT TIME ZONE ${TZ}) = date_trunc('month', now() AT TIME ZONE ${TZ}))::int AS month_n,
        coalesce(sum(price) FILTER (WHERE status = 'confirmed' AND date_trunc('month', start_at AT TIME ZONE ${TZ}) = date_trunc('month', now() AT TIME ZONE ${TZ})), 0)::float AS month_rev,
        count(DISTINCT right(regexp_replace(phone, '[^0-9]', '', 'g'), 10)) FILTER (WHERE status = 'confirmed')::int AS clients,
        count(*) FILTER (WHERE status IN ('declined', 'cancelled'))::int AS lost,
        count(*)::int AS requests
      FROM bookings`,
  ]);
  const [{ returning }] = await sql`SELECT count(*)::int AS returning FROM (
      SELECT right(regexp_replace(phone, '[^0-9]', '', 'g'), 10) AS k FROM bookings WHERE status = 'confirmed' GROUP BY 1 HAVING count(*) > 1) r`;

  // Last 12 months, oldest first, including empty months.
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
    const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const row = monthly.find((m) => m.ym === ym);
    return { ym, n: row?.n ?? 0, revenue: row?.revenue ?? 0 };
  });
  const byDay = days.map((label, i) => ({ key: label, label, value: weekdays.find((w) => w.dow === i + 1)?.n ?? 0 }));
  const maxService = Math.max(1, ...services.map((s) => s.n));
  const money = (n: number) => formatPrice(Math.round(n), "en");

  const tiles = [
    { label: "Appointments this month", value: String(totals.month_n) },
    { label: "Booked value this month", value: money(totals.month_rev) },
    { label: "Clients", value: String(totals.clients), note: `${returning} returning` },
    { label: "Requests declined or cancelled", value: String(totals.lost), note: `of ${totals.requests} in total` },
  ];

  return (
    <>
      <PageHeader title="Stats" lead="How your practice is doing, from confirmed appointments. Values use the booked price." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-5">
            <p className="text-sm text-muted-foreground">{t.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-navy">{t.value}</p>
            {t.note && <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p>}
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold text-navy">Appointments per month</h2>
          <p className="mb-5 text-sm text-muted-foreground">Confirmed, last 12 months</p>
          <Bars label="Appointments per month" data={months.map((m) => ({ key: m.ym, label: monthLabel(m.ym), value: m.n }))} format={(n) => String(n)} />
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-navy">Booked value per month</h2>
          <p className="mb-5 text-sm text-muted-foreground">Confirmed, last 12 months</p>
          <Bars label="Booked value per month" data={months.map((m) => ({ key: m.ym, label: monthLabel(m.ym), value: m.revenue }))} format={money} />
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-navy">Busiest days</h2>
          <p className="mb-5 text-sm text-muted-foreground">Confirmed appointments by day of the week</p>
          <Bars label="Appointments by weekday" data={byDay} format={(n) => String(n)} />
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-navy">Most booked treatments</h2>
          <p className="mb-5 text-sm text-muted-foreground">Confirmed appointments</p>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">No confirmed appointments yet.</p>
          ) : (
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s.title} title={`${s.title}: ${s.n} appointments, ${money(s.revenue)}`}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-ink">{s.title}</span>
                    <span className="text-muted-foreground">
                      {s.n} · {money(s.revenue)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-surface">
                    <div className="h-2 rounded-full bg-navy" style={{ width: `${(s.n / maxService) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Table view of the monthly figures (screen readers, exact numbers). */}
      <details className="mt-6 rounded-2xl bg-white p-5 shadow-card ring-1 ring-mist/60">
        <summary className="cursor-pointer text-sm font-semibold text-navy">Show the monthly numbers as a table</summary>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="py-2 font-semibold">Month</th>
              <th className="py-2 text-right font-semibold">Appointments</th>
              <th className="py-2 text-right font-semibold">Booked value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist/60">
            {[...months].reverse().map((m) => (
              <tr key={m.ym}>
                <td className="py-2 text-ink">{monthLabel(m.ym, { month: "long", year: "numeric" })}</td>
                <td className="py-2 text-right text-ink">{m.n}</td>
                <td className="py-2 text-right text-ink">{money(m.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}
