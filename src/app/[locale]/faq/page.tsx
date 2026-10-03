import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { Arrow, Button, Container, PageHero, Rich } from "@/components/ui";
import { CTA, FAQList } from "@/components/sections";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getDictionary(locale).meta.pages.faq;
  return { title: m.title, description: m.description, alternates: alternatesFor("/faq") };
}

export default async function FAQPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: t.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <PageHero eyebrow={t.faqPage.eyebrow} title={<Rich text={t.faqPage.title} />} lead={t.faqPage.lead} />
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="sticky top-32 rounded-3xl bg-sand/60 p-8">
                <p className="font-display text-2xl font-medium text-forest">{t.faqPage.stillTitle}</p>
                <p className="mt-3 text-stone">{t.faqPage.stillText}</p>
                <Button href="/contact" className="mt-6 w-full">
                  {t.common.getInTouch} <Arrow />
                </Button>
              </div>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FAQList items={t.faqs} />
            </div>
          </div>
        </Container>
      </section>
      <CTA t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
