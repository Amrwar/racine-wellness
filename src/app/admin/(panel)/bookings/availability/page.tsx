import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAvailability, hoursSaved } from "@/lib/bookings";
import { localDay } from "@/lib/time";
import { PageHeader } from "@/components/admin/ui";
import { AvailabilityEditor } from "@/components/admin/AvailabilityEditor";
import { GoogleCalendarSettings } from "@/components/admin/GoogleCalendarSettings";
import { getGoogleSettings, googleConfigured } from "@/lib/google";

export const metadata: Metadata = { title: "Opening hours" };

export default async function AvailabilityPage({ searchParams }: PageProps<"/admin/bookings/availability">) {
  await requireAdmin();
  const { google } = await searchParams;
  const [availability, googleSettings, saved] = await Promise.all([getAvailability(), getGoogleSettings(), hoursSaved()]);
  return (
    <>
      <Link href="/admin/bookings" className="mb-4 inline-block text-sm font-semibold text-blue-dark hover:underline">
        ← Bookings
      </Link>
      <PageHeader title="Opening hours & time off" lead="When clients can book online. Requests are never accepted outside these hours." />
      <div className="mb-6">
        <GoogleCalendarSettings
          settings={googleSettings}
          configured={googleConfigured()}
          flash={typeof google === "string" ? google : undefined}
        />
      </div>
      {!saved && (
        <p role="status" className="mb-6 rounded-2xl bg-[#fff6e5] px-5 py-4 text-sm text-[#7a4b00] ring-1 ring-[#f0c36d]">
          <strong className="font-semibold">Online booking is paused.</strong> The hours below are only a starting point. Clients can&apos;t pick a time on
          the website until you set your real hours and press Save; until then the booking page asks them to call or write.
        </p>
      )}
      <AvailabilityEditor initial={availability} today={localDay(new Date())} />
    </>
  );
}
