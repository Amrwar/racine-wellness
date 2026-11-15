import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAvailability } from "@/lib/bookings";
import { localDay } from "@/lib/time";
import { PageHeader } from "@/components/admin/ui";
import { AvailabilityEditor } from "@/components/admin/AvailabilityEditor";

export const metadata: Metadata = { title: "Opening hours" };

export default async function AvailabilityPage() {
  await requireAdmin();
  const availability = await getAvailability();
  return (
    <>
      <Link href="/admin/bookings" className="mb-4 inline-block text-sm font-semibold text-blue-dark hover:underline">
        ← Bookings
      </Link>
      <PageHeader title="Opening hours & time off" lead="When clients can book online. Requests are never accepted outside these hours." />
      <AvailabilityEditor initial={availability} today={localDay(new Date())} />
    </>
  );
}
