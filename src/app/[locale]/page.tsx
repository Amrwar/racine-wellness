import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale, localePath, sectionHref } from "@/i18n/config";
import { site, images } from "@/lib/site";
import { Arrow, Button, Check, Container, Eyebrow, SectionBreak, SectionHeader } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { PostCard } from "@/components/blog";
import { getPosts } from "@/lib/blog";
import { Mail, MapPin, Phone, serviceIcons } from "@/components/icons";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      {/* ---------- Hero: black-and-white trees, darkened on the text side ---------- */}
      <section className="relative isolate -mt-18 overflow-hidden bg-black pt-18 text-white">
        <Image src={images.hero} alt="" fill priority sizes="100vw" className="-z-20 object-cover object-center" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/75 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/55 lg:to-black/30"
        />
        <Container className="flex flex-col py-24 sm:py-32 lg:min-h-[calc(100svh-4.5rem)] lg:max-h-[56rem] lg:justify-center lg:py-24">
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
      <SectionBreak items={t.trust} />

      {/* ---------- Services ---------- */}
      <section id="services" className="relative isolate overflow-hidden bg-ink py-20 sm:py-28">
        <SectionPhoto src={images.sections.services} className="object-[50%_40%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/80 via-ink/55 to-ink/85" />
        <Container>
          <SectionHeader light eyebrow={t.services.eyebrow} title={t.services.title} lead={t.services.lead} />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.services.items.map((s) => {
              const Icon = serviceIcons[s.icon];
              return (
                <li
                  key={s.title}
                  className="rounded-2xl bg-white p-7 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl"
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

      <SectionBreak items={t.breaks.about} />

      {/* ---------- About ---------- */}
      <section id="about" className="relative isolate overflow-hidden bg-ink py-20 sm:py-28">
        <SectionPhoto src={images.sections.about} className="object-[50%_60%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 via-ink/85 to-ink/70" />
        <Container className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/15">
                <Image
                  src={images.portrait}
                  alt={t.about.portraitAlt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeader light eyebrow={t.about.eyebrow} title={t.about.title} />
            <p className="mt-2 text-sm font-semibold text-blue">{t.credentialsLine}</p>
            <p className="mt-6 text-lg leading-relaxed text-white/80">{t.about.text1}</p>
            <p className="mt-4 text-lg leading-relaxed text-white/80">{t.about.text2}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {t.about.credentials.map((c) => (
                <li key={c} className="flex items-start gap-3 text-white">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-green ring-1 ring-white/15">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <SectionBreak items={t.breaks.blog} />

      {/* ---------- Latest from the blog ---------- */}
      <section className="relative isolate overflow-hidden bg-ink py-20 sm:py-28">
        <SectionPhoto src={images.sections.blog} className="object-[50%_60%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/65 to-ink/85" />
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeader light eyebrow={t.blog.latestEyebrow} title={t.blog.latestTitle} />
            <Link
              href={localePath(locale, "/blog")}
              className="group inline-flex shrink-0 items-center gap-2 font-semibold text-green hover:text-white"
            >
              {t.blog.viewAll} <Arrow />
            </Link>
          </div>
          <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {getPosts()
              .slice(0, 3)
              .map((post) => (
                <li key={post.slug}>
                  <PostCard post={post} locale={locale} t={t.blog} />
                </li>
              ))}
          </ul>
        </Container>
      </section>

      <SectionBreak items={t.breaks.contact} />

      {/* ---------- Contact ---------- */}
      <section id="contact" className="relative isolate overflow-hidden bg-ink py-20 sm:py-28">
        <SectionPhoto src={images.sections.contact} className="object-[30%_50%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 via-ink/85 to-ink/70" />
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader light eyebrow={t.contact.eyebrow} title={t.contact.title} lead={t.contact.lead} />
            <ul className="mt-10 space-y-6">
              <Detail icon={Phone} label={t.contact.phone}>
                <a href={site.phoneHref} className="hover:text-green">
                  {site.phone}
                </a>
              </Detail>
              <Detail icon={Mail} label={t.contact.email}>
                <a href={`mailto:${site.email}`} className="hover:text-green">
                  {site.email}
                </a>
              </Detail>
              <Detail icon={MapPin} label={t.contact.area}>
                {t.contact.office}
                <span className="block text-sm text-white/65">{t.contact.areaNote}</span>
              </Detail>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-black/30 sm:p-10">
              <h3 className="mb-6 text-xl font-semibold text-navy">{t.contact.formTitle}</h3>
              <ContactForm t={t.form} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/** Full-bleed real photo behind a section; the section adds its own colour overlay on top. */
function SectionPhoto({ src, className = "" }: { src: string; className?: string }) {
  return <Image src={src} alt="" fill sizes="100vw" className={`-z-20 object-cover ${className}`} />;
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
