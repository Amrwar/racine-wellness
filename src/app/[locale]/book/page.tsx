import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getPricing } from "@/lib/pricing";
import { getContent, getText } from "@/lib/content";
import { getBusiness } from "@/lib/business";
import { getDesign } from "@/lib/design";
import { phoneHref } from "@/lib/business-data";
import { Container, SectionHeader } from "@/components/ui";
import { BookingForm } from "@/components/BookingForm";
import { Phone } from "@/components/icons";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/book">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = (await getText(locale)).booking;
  const share = await getContent().then((c) => c.share.book);
  return {
    title: t.metaTitle, description: t.metaDescription, alternates: alternatesFor("/book"),
    // A page-specific share picture; otherwise the home page's (from the layout) applies.
    ...(share && { openGraph: { title: t.metaTitle, description: t.metaDescription, images: [{ url: share.src, width: share.width, height: share.height }] } }),
  };
}

export default async function BookPage({ params, searchParams }: PageProps<"/[locale]/book">) {
  const { locale } = await params;
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  if (!isLocale(locale)) notFound();
  const [t, pricing, business, design] = await Promise.all([getText(locale), getPricing(), getBusiness(), getDesign()]);

  return (
    <section className="bg-surface py-14 sm:py-20">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader eyebrow={t.booking.eyebrow} title={t.booking.title} lead={t.booking.lead} />
          <a
            href={phoneHref(business.phone)}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy hover:text-blue-dark"
          >
            <Phone className="h-4 w-4" /> {business.phone}
          </a>
        </div>
        <div className="mt-10">
          <BookingForm
            t={t.booking}
            form={t.form}
            durationLabel={t.pricing.duration}
            services={pricing.services}
            promo={pricing.promo.enabled ? pricing.promo[locale] : ""}
            fields={design.forms}
            initial={{ service: one(q.service), minutes: Number(one(q.minutes)) || undefined }}
          />
        </div>
      </Container>
    </section>
  );
}
