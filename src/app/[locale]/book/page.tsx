import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getPricing } from "@/lib/pricing";
import { getContent, getText } from "@/lib/content";
import { getBusiness } from "@/lib/business";
import { getDesign } from "@/lib/design";
import { phoneHref } from "@/lib/business-data";
import { ChevronRight } from "lucide-react";
import { LLink } from "@/i18n/LocaleProvider";
import { BookingForm } from "@/components/BookingForm";
import { Container, Eyebrow } from "@/components/ui/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="bg-muted/40">
      {/* Hero */}
      <section className="relative isolate -mt-16 overflow-hidden border-b bg-background pt-16">
        <div aria-hidden className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <Container className="max-w-[1320px] py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <LLink href="/" className="transition-colors hover:text-foreground">
                  {t.booking.breadcrumbHome}
                </LLink>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-4 w-4" />
              </li>
              <li aria-current="page" className="font-medium text-foreground">
                {t.header.book}
              </li>
            </ol>
          </nav>
          <Eyebrow>{t.booking.eyebrow}</Eyebrow>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{t.booking.title}</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">{t.booking.lead}</p>
          <a
            href={phoneHref(business.phone)}
            className={cn(buttonVariants({ variant: "outline" }), "mt-6 h-10 gap-2 rounded-[var(--btn-radius,0.625rem)] px-4 shadow-xs")}
          >
            <Phone className="h-4 w-4 text-navy" /> {business.phone}
          </a>
        </Container>
      </section>

      <section data-no-reveal className="pb-20 pt-10">
        <Container className="max-w-[1320px]">
          <BookingForm
            t={t.booking}
            form={t.form}
            durationLabel={t.pricing.duration}
            perSession={{ title: t.pricing.perSessionTitle, length: t.pricing.lengthAdapted }}
            services={pricing.services}
            promo={pricing.promo.enabled ? pricing.promo[locale] : ""}
            fields={design.forms}
            initial={{ service: one(q.service), minutes: Number(one(q.minutes)) || undefined }}
            phone={business.phone}
            privacyHref={localePath(locale, "/privacy")}
          />
        </Container>
      </section>
    </div>
  );
}
