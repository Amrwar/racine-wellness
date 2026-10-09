import Image, { getImageProps } from "next/image";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale, sectionHref } from "@/i18n/config";
import { site, images } from "@/lib/site";
import { Arrow, Button, Check, Container, Eyebrow, SectionHeader } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { Mail, MapPin, Phone, serviceIcons } from "@/components/icons";
import { AboutArt, ContactArt, ServicesArt } from "@/components/art";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      {/* ---------- Hero: Ziad at work on a grey studio wall; text on the plain wall ---------- */}
      {/* Phones/tablets: the photo on top, fading into the text below. Desktop: full-bleed. */}
      <section className="relative isolate -mt-18 overflow-hidden bg-[#1a1b1d] pt-18 text-white">
        <HeroImage alt={t.hero.imageAlt} />
        <div
          aria-hidden
          className="absolute inset-x-0 top-18 -z-10 h-[78vw] bg-gradient-to-b from-transparent from-40% to-[#1a1b1d] lg:bottom-0 lg:h-auto lg:bg-gradient-to-r lg:from-black/65 lg:from-0% lg:via-black/20 lg:to-transparent"
        />
        <Container className="flex flex-col pb-16 pt-[calc(78vw-3rem)] lg:min-h-[calc(100svh-4.5rem)] lg:max-h-[56rem] lg:justify-center lg:py-24">
          <div className="max-w-xl">
            <Eyebrow light className="animate-fade-up">
              {t.tagline}
            </Eyebrow>
            <h1 className="animate-fade-up delay-1 text-[2.6rem] font-medium leading-[1.08] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              {t.hero.title}
            </h1>
            <p className="animate-fade-up delay-2 mt-6 max-w-lg text-lg leading-relaxed text-white/80">
              {t.hero.lead}
            </p>
            <div className="animate-fade-up delay-3 mt-10 flex flex-wrap gap-3">
              <Button href={sectionHref(locale, "contact")} size="lg">
                {t.hero.book} <Arrow />
              </Button>
              <Button href={site.phoneHref} variant="outline-light" size="lg">
                <Phone className="h-5 w-5" /> {t.hero.call}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- Trust strip ---------- */}
      <section className="border-b border-mist/60 bg-surface">
        <Container>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 py-6 text-sm font-medium text-navy lg:grid-cols-4">
            {t.trust.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green/20 text-navy">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---------- Services ---------- */}
      <section id="services" className="relative isolate overflow-hidden py-20 sm:py-24">
        <ServicesArt />
        <Container>
          <SectionHeader eyebrow={t.services.eyebrow} title={t.services.title} lead={t.services.lead} />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.services.items.map((s) => {
              const Icon = serviceIcons[s.icon];
              return (
                <li
                  key={s.title}
                  className="rounded-2xl border border-mist/70 bg-white/80 p-7 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-card"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-green">
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-navy">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="relative isolate overflow-hidden bg-surface py-20 sm:py-24">
        <AboutArt />
        <Container className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-3xl shadow-card lg:max-w-none">
              <Image
                src={images.portrait}
                alt={t.about.portraitAlt}
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover object-top"
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeader eyebrow={t.about.eyebrow} title={t.about.title} />
            <p className="mt-2 text-sm font-semibold text-blue-dark">{t.credentialsLine}</p>
            <p className="mt-6 text-lg leading-relaxed text-muted">{t.about.text1}</p>
            <p className="mt-4 text-lg leading-relaxed text-muted">{t.about.text2}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {t.about.credentials.map((c) => (
                <li key={c} className="flex items-start gap-3 text-navy">
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

      {/* ---------- Contact ---------- */}
      <section id="contact" className="relative isolate overflow-hidden py-20 sm:py-24">
        <ContactArt />
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow={t.contact.eyebrow} title={t.contact.title} lead={t.contact.lead} />
            <ul className="mt-10 space-y-6">
              <Detail icon={Phone} label={t.contact.phone}>
                <a href={site.phoneHref} className="hover:text-blue-dark">
                  {site.phone}
                </a>
              </Detail>
              <Detail icon={Mail} label={t.contact.email}>
                <a href={`mailto:${site.email}`} className="hover:text-blue-dark">
                  {site.email}
                </a>
              </Detail>
              <Detail icon={MapPin} label={t.contact.area}>
                {site.address.city}, Québec
                <span className="block text-sm text-muted">{t.contact.areaNote}</span>
              </Detail>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-mist/70 bg-white/90 p-6 shadow-card backdrop-blur-sm sm:p-10">
              <h3 className="mb-6 text-xl font-semibold text-navy">{t.contact.formTitle}</h3>
              <ContactForm t={t.form} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/** Hero photo: the square shot for phones and tablets, the wide (extended wall) version on desktop. */
function HeroImage({ alt }: { alt: string }) {
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
        className="absolute inset-x-0 top-18 -z-10 h-[78vw] w-full object-cover object-top lg:bottom-0 lg:h-[calc(100%-4.5rem)] lg:object-right"
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
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy text-green">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-dark">{label}</p>
        <div className="mt-1 text-lg font-medium text-navy">{children}</div>
      </div>
    </li>
  );
}
