import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getBooking } from "@/lib/bookings";
import { getPricing } from "@/lib/pricing";
import { localDay, localTime } from "@/lib/time";
import { PageHeader } from "@/components/admin/ui";
import { BookingEditForm } from "@/components/admin/BookingEditForm";

export const metadata: Metadata = { title: "Edit booking" };

export default async function EditBookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const booking = /^\d+$/.test(id) ? await getBooking(Number(id)) : null;
  if (!booking) notFound();
  const pricing = await getPricing();
  const start = new Date(booking.start_at);

  return (
    <>
      <Link href="/admin/bookings" className="mb-4 inline-block text-sm font-semibold text-blue-dark hover:underline">
        ← Bookings
      </Link>
      <PageHeader title={`Edit booking: ${booking.name}`} lead="Change the time, treatment, price or details of this appointment." />
      {booking.status === "pending" || booking.status === "confirmed" ? (
        <BookingEditForm
          booking={{ ...booking, price: Number(booking.price) }}
          date={localDay(start)}
          time={localTime(start)}
          services={pricing.services}
        />
      ) : (
        <p className="rounded-2xl bg-white p-6 text-muted shadow-card ring-1 ring-mist/60">
          This booking was {booking.status}, so it can no longer be edited.
        </p>
      )}
    </>
  );
}
