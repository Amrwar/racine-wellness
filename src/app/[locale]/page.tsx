import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, CalendarCheck, ChevronDown, Gift, Leaf, Quote, ShieldCheck } from "lucide-react";
import { isLocale, localePath } from "@/i18n/config";
import { images, site } from "@/lib/site";
import { getText, getContent } from "@/lib/content";
import { getBusiness } from "@/lib/business";
import { getDesign } from "@/lib/design";
import { columnsClass, heroSizeClass, normalizeSections, spacingClass, styleFor, type DesignSection, type SectionStyle } from "@/lib/design-data";
import { phoneHref } from "@/lib/business-data";
import { framingStyle, type Framing, type SitePhoto } from "@/lib/content-data";
import { Arrow, Button, Check, Container } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { ServicesExplorer } from "@/components/ServicesExplorer";
import { PostCard } from "@/components/blog";
import { getPosts } from "@/lib/posts";
import { getPricing } from "@/lib/pricing";
import { formatPrice } from "@/lib/pricing-data";
import { Mail, MapPin, Phone, Receipt } from "@/components/icons";

/** Icons for the hero's trust row, matched to Ziad's credentials in order. */
const trustIcons = [BadgeCheck, ShieldCheck, MapPin, Receipt];

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [t, content, business, design] = await Promise.all([getText(locale), getContent(), getBusiness(), getDesign()]);
  const tel = phoneHref(business.phone);
  const pricing = await getPricing();
  const latestPosts = (await getPosts()).slice(0, 3);
  const book = localePath(locale, "/book");
  const initials = site.owner
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  /** Home-page sections; Admin → Design sets their order, visibility, spacing and tint. */
  const st = (key: DesignSection) => styleFor(design, key);
  const sections: Record<string, React.ReactNode> = {
    services: (
      <section id="services" className={`relative isolate overflow-hidden bg-surface ${spacingClass[st("services").spacing]}`}>
        <UploadedBackground photo={content.backgrounds.services} framing={content.framing.services} />
        <Glow className="-right-24 -top-24 h-[34rem] w-[34rem] bg-blue/10" />
        <Tint style={st("services")} />
        <Container>
          <SplitHeader eyebrow={t.services.eyebrow} title={t.services.title} lead={t.services.lead} edit={{ title: "services.title", lead: "services.lead" }} />
          <ServicesExplorer
            items={content.services.items}
            locale={locale}
            bookHref={book}
            columns={design.layout.servicesColumns}
            t={{
              search: t.services.search,
              all: t.services.all,
              categories: t.services.categories,
              noMatch: t.services.noMatch,
              learnMore: t.services.learnMore,
              showLess: t.services.showLess,
              book: t.header.book,
            }}
          />
          {/* Not sure which service? → the contact form */}
          <div className="relative mt-10 overflow-hidden rounded-2xl bg-navy px-6 py-6 text-white shadow-lg sm:px-8">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-blue/25 blur-2xl" />
            <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-green ring-1 ring-white/15 sm:grid">
                  <Leaf aria-hidden className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xl font-semibold">{t.services.guideTitle}</p>
                  <p className="mt-1 text-white/80">{t.services.guideText}</p>
                </div>
              </div>
              <Link
                href="#contact"
                className="group inline-flex shrink-0 items-center gap-2 rounded-[var(--btn-radius,9999px)] bg-green px-6 py-3 font-semibold text-navy-deep transition hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                {t.services.guideButton} <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    ),
    pricing: (
      <section id="pricing" className={`relative isolate overflow-hidden bg-surface ${spacingClass[st("pricing").spacing]}`}>
        <Glow className="-left-32 bottom-0 h-[30rem] w-[30rem] bg-green/10" />
        <Tint style={st("pricing")} />
        <Container>
          {pricing.promo.enabled && pricing.promo[locale] && (
            <div className="relative mb-16 overflow-hidden rounded-2xl border-2 border-green/30 bg-navy p-6 text-white shadow-lg sm:p-8">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-green/10 blur-2xl" />
              <div className="relative flex flex-col items-center justify-between gap-6 lg:flex-row">
                <div className="flex items-center gap-4 text-center lg:text-left">
                  <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-xl bg-green text-navy sm:grid">
                    <Gift className="h-6 w-6" />
                  </span>
                  <p className="text-xl font-semibold">{pricing.promo[locale]}</p>
                </div>
                <Link
                  href={book}
                  className="shrink-0 rounded-[var(--btn-radius,9999px)] bg-green px-6 py-3 text-sm font-bold text-navy-deep transition hover:-translate-y-0.5 hover:brightness-95"
                >
                  {t.pricing.book}
                </Link>
              </div>
            </div>
          )}
          <CenterHeader eyebrow={t.pricing.eyebrow} title={t.pricing.title} lead={t.pricing.lead} edit={{ title: "pricing.title", lead: "pricing.lead" }} />
          <ul className={`mt-14 grid items-stretch gap-8 ${columnsClass.pricing[pricing.services.length > 2 ? design.layout.pricingColumns : 2]} ${pricing.services.length <= 2 ? "mx-auto max-w-5xl" : ""}`}>
            {pricing.services.map((item) => {
              const mins = item.rates.map((r) => r.minutes);
              const range = mins.length > 1 ? `${Math.min(...mins)}–${Math.max(...mins)} min` : `${mins[0]} min`;
              return (
                <li key={item.id} className="flex flex-col justify-between rounded-2xl border border-navy/10 bg-white p-8 shadow-sm transition-shadow hover:shadow-lg sm:p-10">
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <h3 className="text-2xl font-semibold text-navy">{item.title[locale]}</h3>
                      <span className="mt-1 shrink-0 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white">{range}</span>
                    </div>
                    <p className="mb-8 leading-relaxed text-muted">{item.text[locale]}</p>
                    <dl className="mb-8 space-y-3">
                      {item.rates.map((r) => (
                        <div key={r.minutes} className="flex items-baseline justify-between rounded-xl bg-surface px-5 py-4">
                          <dt className="flex items-center gap-2.5 font-medium text-ink">
                            <Check className="h-4 w-4 text-blue-dark" />
                            {t.pricing.duration.replace("{n}", String(r.minutes))}
                          </dt>
                          <dd className="text-3xl font-bold tracking-tight text-navy">{formatPrice(r.price, locale)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <Link
                    href={book}
                    className="w-full rounded-[var(--btn-radius,9999px)] bg-navy py-3.5 text-center text-sm font-bold text-white shadow-md transition hover:bg-navy-deep hover:shadow-lg"
                  >
                    {t.pricing.book}
                  </Link>
                </li>
              );
            })}
          </ul>
          {pricing.homeVisits[locale] && (
            <p className="mx-auto mt-10 flex max-w-3xl items-start justify-center gap-3 text-center text-lg font-medium text-ink">
              <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-blue-dark" />
              {pricing.homeVisits[locale]}
            </p>
          )}
        </Container>
      </section>
    ),
    about: (
      <section id="about" className={`relative isolate overflow-hidden border-y border-navy/5 bg-white ${spacingClass[st("about").spacing]}`}>
        <UploadedBackground photo={content.backgrounds.about} framing={content.framing.about} />
        <Tint style={st("about")} />
        <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className={`lg:col-span-5 ${design.layout.aboutPhoto === "right" ? "lg:order-last" : ""}`}>
            <div className="relative mx-auto max-w-md rounded-2xl border border-navy/10 bg-white p-3 shadow-2xl shadow-navy/15 lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src={content.about.photo?.src ?? images.portrait}
                  alt={t.about.portraitAlt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover object-top"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-transparent to-transparent" />
                <div className="absolute inset-x-6 bottom-6 text-white">
                  <p className="text-xl font-semibold">{site.owner}</p>
                  <p className="text-sm text-white/80">{t.credentialsLine}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <DotEyebrow>{t.about.eyebrow}</DotEyebrow>
            <h2 data-edit="about.title" className="mb-6 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
              {t.about.title}
            </h2>
            <blockquote
              data-edit="about.text1"
              className="mb-6 rounded-xl border-l-4 border-green bg-surface p-6 text-lg italic leading-relaxed text-navy shadow-sm"
            >
              {t.about.text1}
            </blockquote>
            <p data-edit="about.text2" className="mb-8 text-lg leading-relaxed text-muted">
              {t.about.text2}
            </p>
            <ul className="grid gap-4 pt-2 sm:grid-cols-2">
              {t.about.credentials.map((c) => (
                <li key={c} className="flex items-start gap-3 rounded-xl border border-navy/5 bg-surface p-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-green">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-navy">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    ),
    blog: (
      <section id="latest" className={`relative isolate overflow-hidden border-t border-navy/5 bg-surface ${spacingClass[st("blog").spacing]}`}>
        <UploadedBackground photo={content.backgrounds.blog} framing={content.framing.blog} />
        <Tint style={st("blog")} />
        <Container>
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <DotEyebrow>{t.blog.latestEyebrow}</DotEyebrow>
              <h2 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t.blog.latestTitle}</h2>
            </div>
            <Link
              href={localePath(locale, "/blog")}
              className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-navy hover:text-blue-dark"
            >
              {t.blog.viewAll} <Arrow />
            </Link>
          </div>
          <ul className={`grid gap-8 ${columnsClass.blog[design.layout.blogColumns]}`}>
            {latestPosts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} locale={locale} t={t.blog} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    ),
    contact: (
      <section id="contact" className={`relative isolate overflow-hidden bg-white ${spacingClass[st("contact").spacing]}`}>
        <UploadedBackground photo={content.backgrounds.contact} framing={content.framing.contact} />
        <Tint style={st("contact")} />
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-navy p-8 text-white shadow-2xl shadow-navy/30 sm:p-12 lg:p-16">
            <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-green/15 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-blue/20 blur-3xl" />
            <div className="relative grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
                  {t.contact.eyebrow}
                </span>
                <h2 data-edit="contact.title" className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  {t.contact.title}
                </h2>
                <p data-edit="contact.lead" className="mt-4 text-lg leading-relaxed text-white/80">
                  {t.contact.lead}
                </p>
                <ul className="mt-10 space-y-6">
                  <Detail icon={Phone} label={t.contact.phone}>
                    <a href={tel} className="hover:text-green">
                      {business.phone}
                    </a>
                  </Detail>
                  <Detail icon={Mail} label={t.contact.email}>
                    <a href={`mailto:${business.email}`} className="break-all hover:text-green">
                      {business.email}
                    </a>
                  </Detail>
                  <Detail icon={MapPin} label={t.contact.area}>
                    {t.contact.office}
                    <span className="block text-sm text-white/65">{t.contact.areaNote}</span>
                  </Detail>
                </ul>
              </div>
              <div className={`lg:col-span-7 ${design.layout.contactForm === "left" ? "lg:order-first" : ""}`}>
                <div className="rounded-2xl bg-white p-6 text-ink shadow-2xl shadow-black/20 sm:p-10">
                  <h3 className="mb-6 text-xl font-semibold text-navy">{t.contact.formTitle}</h3>
                  <ContactForm t={t.form} fields={design.forms} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    ),
    testimonials: content.testimonials.items.length > 0 && (
      <section id="testimonials" className={`relative isolate overflow-hidden border-t border-navy/5 bg-surface ${spacingClass[st("testimonials").spacing]}`}>
        <Tint style={st("testimonials")} />
        <Container>
          <h2 data-edit="testimonials.title" className="mb-14 max-w-2xl text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            {content.testimonials.title[locale]}
          </h2>
          <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {content.testimonials.items.map((q, i) => (
              <li key={i} className="flex flex-col justify-between rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
                <div>
                  <Quote aria-hidden className="mb-4 h-7 w-7 text-blue" />
                  <blockquote data-edit={`testimonials.items.${i}.quote`} className="mb-6 italic leading-relaxed text-navy">
                    {q.quote[locale]}
                  </blockquote>
                </div>
                <div className="border-t border-navy/10 pt-4">
                  <p className="text-sm font-bold text-navy">{q.name}</p>
                  {q.detail[locale] && <p className="text-xs text-muted">{q.detail[locale]}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    ),
    faq: content.faq.items.length > 0 && (
      <section id="faq" className={`relative isolate overflow-hidden bg-white ${spacingClass[st("faq").spacing]}`}>
        <Tint style={st("faq")} />
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 data-edit="faq.title" className="mb-14 text-center text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
              {content.faq.title[locale]}
            </h2>
            <div className="space-y-4">
              {content.faq.items.map((f, i) => (
                <details key={i} open={i === 0} className="group rounded-2xl border border-navy/10 bg-white p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy">
                    {f.q[locale]}
                    <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-blue-dark transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-muted">{f.a[locale]}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>
    ),
    ...Object.fromEntries(
      content.blocks.map((b) => [
        b.id,
        <section key={b.id} id={b.id} className={`relative isolate overflow-hidden bg-white ${spacingClass[st(b.id as DesignSection).spacing]}`}>
          <Tint style={st(b.id as DesignSection)} />
          <Container className={b.photo ? "grid items-center gap-12 lg:grid-cols-2" : "[&>div]:max-w-3xl"}>
            {b.photo && (
              <div className={`rounded-2xl border border-navy/10 bg-white p-3 shadow-xl shadow-navy/10 ${b.photoSide === "right" ? "lg:order-last" : ""}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image src={b.photo.src} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                </div>
              </div>
            )}
            <div>
              {b.eyebrow[locale] && <DotEyebrow>{b.eyebrow[locale]}</DotEyebrow>}
              <h2 data-edit={`blocks.${content.blocks.indexOf(b)}.title`} className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
                {b.title[locale]}
              </h2>
              {b.text[locale]
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className="mt-4 whitespace-pre-line text-lg leading-relaxed text-muted">
                    {para}
                  </p>
                ))}
            </div>
          </Container>
        </section>,
      ]),
    ),
  };

  const centered = design.hero.align === "center";

  return (
    <>
      {/* ---------- Utility bar ---------- */}
      <div className="border-b border-navy/5 bg-surface px-5 py-2.5 text-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span aria-hidden className="h-2 w-2 rounded-full bg-green ring-4 ring-green/20" />
            <span className="text-xs font-bold uppercase tracking-wider text-navy">{t.hero.eyebrow}</span>
            <span aria-hidden className="hidden text-muted sm:inline">•</span>
            <span className="text-muted">
              {t.contact.phone}:{" "}
              <a href={tel} className="font-semibold text-navy hover:underline">
                {business.phone}
              </a>
            </span>
          </div>
          <span className="hidden items-center gap-1.5 text-xs font-semibold text-navy md:inline-flex">
            <BadgeCheck aria-hidden className="h-4 w-4 text-blue-dark" />
            {t.credentialsLine}
          </span>
        </div>
      </div>

      {/* ---------- Hero: Ziad at work, full-bleed behind the text ---------- */}
      {/* Phones/tablets: the photo on top, fading into the text below. Desktop: full-bleed. */}
      <section className="relative isolate overflow-hidden bg-[#1a1b1d] text-white">
        <HeroImage alt={t.hero.imageAlt} photo={content.hero.photo} />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[78vw] bg-gradient-to-b from-transparent from-40% to-[#1a1b1d] lg:bottom-0 lg:h-auto lg:bg-gradient-to-r lg:from-black/70 lg:from-0% lg:via-black/25 lg:to-transparent"
        />
        {/* Extra shading over the photo, set in Admin → Design */}
        {design.hero.shade > 0 && <div aria-hidden className="absolute inset-0 -z-10 bg-black" style={{ opacity: design.hero.shade / 100 }} />}
        <Glow className="-bottom-24 -left-24 h-[26rem] w-[26rem] bg-blue/20" />
        <Container className="relative flex flex-col pb-16 pt-[calc(78vw-3rem)] lg:min-h-[calc(100svh-7rem)] lg:max-h-[56rem] lg:justify-center lg:py-24">
          <div className={centered ? "mx-auto flex max-w-2xl flex-col items-center text-center" : "flex max-w-xl flex-col items-start"}>
            <span className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-green" />
              {t.tagline}
            </span>
            <h1 data-edit="hero.title" className={`animate-fade-up delay-1 font-semibold leading-[1.08] tracking-[-0.03em] ${heroSizeClass[design.hero.size]}`}>
              {t.hero.title}
            </h1>
            <p data-edit="hero.lead" className="animate-fade-up delay-2 mt-6 max-w-lg text-lg leading-relaxed text-white/85">
              {t.hero.lead}
            </p>
            <div className={`animate-fade-up delay-3 mt-9 flex w-full flex-col gap-4 sm:w-auto sm:flex-row ${centered ? "justify-center" : ""}`}>
              <Button href={book} size="lg">
                {t.hero.book} <ArrowRight aria-hidden className="h-[18px] w-[18px] text-green transition-transform group-hover:translate-x-1" />
              </Button>
              <Button href={tel} variant="outline-light" size="lg">
                <Phone className="h-5 w-5" /> {t.hero.call}
              </Button>
            </div>
            {/* Trust highlights */}
            <ul className="animate-fade-up delay-3 mt-10 grid w-full grid-cols-1 gap-3 border-t border-white/15 pt-6 sm:grid-cols-2">
              {t.about.credentials.map((c, i) => {
                const Icon = trustIcons[i % trustIcons.length];
                return (
                  <li key={c} className={`flex items-center gap-2 text-sm font-medium text-white/90 ${centered ? "justify-center" : ""}`}>
                    <Icon aria-hidden className="h-5 w-5 shrink-0 text-green" />
                    {c}
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
        {/* Floating practitioner card (desktop) */}
        <div className="absolute bottom-8 right-8 hidden rounded-xl border border-white/40 bg-white/90 p-4 text-navy shadow-xl backdrop-blur-md xl:block">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-navy text-sm font-bold text-green">{initials}</span>
            <div>
              <p className="text-sm font-bold">{site.owner}</p>
              <p className="text-xs text-muted">{t.credentialsLine}</p>
            </div>
            <CalendarCheck aria-hidden className="ml-3 h-5 w-5 text-blue-dark" />
          </div>
        </div>
      </section>

      {normalizeSections(
        design,
        content.blocks.map((b) => b.id),
      )
        .filter((s) => s.visible)
        .map((s) => (
          <div key={s.key} data-section={s.key}>{sections[s.key]}</div>
        ))}
    </>
  );
}

/** Small uppercase label with a dot, above a section heading. */
function DotEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-dark">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-navy" />
      {children}
    </p>
  );
}

/** Heading on the left, lead on the right (stacks on phones). */
function SplitHeader({ eyebrow, title, lead, edit }: { eyebrow: string; title: string; lead: string; edit: { title: string; lead: string } }) {
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <DotEyebrow>{eyebrow}</DotEyebrow>
        <h2 data-edit={edit.title} className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          {title}
        </h2>
      </div>
      <p data-edit={edit.lead} className="max-w-md text-lg leading-relaxed text-muted">
        {lead}
      </p>
    </div>
  );
}

function CenterHeader({ eyebrow, title, lead, edit }: { eyebrow: string; title: string; lead: string; edit: { title: string; lead: string } }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-dark">{eyebrow}</p>
      <h2 data-edit={edit.title} className="mb-4 mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        {title}
      </h2>
      <p data-edit={edit.lead} className="text-lg leading-relaxed text-muted">
        {lead}
      </p>
    </div>
  );
}

/** Soft blurred colour glow in the background of a section. */
function Glow({ className }: { className: string }) {
  return <div aria-hidden className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${className}`} />;
}

/** Colour wash over a section, set per section in Admin → Design (strength 0 = none). */
function Tint({ style }: { style: SectionStyle }) {
  if (!style.strength) return null;
  return <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: style.overlay, opacity: style.strength / 100 }} />;
}

/** A background photo uploaded in Admin → Website, softened so the dark text stays readable. */
function UploadedBackground({ photo, framing }: { photo: SitePhoto | null; framing: Framing }) {
  if (!photo) return null;
  return (
    <>
      <Image src={photo.src} alt="" fill sizes="100vw" className="-z-20 object-cover" style={framingStyle(framing)} />
      <div aria-hidden className="absolute inset-0 -z-10 bg-white/85" />
    </>
  );
}

/** Hero photo: the square shot for phones and tablets, the wide (extended wall) version on desktop. */
function HeroImage({ alt, photo }: { alt: string; photo: SitePhoto | null }) {
  const cls = "absolute inset-x-0 top-0 -z-10 h-[78vw] w-full object-cover object-top lg:bottom-0 lg:h-full lg:object-right";
  // A photo uploaded from the admin is used for every screen size.
  if (photo) return <Image src={photo.src} width={photo.width} height={photo.height} alt={alt} sizes="100vw" priority className={cls} />;
  const common = { alt, sizes: "100vw", loading: "eager", fetchPriority: "high" } as const;
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, ...images.hero.wide });
  const {
    props: { srcSet: square, ...rest },
  } = getImageProps({ ...common, ...images.hero.square });
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={wide} />
      <img {...rest} alt={alt} srcSet={square} className={cls} />
    </picture>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-green ring-1 ring-white/15">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green">{label}</p>
        <div className="mt-1 text-lg font-medium text-white">{children}</div>
      </div>
    </li>
  );
}
