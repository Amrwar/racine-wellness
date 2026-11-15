import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { getPricing } from "@/lib/pricing";
import { site } from "@/lib/site";
import { Container, SectionHeader } from "@/components/ui";
import { BookingForm } from "@/components/BookingForm";
import { Phone } from "@/components/icons";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/book">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).booking;
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternatesFor("/book") };
}

export default async function BookPage({ params }: PageProps<"/[locale]/book">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const pricing = await getPricing();

  return (
    <section className="bg-surface py-14 sm:py-20">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader eyebrow={t.booking.eyebrow} title={t.booking.title} lead={t.booking.lead} />
          <a
            href={site.phoneHref}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy hover:text-blue-dark"
          >
            <Phone className="h-4 w-4" /> {site.phone}
          </a>
        </div>
        <div className="mt-10">
          <BookingForm
            t={t.booking}
            form={t.form}
            durationLabel={t.pricing.duration}
            services={pricing.services}
            promo={pricing.promo.enabled ? pricing.promo[locale] : ""}
          />
        </div>
      </Container>
    </section>
  );
}
