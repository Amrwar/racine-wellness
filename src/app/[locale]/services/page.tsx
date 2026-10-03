import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { serviceIcons } from "@/components/icons";
import { Arrow, Button, Check, Container, Eyebrow, Heading, PageHero, Rich } from "@/components/ui";
import { CTA } from "@/components/sections";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getDictionary(locale).meta.pages.services;
  return { title: m.title, description: m.description, alternates: alternatesFor("/services") };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <PageHero eyebrow={t.servicesPage.eyebrow} title={<Rich text={t.servicesPage.title} />} lead={t.servicesPage.lead}>
        <nav aria-label={t.nav.services} className="flex flex-wrap gap-2">
          {t.services.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="rounded-full border border-forest/15 px-4 py-2 text-sm font-semibold text-forest transition hover:border-forest hover:bg-forest hover:text-cream"
            >
              {s.title}
            </a>
          ))}
        </nav>
      </PageHero>

      {t.services.map((s, i) => {
        const Icon = serviceIcons[s.icon];
        const flip = i % 2 === 1;
        return (
          <section
            key={s.slug}
            id={s.slug}
            className={`scroll-mt-28 py-20 sm:py-28 ${i % 2 === 1 ? "bg-sand/50" : ""}`}
          >
            <Container>
              <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
                <div className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
                  <div className="relative aspect-square overflow-hidden rounded-[2.5rem] shadow-soft">
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute bottom-6 left-6 grid h-14 w-14 place-items-center rounded-2xl bg-cream/90 text-forest backdrop-blur">
                      <Icon className="h-7 w-7" />
                    </span>
                  </div>
                </div>
                <div className={`lg:col-span-6 ${flip ? "lg:order-1" : ""}`}>
                  <Eyebrow>0{i + 1}</Eyebrow>
                  <Heading>{s.title}</Heading>
                  <p className="mt-6 text-lg leading-relaxed text-stone">{s.description}</p>
                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {s.includes.map((inc) => (
                      <li
                        key={inc}
                        className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 text-sm font-medium text-forest"
                      >
                        <Check className="text-moss" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Button href="/contact">
                      {t.servicesPage.enquire} {s.title.toLowerCase()} <Arrow />
                    </Button>
                    <Button href="/programs" variant="ghost">
                      {t.common.seePrograms}
                    </Button>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        );
      })}

      <CTA t={t} title={t.cta.servicesTitle} text={t.cta.servicesText} />
    </>
  );
}
