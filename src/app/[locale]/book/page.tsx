import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getPricing } from "@/lib/pricing";
import { getContent, getText } from "@/lib/content";
import { getBusiness } from "@/lib/business";
import { getDesign } from "@/lib/design";
import { phoneHref } from "@/lib/business-data";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { LLink } from "@/i18n/LocaleProvider";
import { studioPhoto } from "@/lib/booking-ui";
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
    <div className="bg-surface">
      {/* Hero: navy over the HealthyZone studio (an empty treatment room) */}
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        <Image src={studioPhoto} alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[50%_60%] opacity-90" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep via-navy/90 to-navy/40" />
        <div className="mx-auto w-full max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/75">
            <ol className="flex items-center gap-2">
              <li>
                <LLink href="/" className="hover:text-white">
                  {t.booking.breadcrumbHome}
                </LLink>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-4 w-4" />
              </li>
              <li aria-current="page" className="font-medium text-white">
                {t.header.book}
              </li>
            </ol>
          </nav>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-green">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
            {t.booking.eyebrow}
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-[-0.02em] sm:text-5xl">{t.booking.title}</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{t.booking.lead}</p>
          <a href={phoneHref(business.phone)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 backdrop-blur-sm hover:bg-white/15">
            <Phone className="h-4 w-4 text-green" /> {business.phone}
          </a>
        </div>
      </section>

      <section className="pb-20 pt-10">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
          <BookingForm
            t={t.booking}
            form={t.form}
            durationLabel={t.pricing.duration}
            services={pricing.services}
            promo={pricing.promo.enabled ? pricing.promo[locale] : ""}
            fields={design.forms}
            initial={{ service: one(q.service), minutes: Number(one(q.minutes)) || undefined }}
            phone={business.phone}
            privacyHref={localePath(locale, "/privacy")}
          />
        </div>
      </section>
    </div>
  );
}
