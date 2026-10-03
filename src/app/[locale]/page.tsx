import Image from "next/image";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { LLink } from "@/i18n/LocaleProvider";
import { getVideos } from "@/lib/videos";
import { site, images } from "@/lib/site";
import { Arrow, Button, Container, Eyebrow, Heading, Lead, Rich, SectionHeader } from "@/components/ui";
import { CTA, FAQList, ServicesGrid, Testimonials } from "@/components/sections";
import { VideoCard } from "@/components/video";
import { notFound } from "next/navigation";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const latest = getVideos(locale).slice(0, 3);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-forest-deep text-cream">
        <Image
          src={images.hero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_0%] opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/70 via-forest-deep/40 to-forest-deep" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/80 via-transparent to-transparent" />
        <div className="grain absolute inset-0" aria-hidden />

        <Container className="relative flex min-h-[100svh] flex-col justify-end pb-16 pt-40 sm:pb-24">
          <div className="max-w-4xl">
            <Eyebrow light className="animate-fade-up">
              {t.home.heroEyebrow}
            </Eyebrow>
            <Heading as="h1" light className="animate-fade-up delay-1">
              <Rich text={t.home.heroTitle} />
            </Heading>
            <Lead light className="mt-8 max-w-2xl animate-fade-up delay-2">
              {t.home.heroLead}
            </Lead>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-up delay-3">
              <Button href="/contact" variant="light" size="lg">
                {t.header.bookDiscovery} <Arrow />
              </Button>
              <Button href="/services" variant="outline-light" size="lg">
                {t.common.explore}
              </Button>
            </div>
          </div>

          <dl className="mt-20 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-cream/15 pt-10 sm:grid-cols-4 animate-fade-up delay-4">
            {t.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-sage">{s.label}</dt>
                <dd className="font-display text-4xl font-medium text-cream sm:text-5xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ---------- Intro / philosophy ---------- */}
      <section id="approach" className="scroll-mt-20 py-24 sm:py-32">
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-12">
            <div className="relative lg:col-span-5">
              <div className="relative aspect-square overflow-hidden rounded-[2.5rem] shadow-soft">
                <Image
                  src={images.intro}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-4 max-w-[260px] rounded-3xl bg-forest p-6 text-cream shadow-soft sm:-left-10">
                <p className="font-display text-lg leading-snug">{t.home.quote}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-sage">{site.owner}</p>
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <Eyebrow>{t.home.introEyebrow}</Eyebrow>
              <Heading>
                <Rich text={t.home.introTitle} />
              </Heading>
              <Lead className="mt-6">{t.home.introLead}</Lead>
              <p className="mt-5 leading-relaxed text-stone">{t.home.introText}</p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {t.home.introPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-forest">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-clay" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button href="/about" variant="ghost">
                  {t.home.meet} <Arrow />
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- Services ---------- */}
      <section id="services" className="scroll-mt-20 bg-sand/50 py-24 sm:py-32">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow={t.home.servicesEyebrow}
              title={<Rich text={t.home.servicesTitle} />}
              lead={t.home.servicesLead}
            />
            <Button href="/services" variant="ghost" className="shrink-0">
              {t.common.allServices} <Arrow />
            </Button>
          </div>
          <div className="mt-16">
            <ServicesGrid services={t.services} learnMore={t.common.learnMore} />
          </div>
        </Container>
      </section>

      {/* ---------- Process ---------- */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeader eyebrow={t.home.processEyebrow} align="center" title={t.home.processTitle} />
          <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-sand-dark/60 sm:grid-cols-2 lg:grid-cols-4">
            {t.process.map((p, i) => (
              <li
                key={p.step}
                className={`relative bg-cream p-8 transition hover:bg-white animate-fade-up delay-${i + 1}`}
              >
                <span className="font-display text-5xl font-light text-sand-dark">{p.step}</span>
                <h3 className="mt-6 font-display text-2xl font-medium text-forest">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-stone">{p.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Testimonials t={t} />

      {/* ---------- Latest videos ---------- */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow={t.home.videosEyebrow}
              title={t.home.videosTitle}
              lead={t.home.videosLead}
            />
            <Button href="/videos" variant="ghost" className="shrink-0">
              {t.common.watchAll} <Arrow />
            </Button>
          </div>
          <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((v, i) => (
              <VideoCard key={v.slug} video={v} index={i} />
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- FAQ teaser ---------- */}
      <section className="bg-sand/50 py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeader eyebrow={t.home.faqEyebrow} title={t.home.faqTitle} lead={t.home.faqLead} />
              <LLink
                href="/faq"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-clay"
              >
                {t.common.seeAll} <Arrow />
              </LLink>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FAQList items={t.faqs.slice(0, 4)} />
            </div>
          </div>
        </Container>
      </section>

      <CTA t={t} />
    </>
  );
}
