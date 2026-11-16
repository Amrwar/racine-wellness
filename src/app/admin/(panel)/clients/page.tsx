import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getClients } from "@/lib/clients";
import { formatPrice } from "@/lib/pricing-data";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Clients" };

const day = (d: string | null) =>
  d ? new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "America/Montreal" }).format(new Date(d)) : "—";

export default async function ClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().toLowerCase() : "";
  const digits = query.replace(/\D/g, "");
  const all = await getClients();
  const clients = query
    ? all.filter((c) => [c.name, c.email ?? "", c.phone, c.notes].some((s) => s.toLowerCase().includes(query)) || (digits.length >= 3 && c.key.includes(digits)))
    : all;

  return (
    <>
      <PageHeader
        title="Clients"
        lead="Everyone who has booked, with their visits and your private notes. Built automatically from bookings."
        action={
          <a href="/admin/export/clients.csv" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy shadow-card ring-1 ring-mist/60 hover:ring-blue">
            Download spreadsheet
          </a>
        }
      />
      <form className="mb-5">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name, phone, email or note…"
          className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-ink outline-none focus:border-blue focus:ring-4 focus:ring-blue/15"
        />
      </form>
      {clients.length === 0 ? (
        <EmptyState title={query ? "No client matches" : "No clients yet"} text={query ? "Try another name or number." : "Clients appear here after their first booking."} />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-mist/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted md:grid">
            <span>Client</span>
            <span>Visits</span>
            <span>Last visit</span>
            <span>Next</span>
            <span className="text-right">Total</span>
          </div>
          <ul className="divide-y divide-mist/60">
            {clients.map((c) => (
              <li key={c.key}>
                <Link href={`/admin/clients/${c.key}`} className="grid gap-1 px-6 py-4 transition hover:bg-surface md:grid-cols-[2fr_1fr_1fr_1fr_1fr] md:items-center md:gap-4">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-navy">{c.name}</span>
                    <span className="block truncate text-sm text-muted">
                      {c.phone}
                      {c.email && ` · ${c.email}`}
                    </span>
                  </span>
                  <span className="text-sm text-ink">
                    <span className="md:hidden">Visits: </span>
                    {c.visits}
                    {c.visits > 1 && <span className="ml-2 rounded-full bg-green/15 px-2 py-0.5 text-xs font-semibold text-[#007a43]">Returning</span>}
                  </span>
                  <span className="text-sm text-muted">
                    <span className="md:hidden">Last: </span>
                    {day(c.last_visit)}
                  </span>
                  <span className="text-sm text-muted">
                    <span className="md:hidden">Next: </span>
                    {day(c.next_visit)}
                  </span>
                  <span className="text-sm font-semibold text-navy md:text-right">{formatPrice(c.spent, "en")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <p className="mt-3 text-xs text-muted">Totals count confirmed appointments that have already happened, at the booked price.</p>
    </>
  );
}
