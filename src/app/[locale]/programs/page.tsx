import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { Arrow, Button, Check, Container, PageHero, Rich, SectionHeader } from "@/components/ui";
import { CTA, FAQList } from "@/components/sections";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/programs">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getDictionary(locale).meta.pages.programs;
  return { title: m.title, description: m.description, alternates: alternatesFor("/programs") };
}

export default async function ProgramsPage({ params }: PageProps<"/[locale]/programs">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const p = t.programsPage;

  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={<Rich text={p.title} />} lead={p.lead} />

      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {t.programs.map((prog, i) => (
              <article
                key={prog.name}
                className={`relative flex flex-col rounded-[2rem] p-8 sm:p-10 animate-fade-up delay-${i + 1} ${
                  prog.highlighted
                    ? "bg-forest text-cream shadow-soft lg:-my-4 lg:py-14"
                    : "bg-white text-forest shadow-card"
                }`}
              >
                {prog.highlighted && (
                  <span className="absolute right-8 top-8 rounded-full bg-clay px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-cream">
                    {p.popular}
                  </span>
                )}
                <p
                  className={`text-xs font-bold uppercase tracking-[0.2em] ${
                    prog.highlighted ? "text-sage" : "text-clay"
                  }`}
                >
                  {prog.duration}
                </p>
                <h2 className="mt-3 font-display text-3xl font-medium">{prog.name}</h2>
                <p className={`mt-2 ${prog.highlighted ? "text-sage" : "text-stone"}`}>{prog.tagline}</p>
                <p className="mt-8 font-display text-4xl font-medium">{prog.price}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {prog.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium">
                      <Check className={prog.highlighted ? "text-sage" : "text-moss"} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Button href="/contact" variant={prog.highlighted ? "light" : "primary"} className="w-full">
                    {p.startWith} {prog.name} <Arrow />
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-stone">{p.note}</p>
        </Container>
      </section>

      <section className="bg-sand/50 py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeader eyebrow={p.extrasEyebrow} title={p.extrasTitle} lead={p.extrasLead} />
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <dl className="divide-y divide-sand-dark/70 rounded-3xl bg-white/70 px-6 shadow-card sm:px-8">
                {t.extras.map((e) => (
                  <div key={e.name} className="flex items-center justify-between gap-6 py-5">
                    <dt className="font-medium text-forest">{e.name}</dt>
                    <dd className="font-display text-xl text-forest">{e.price}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeader eyebrow={p.faqEyebrow} title={p.faqTitle} />
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FAQList items={[t.faqs[3], t.faqs[4], t.faqs[6]]} />
            </div>
          </div>
        </Container>
      </section>

      <CTA t={t} />
    </>
  );
}
