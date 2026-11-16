import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getPricing } from "@/lib/pricing";
import { isDay, isTime, localDay } from "@/lib/time";
import type { Booking } from "@/lib/booking-data";
import { PageHeader } from "@/components/admin/ui";
import { BookingEditForm } from "@/components/admin/BookingEditForm";

export const metadata: Metadata = { title: "New booking" };

export default async function NewBookingPage({ searchParams }: PageProps<"/admin/bookings/new">) {
  await requireAdmin();
  const { date, time, name, phone, email } = await searchParams;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const pricing = await getPricing();
  const first = pricing.services[0];
  const rate = first?.rates[0];
  const blank: Booking = {
    id: 0,
    created_at: "",
    start_at: "",
    end_at: "",
    service_id: first?.id ?? "",
    service_title: first?.title.en ?? "",
    minutes: rate?.minutes ?? 60,
    price: rate?.price ?? 0,
    location: "office",
    address: null,
    name: str(name, 120),
    phone: str(phone, 40),
    email: str(email, 200) || null,
    notes: null,
    wants_receipt: false,
    locale: "en",
    status: "confirmed",
  };

  return (
    <>
      <Link href="/admin/bookings" className="mb-4 inline-block text-sm font-semibold text-blue-dark hover:underline">
        ← Bookings
      </Link>
      <PageHeader title="New booking" lead="Add an appointment you arranged by phone, text or in person. It's confirmed straight away." />
      <BookingEditForm
        isNew
        booking={blank}
        date={typeof date === "string" && isDay(date) ? date : localDay(new Date())}
        time={typeof time === "string" && isTime(time) ? time : "10:00"}
        services={pricing.services}
      />
    </>
  );
}
