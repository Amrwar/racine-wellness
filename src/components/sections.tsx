import Image from "next/image";
import type { Dictionary } from "@/i18n/en";
import { LLink } from "@/i18n/LocaleProvider";
import { serviceIcons, Quote } from "./icons";
import { Arrow, Button, Container, Eyebrow, Heading, Lead, Rich, SectionHeader } from "./ui";

/* ---------- FAQ ---------- */
export function FAQList({ items }: { items: Dictionary["faqs"] }) {
  return (
    <div className="divide-y divide-sand-dark/70 border-y border-sand-dark/70">
      {items.map((f, i) => (
        <details key={f.q} className="group py-2" open={i === 0}>
          <summary className="flex items-start justify-between gap-6 py-5 text-left">
            <span className="font-display text-xl font-medium text-forest sm:text-2xl">{f.q}</span>
            <span className="chev mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-forest/20 text-forest transition-transform duration-300">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
                <path d="M8 2v12M2 8h12" />
              </svg>
            </span>
          </summary>
          <p className="max-w-3xl pb-6 leading-relaxed text-stone">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/* ---------- Services grid ---------- */
export function ServicesGrid({
  services,
  learnMore,
}: {
  services: Dictionary["services"];
  learnMore: string;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {services.map((s, i) => {
        const Icon = serviceIcons[s.icon];
        return (
          <LLink
            key={s.slug}
            href={`/services#${s.slug}`}
            className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition duration-500 hover:-translate-y-1 hover:shadow-soft animate-fade-up delay-${(i % 4) + 1}`}
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={s.image}
                alt={s.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/50 to-transparent" />
            </div>
            <div className="flex flex-1 flex-col p-7">
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-sand text-forest">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="font-display text-2xl font-medium text-forest">{s.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-stone">{s.short}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clay">
                {learnMore} <Arrow />
              </span>
            </div>
          </LLink>
        );
      })}
    </div>
  );
}

/* ---------- Testimonials ---------- */
export function Testimonials({ t }: { t: Dictionary }) {
  return (
    <section className="relative overflow-hidden bg-forest py-24 text-cream sm:py-32">
      <div className="grain absolute inset-0" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 h-[480px] w-[480px] rounded-full bg-moss/40 blur-3xl"
      />
      <Container className="relative">
        <SectionHeader
          light
          eyebrow={t.testimonialsSection.eyebrow}
          title={<Rich text={t.testimonialsSection.title} />}
          lead={t.testimonialsSection.lead}
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {t.testimonials.map((item, i) => (
            <figure
              key={item.name}
              className={`flex flex-col rounded-3xl border border-cream/10 bg-cream/[0.04] p-8 backdrop-blur-sm animate-fade-up delay-${i + 1}`}
            >
              <Quote className="h-8 w-8 text-sage/70" />
              <blockquote className="mt-5 flex-1 font-display text-xl leading-relaxed text-cream/95">
                {item.quote}
              </blockquote>
              <figcaption className="mt-8 border-t border-cream/10 pt-5">
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-sage">{item.detail}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Call to action ---------- */
export function CTA({
  t,
  title,
  text,
}: {
  t: Dictionary;
  title?: string;
  text?: string;
}) {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-clay px-8 py-16 text-cream sm:px-16 sm:py-20">
          <div className="grain absolute inset-0" aria-hidden />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cream/15 blur-2xl animate-float"
          />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <Eyebrow className="text-cream/80 [&>span]:bg-cream/80">{t.cta.eyebrow}</Eyebrow>
              <Heading className="text-cream">{title ?? t.cta.title}</Heading>
              <Lead className="mt-5 text-cream/85">{text ?? t.cta.text}</Lead>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Button href="/contact" variant="light" size="lg">
                {t.header.bookDiscovery} <Arrow />
              </Button>
              <Button href="/programs" variant="outline-light" size="lg">
                {t.common.compare}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
