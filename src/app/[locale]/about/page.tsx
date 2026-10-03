import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { images } from "@/lib/site";
import { Arrow, Button, Container, Eyebrow, Heading, Lead, PageHero, Rich, SectionHeader } from "@/components/ui";
import { CTA } from "@/components/sections";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getDictionary(locale).meta.pages.about;
  return { title: m.title, description: m.description, alternates: alternatesFor("/about") };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const a = t.about;

  return (
    <>
      <PageHero eyebrow={a.eyebrow} title={<Rich text={a.title} />} lead={a.lead} />

      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="sticky top-32">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-soft">
                  <Image
                    src={images.portrait}
                    alt={a.portraitAlt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-6 rounded-3xl bg-sand/60 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">{a.credentialsLabel}</p>
                  <ul className="mt-4 space-y-2.5 text-sm text-forest">
                    {t.credentials.map((c) => (
                      <li key={c} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="prose-site lg:col-span-6 lg:col-start-7">
              <Eyebrow>{a.storyEyebrow}</Eyebrow>
              <Heading>{a.storyTitle}</Heading>
              <p className="mt-8">{a.story1}</p>
              <p>{a.story2}</p>
              <h2>{a.whoTitle}</h2>
              <p>{a.who}</p>
              <h2>{a.howTitle}</h2>
              <p>{a.how1}</p>
              <p>{a.how2}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button href="/contact">
                  {t.header.bookCall} <Arrow />
                </Button>
                <Button href="/videos" variant="ghost">
                  {a.watchVideos}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-forest py-24 text-cream sm:py-32">
        <Container>
          <SectionHeader light eyebrow={a.valuesEyebrow} title={a.valuesTitle} />
          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-cream/10 sm:grid-cols-2">
            {t.values.map((v, i) => (
              <div key={v.title} className={`bg-forest p-8 sm:p-10 animate-fade-up delay-${i + 1}`}>
                <span className="font-display text-4xl font-light text-sage/60">0{i + 1}</span>
                <h3 className="mt-5 font-display text-2xl font-medium">{v.title}</h3>
                <Lead light className="mt-3 text-base sm:text-base">
                  {v.text}
                </Lead>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTA t={t} />
    </>
  );
}
