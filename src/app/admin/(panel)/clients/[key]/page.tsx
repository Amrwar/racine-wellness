import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getClient } from "@/lib/clients";
import { formatPrice } from "@/lib/pricing-data";
import { formatWhen, localTime } from "@/lib/time";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { ClientNotes } from "@/components/admin/ClientNotes";

export const metadata: Metadata = { title: "Client" };

const statusTone = { confirmed: "green", pending: "blue", declined: "grey", cancelled: "grey" } as const;
const statusLabel = { confirmed: "Confirmed", pending: "Awaiting confirmation", declined: "Declined", cancelled: "Cancelled" } as const;

export default async function ClientPage({ params }: PageProps<"/admin/clients/[key]">) {
  await requireAdmin();
  const { key } = await params;
  const found = /^\d{4,10}$/.test(key) ? await getClient(key) : null;
  if (!found) notFound();
  const { client: c, bookings } = found;
  const prefill = new URLSearchParams({ name: c.name, phone: c.phone, ...(c.email ? { email: c.email } : {}) });

  return (
    <>
      <Link href="/admin/clients" className="mb-4 inline-block text-sm font-semibold text-blue-dark hover:underline">
        ← Clients
      </Link>
      <PageHeader
        title={c.name}
        lead={
          <>
            <a href={`tel:${c.phone}`} className="font-medium text-blue-dark hover:underline">
              {c.phone}
            </a>
            {c.email && (
              <>
                {" · "}
                <a href={`mailto:${c.email}`} className="font-medium text-blue-dark hover:underline">
                  {c.email}
                </a>
              </>
            )}
          </>
        }
        action={
          <Link
            href={`/admin/bookings/new?${prefill}`}
            className="inline-flex items-center gap-2 rounded-full bg-blue-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 hover:bg-[#00649f]"
          >
            + Book this client
          </Link>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Visits", String(c.visits)],
          ["Upcoming", String(c.upcoming)],
          ["Total", formatPrice(c.spent, "en")],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-navy">{value}</p>
          </Card>
        ))}
      </div>
      <ClientNotes clientKey={c.key} initial={c.notes} />
      <h2 className="mb-3 mt-8 text-lg font-semibold text-navy">Appointments</h2>
      <Card className="divide-y divide-mist/60">
        {bookings.map((b) => {
          const start = new Date(b.start_at);
          return (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div>
                <p className="font-semibold text-navy">
                  {formatWhen(start, "en").day} · {localTime(start)}
                </p>
                <p className="text-sm text-muted">
                  {b.service_title}, {b.minutes} min · {formatPrice(Number(b.price), "en")} ·{" "}
                  {b.location === "home" ? `Home visit${b.address ? `, ${b.address}` : ""}` : "Office"}
                </p>
                {b.notes && <p className="mt-1 text-sm italic text-muted">“{b.notes}”</p>}
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={statusTone[b.status]}>{statusLabel[b.status]}</Badge>
                {(b.status === "pending" || b.status === "confirmed") && (
                  <Link href={`/admin/bookings/${b.id}`} className="text-sm font-semibold text-blue-dark hover:underline">
                    Edit
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
