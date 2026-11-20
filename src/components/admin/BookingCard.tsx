import Link from "next/link";
import { updateBooking } from "@/app/admin/actions";
import type { Booking } from "@/lib/booking-data";
import { formatPrice } from "@/lib/pricing-data";
import { formatWhen, localTime } from "@/lib/time";
import { Badge, Card } from "./ui";

const statusBadge = {
  pending: <Badge tone="blue">Awaiting confirmation</Badge>,
  confirmed: <Badge tone="green">Confirmed</Badge>,
  declined: <Badge>Declined</Badge>,
  cancelled: <Badge>Cancelled</Badge>,
};

function ActionButton({ id, action, label, tone }: { id: number; action: string; label: string; tone: "primary" | "quiet" | "danger" }) {
  const tones = {
    primary: "bg-navy text-white hover:bg-navy-deep",
    quiet: "bg-surface text-navy ring-1 ring-mist hover:bg-white",
    danger: "text-muted-foreground hover:bg-danger/8 hover:text-danger",
  };
  return (
    <form action={updateBooking}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value={action} />
      <button className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tones[tone]}`}>{label}</button>
    </form>
  );
}

/** Full booking details with the actions that apply to its status. */
export function BookingCard({ b }: { b: Booking }) {
  const start = new Date(b.start_at);
  const when = formatWhen(start, "en");
  return (
    <Card className={`p-5 sm:p-6 ${b.status === "pending" ? "border-l-4 border-l-blue" : b.status === "confirmed" ? "border-l-4 border-l-green" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-dark">
            {when.day} · {localTime(start)}–{localTime(new Date(b.end_at))}
          </p>
          <p className="mt-1 text-lg font-semibold text-navy">
            <Link href={`/admin/clients/${b.phone.replace(/\D/g, "").slice(-10)}`} className="hover:underline">
              {b.name}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            {b.service_title} · {b.minutes} min · {formatPrice(Number(b.price), "en")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusBadge[b.status]}
          {b.wants_receipt && <Badge tone="green">Insurance receipt</Badge>}
          <Badge>{b.locale === "fr" ? "Français" : "English"}</Badge>
        </div>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Where</dt>
          <dd className="mt-0.5 text-ink">
            {b.location === "home" ? (
              <>
                Home visit:{" "}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address ?? "")}`}
                  target="_blank"
                  rel="noopener"
                  className="font-medium text-blue-dark hover:underline"
                >
                  {b.address}
                </a>
              </>
            ) : (
              "Office, Saint-Jean"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Contact</dt>
          <dd className="mt-0.5 flex flex-wrap gap-x-4">
            <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-blue-dark hover:underline">
              {b.phone}
            </a>
            {b.email && (
              <a href={`mailto:${b.email}`} className="font-medium text-blue-dark hover:underline">
                {b.email}
              </a>
            )}
          </dd>
        </div>
      </dl>

      {b.notes && <p className="mt-4 whitespace-pre-line rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed text-ink">{b.notes}</p>}

      {(b.status === "pending" || b.status === "confirmed") && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-mist/60 pt-4">
          {b.status === "pending" ? (
            <>
              <ActionButton id={b.id} action="confirm" label="Confirm" tone="primary" />
              <ActionButton id={b.id} action="decline" label="Decline" tone="quiet" />
            </>
          ) : (
            <ActionButton id={b.id} action="cancel" label="Cancel appointment" tone="danger" />
          )}
          <Link
            href={`/admin/bookings/${b.id}`}
            className="rounded-full bg-surface px-4 py-2 text-sm font-semibold text-navy ring-1 ring-mist transition hover:bg-white"
          >
            Edit
          </Link>
          <span className="text-xs text-muted-foreground">{b.email ? "The client is emailed automatically." : ""}</span>
        </div>
      )}
    </Card>
  );
}
