import { Fragment } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { images } from "@/lib/site";
import { getText, getContent } from "@/lib/content";
import { getBusiness } from "@/lib/business";
import { getDesign } from "@/lib/design";
import { columnsClass, heroSizeClass, spacingClass, type DesignSection, type SectionStyle } from "@/lib/design-data";
import { phoneHref } from "@/lib/business-data";
import { framingStyle, type Framing, type SitePhoto } from "@/lib/content-data";
import { Arrow, Button, Check, Container, Eyebrow, SectionHeader } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { PostCard } from "@/components/blog";
import { getPosts } from "@/lib/posts";
import { getPricing } from "@/lib/pricing";
import { formatPrice } from "@/lib/pricing-data";
import { Mail, MapPin, Phone, ServiceIconView } from "@/components/icons";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [t, content, business, design] = await Promise.all([getText(locale), getContent(), getBusiness(), getDesign()]);
  const tel = phoneHref(business.phone);
  const pricing = await getPricing();
  const latestPosts = (await getPosts()).slice(0, 3);

  /** Home-page sections; Admin → Design sets their order, visibility, spacing and tint. */
  const sections: Record<DesignSection, React.ReactNode> = {
    services: (
        <section id="services" className={`relative isolate overflow-hidden bg-white ${spacingClass[design.style.services.spacing]}`}>
          <SectionPhoto src={content.backgrounds.services?.src ?? images.sections.services} framing={content.framing.services} />
          {/* White fade at the top only, behind the heading; the photo shows untouched below */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-white from-30% via-white/70 to-transparent sm:h-[26rem]"
          />
          <Tint style={design.style.services} />
          <Container>
            <SectionHeader eyebrow={t.services.eyebrow} title={t.services.title} lead={t.services.lead} />
            <ul className={`mt-12 grid gap-5 ${columnsClass.services[design.layout.servicesColumns]}`}>
              {content.services.items.map((s, i) => {
                return (
                  <li
                    key={i}
                    className="rounded-2xl bg-white p-7 shadow-xl shadow-ink/10 ring-1 ring-mist/70 transition hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-green">
                      <ServiceIconView icon={s.icon} image={s.image} />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-navy">{s.title[locale]}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{s.text[locale]}</p>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
    ),
    pricing: (
        <section id="pricing" className={`relative isolate bg-surface ${spacingClass[design.style.pricing.spacing]}`}>
          <Tint style={design.style.pricing} />
          <Container>
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
              <SectionHeader eyebrow={t.pricing.eyebrow} title={t.pricing.title} lead={t.pricing.lead} />
              {pricing.promo.enabled && pricing.promo[locale] && (
                <p className="inline-flex shrink-0 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-green" />
                  {pricing.promo[locale]}
                </p>
              )}
            </div>
            <ul className={`mt-12 grid gap-5 ${columnsClass.pricing[pricing.services.length > 2 ? design.layout.pricingColumns : 2]}`}>
              {pricing.services.map((item) => (
                <li key={item.id} className="flex flex-col rounded-2xl bg-white p-7 shadow-card ring-1 ring-mist/70 sm:p-8">
                  <h3 className="text-xl font-semibold text-navy">{item.title[locale]}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{item.text[locale]}</p>
                  <dl className="mt-auto divide-y divide-mist/70 pt-6">
                    {item.rates.map((r) => (
                      <div key={r.minutes} className="flex items-baseline justify-between py-3.5">
                        <dt className="font-medium text-ink">{t.pricing.duration.replace("{n}", String(r.minutes))}</dt>
                        <dd className="text-2xl font-semibold tracking-tight text-navy">
                          {formatPrice(r.price, locale)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              {pricing.homeVisits[locale] ? (
                <p className="flex items-start gap-3 text-lg font-medium leading-snug text-ink sm:text-xl">
                  <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-blue-dark" />
                  {pricing.homeVisits[locale]}
                </p>
              ) : (
                <span />
              )}
              <Button href={localePath(locale, "/book")} className="shrink-0">
                {t.pricing.book} <Arrow />
              </Button>
            </div>
          </Container>
        </section>
    ),
    about: (
        <section id="about" className={`relative isolate overflow-hidden bg-ink ${spacingClass[design.style.about.spacing]}`}>
          <SectionPhoto src={content.backgrounds.about?.src ?? images.sections.about} framing={content.framing.about} />
          {/* An uploaded photo isn't pre-toned like the built-in one: darken it so the white text stays readable. */}
          {content.backgrounds.about && <div aria-hidden className="absolute inset-0 -z-10 bg-ink/45" />}
          <Tint style={design.style.about} />
          <Container className="grid items-center gap-12 lg:grid-cols-12">
            <div className={`lg:col-span-5 ${design.layout.aboutPhoto === "right" ? "lg:order-last" : ""}`}>
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-black/25 ring-4 ring-white">
                  <Image
                    src={content.about.photo?.src ?? images.portrait}
                    alt={t.about.portraitAlt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 [text-shadow:0_1px_10px_rgba(0,30,50,0.55)]">
              <SectionHeader light eyebrow={t.about.eyebrow} title={t.about.title} />
              <p className="mt-2 text-sm font-semibold text-white">{t.credentialsLine}</p>
              <p className="mt-6 text-lg leading-relaxed text-white/90">{t.about.text1}</p>
              <p className="mt-4 text-lg leading-relaxed text-white/90">{t.about.text2}</p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {t.about.credentials.map((c) => (
                  <li key={c} className="flex items-start gap-3 font-medium text-white">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy text-green">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
    ),
    blog: (
        <section id="latest" className={`relative isolate overflow-hidden bg-ink ${spacingClass[design.style.blog.spacing]}`}>
          <SectionPhoto src={content.backgrounds.blog?.src ?? images.sections.blog} framing={content.framing.blog} />
          {/* Lighten an uploaded photo so the dark heading stays readable. */}
          {content.backgrounds.blog && <div aria-hidden className="absolute inset-0 -z-10 bg-white/60" />}
          <Tint style={design.style.blog} />
          <Container>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeader eyebrow={t.blog.latestEyebrow} title={t.blog.latestTitle} />
              <Link
                href={localePath(locale, "/blog")}
                className="group inline-flex shrink-0 items-center gap-2 font-semibold text-navy hover:text-blue-dark"
              >
                {t.blog.viewAll} <Arrow />
              </Link>
            </div>
            <ul className={`mt-12 grid gap-7 ${columnsClass.blog[design.layout.blogColumns]}`}>
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
        <section id="contact" className={`relative isolate overflow-hidden bg-ink ${spacingClass[design.style.contact.spacing]}`}>
          <SectionPhoto src={content.backgrounds.contact?.src ?? images.sections.contact} framing={content.framing.contact} />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 via-ink/85 to-ink/70" />
          <Tint style={design.style.contact} />
          <Container className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeader light eyebrow={t.contact.eyebrow} title={t.contact.title} lead={t.contact.lead} />
              <ul className="mt-10 space-y-6">
                <Detail icon={Phone} label={t.contact.phone}>
                  <a href={tel} className="hover:text-green">
                    {business.phone}
                  </a>
                </Detail>
                <Detail icon={Mail} label={t.contact.email}>
                  <a href={`mailto:${business.email}`} className="hover:text-green">
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
              <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-black/30 sm:p-10">
                <h3 className="mb-6 text-xl font-semibold text-navy">{t.contact.formTitle}</h3>
                <ContactForm t={t.form} fields={design.forms} />
              </div>
            </div>
          </Container>
        </section>
    ),
  };

  return (
    <>
      {/* ---------- Hero: Ziad at work on a grey studio wall; text on the plain wall ---------- */}
      {/* Phones/tablets: the photo on top, fading into the text below. Desktop: full-bleed. */}
      <section className="relative isolate -mt-18 overflow-hidden bg-[#1a1b1d] pt-18 text-white">
        <HeroImage alt={t.hero.imageAlt} photo={content.hero.photo} />
        <div
          aria-hidden
          className="absolute inset-x-0 top-18 -z-10 h-[78vw] bg-gradient-to-b from-transparent from-40% to-[#1a1b1d] lg:bottom-0 lg:h-auto lg:bg-gradient-to-r lg:from-black/65 lg:from-0% lg:via-black/20 lg:to-transparent"
        />
        <Container className="flex flex-col pb-16 pt-[calc(78vw-3rem)] lg:min-h-[calc(100svh-4.5rem)] lg:max-h-[56rem] lg:justify-center lg:py-24">
          <div className="max-w-xl">
            <Eyebrow light className="animate-fade-up">
              {t.tagline}
            </Eyebrow>
            <h1 className={`animate-fade-up delay-1 font-medium leading-[1.08] tracking-[-0.03em] ${heroSizeClass[design.hero.size]}`}>
              {t.hero.title}
            </h1>
            <p className="animate-fade-up delay-2 mt-6 max-w-lg text-lg leading-relaxed text-white/80">
              {t.hero.lead}
            </p>
            <div className="animate-fade-up delay-3 mt-10 flex flex-wrap gap-3">
              <Button href={localePath(locale, "/book")} size="lg">
                {t.hero.book} <Arrow />
              </Button>
              <Button href={tel} variant="outline-light" size="lg">
                <Phone className="h-5 w-5" /> {t.hero.call}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {design.sections
        .filter((s) => s.visible)
        .map((s) => (
          <Fragment key={s.key}>{sections[s.key]}</Fragment>
        ))}
    </>
  );
}

/** Colour wash over a section, set per section in Admin → Design (strength 0 = none). */
function Tint({ style }: { style: SectionStyle }) {
  if (!style.strength) return null;
  return <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: style.overlay, opacity: style.strength / 100 }} />;
}

/** Full-bleed real photo behind a section; the section adds its own colour overlay on top. */
function SectionPhoto({ src, framing }: { src: string; framing: Framing }) {
  // Zoom and focus point are set per section in Admin → Website.
  return <Image src={src} alt="" fill sizes="100vw" className="-z-20 object-cover" style={framingStyle(framing)} />;
}

/** Hero photo: the square shot for phones and tablets, the wide (extended wall) version on desktop. */
function HeroImage({ alt, photo }: { alt: string; photo: SitePhoto | null }) {
  const cls =
    "absolute inset-x-0 top-18 -z-10 h-[78vw] w-full object-cover object-top lg:bottom-0 lg:h-[calc(100%-4.5rem)] lg:object-right";
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
      <img
        {...rest}
        alt={alt}
        srcSet={square}
        className={cls}
      />
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">{label}</p>
        <div className="mt-1 text-lg font-medium text-white">{children}</div>
      </div>
    </li>
  );
}
