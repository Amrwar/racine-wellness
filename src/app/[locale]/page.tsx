import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Clock, Gift, MapPin as MapPinIcon, Quote, ShieldCheck, Star } from "lucide-react";
import { isLocale, localePath, sectionHref } from "@/i18n/config";
import { images, site } from "@/lib/site";
import { getText, getContent } from "@/lib/content";
import { getBusiness } from "@/lib/business";
import { getDesign } from "@/lib/design";
import { columnsClass, heroSizeClass, normalizeSections, spacingClass, styleFor, type DesignSection, type SectionStyle } from "@/lib/design-data";
import { phoneHref } from "@/lib/business-data";
import { framingStyle, type Framing, type SitePhoto } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import { Button, Check, Container, Eyebrow } from "@/components/ui/site";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ContactForm } from "@/components/ContactForm";
import { ServiceCard } from "@/components/ServicesExplorer";
import { ServiceGuide, serviceLabels, serviceLinks } from "@/components/ServicesShared";
import { PostCard } from "@/components/blog";
import { getPosts } from "@/lib/posts";
import { getPricing } from "@/lib/pricing";
import { formatPrice } from "@/lib/pricing-data";
import { Mail, MapPin, Phone } from "@/components/icons";

/** Icons for the hero's trust row, matched to Ziad's credentials in order. */
const trustIcons = [BadgeCheck, ShieldCheck, MapPinIcon, Clock];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [t, content, business, design] = await Promise.all([getText(locale), getContent(), getBusiness(), getDesign()]);
  const tel = phoneHref(business.phone);
  const pricing = await getPricing();
  const latestPosts = (await getPosts()).slice(0, 3);
  const book = localePath(locale, "/book");
  const portrait = content.about.photo?.src ?? images.portrait;
  const initials = initialsOf(site.owner);

  /** Home-page sections; Admin → Design sets their order, visibility, spacing and tint. */
  const st = (key: DesignSection) => styleFor(design, key);
  const sections: Record<string, React.ReactNode> = {
    services: (
      <section id="services" className={cn("relative isolate overflow-hidden border-t bg-muted/40", spacingClass[st("services").spacing])}>
        <UploadedBackground photo={content.backgrounds.services} framing={content.framing.services} />
        <Tint style={st("services")} />
        <Container>
          <SplitHeader eyebrow={t.services.eyebrow} title={t.services.title} lead={t.services.lead} edit={{ title: "services.title", lead: "services.lead" }} />
          {/* A short preview; the full list with search and filters is on /services */}
          <ul
            className={cn(
              "mt-12 grid gap-5 md:grid-cols-2",
              design.layout.servicesColumns === 3 && content.services.items.length !== 4 && "xl:grid-cols-3",
              content.services.items.length === 4 && "xl:grid-cols-4",
            )}
          >
            {content.services.items.slice(0, 4).map((s, i) => (
              <li key={i}>
                <ServiceCard s={s} index={i} locale={locale} links={serviceLinks(locale, content.services.items, pricing, t)} t={serviceLabels(t)} />
              </li>
            ))}
          </ul>
          {content.services.items.length > 4 && (
            <div className="mt-8 flex justify-center">
              <Button href={localePath(locale, "/services")} variant="outline">
                {t.services.viewAll} ({content.services.items.length})
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          )}
          <div className="mt-10">
            <ServiceGuide locale={locale} t={t} />
          </div>
        </Container>
      </section>
    ),
    pricing: (
      <section id="pricing" className={cn("relative isolate overflow-hidden border-t bg-background", spacingClass[st("pricing").spacing])}>
        <Tint style={st("pricing")} />
        <Container>
          {pricing.promo.enabled && pricing.promo[locale] && (
            <div className="mb-14 flex flex-col items-start justify-between gap-4 rounded-xl border border-green/40 bg-[color-mix(in_oklab,var(--color-green)_8%,white)] p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy text-green">
                  <Gift aria-hidden className="h-4 w-4" />
                </span>
                <p className="font-medium text-foreground">{pricing.promo[locale]}</p>
              </div>
              <Button href={book} className="h-9 shrink-0">
                {t.pricing.book}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Button>
            </div>
          )}
          <CenterHeader eyebrow={t.pricing.eyebrow} title={t.pricing.title} lead={t.pricing.lead} edit={{ title: "pricing.title", lead: "pricing.lead" }} />
          <ul
            className={cn(
              "mt-14 grid items-stretch gap-6",
              columnsClass.pricing[pricing.services.length > 2 && pricing.services.length !== 4 ? design.layout.pricingColumns : 2],
              (pricing.services.length <= 2 || pricing.services.length === 4) && "mx-auto max-w-4xl",
            )}
          >
            {pricing.services.map((item, idx) => {
              const mins = item.rates.map((r) => r.minutes);
              const range = item.perSession ? t.pricing.perSessionTitle : mins.length > 1 ? `${Math.min(...mins)}–${Math.max(...mins)} min` : `${mins[0]} min`;
              const featured = idx === 0;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md sm:p-8",
                    featured && "border-foreground/15 shadow-md ring-1 ring-foreground/5",
                  )}
                >
                  {featured && <span aria-hidden className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-blue to-transparent" />}
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">{item.title[locale]}</h3>
                    <Badge variant="outline" className="mt-0.5 shrink-0 text-muted-foreground">
                      {range}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text[locale]}</p>
                  <Separator className="my-6" />
                  <dl className="space-y-1">
                    {item.rates.map((r) => (
                      <div key={r.minutes} className="flex items-baseline justify-between gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted">
                        <dt className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                          <Check className="h-4 w-4 text-[color-mix(in_oklab,var(--color-green)_62%,black)]" />
                          {item.perSession ? t.pricing.lengthAdapted : t.pricing.duration.replace("{n}", String(r.minutes))}
                        </dt>
                        <dd className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{formatPrice(r.price, locale)}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-auto pt-8">
                    <Button href={`${book}?service=${encodeURIComponent(item.id)}`} variant={featured ? "brand" : "outline"} className="w-full">
                      {t.pricing.book}
                      <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          {pricing.homeVisits[locale] && (
            <p className="mx-auto mt-10 flex max-w-2xl items-start justify-center gap-2.5 text-center text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
              {pricing.homeVisits[locale]}
            </p>
          )}
        </Container>
      </section>
    ),
    about: (
      <section id="about" className={cn("relative isolate overflow-hidden border-t bg-background", spacingClass[st("about").spacing])}>
        <UploadedBackground photo={content.backgrounds.about} framing={content.framing.about} />
        <Tint style={st("about")} />
        <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <div className={cn("lg:col-span-5", design.layout.aboutPhoto === "right" && "lg:order-last")}>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border bg-muted shadow-xl shadow-foreground/10">
                <Image data-parallax src={portrait} alt={t.about.portraitAlt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover object-top" />
              </div>
              <div className="absolute -bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:left-8 sm:right-auto">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={portrait} alt="" className="object-cover object-top" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{site.owner}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.credentialsLine}</p>
                </div>
                <BadgeCheck aria-hidden className="ml-1 h-5 w-5 shrink-0 text-blue-dark" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <Eyebrow>{t.about.eyebrow}</Eyebrow>
            <h2 data-edit="about.title" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t.about.title}
            </h2>
            <blockquote data-edit="about.text1" className="mt-6 border-l-2 border-green pl-5 text-lg leading-relaxed text-foreground/90">
              {t.about.text1}
            </blockquote>
            <p data-edit="about.text2" className="mt-5 leading-relaxed text-muted-foreground">
              {t.about.text2}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {t.about.credentials.map((c) => (
                <li key={c} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-xs">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy text-green">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{c}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={book}>
                {t.hero.book}
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button href={tel} variant="outline">
                <Phone className="h-4 w-4" /> {business.phone}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    ),
    blog: (
      <section id="latest" className={cn("relative isolate overflow-hidden border-t bg-muted/40", spacingClass[st("blog").spacing])}>
        <UploadedBackground photo={content.backgrounds.blog} framing={content.framing.blog} />
        <Tint style={st("blog")} />
        <Container>
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>{t.blog.latestEyebrow}</Eyebrow>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{t.blog.latestTitle}</h2>
              <p className="mt-3 max-w-xl text-lg leading-relaxed text-muted-foreground">{t.blog.lead}</p>
            </div>
            <Button href={localePath(locale, "/blog")} variant="outline" className="shrink-0 self-start md:self-auto">
              {t.blog.viewAll}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
          <ul className={cn("grid gap-6", columnsClass.blog[design.layout.blogColumns])}>
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
      <section id="contact" className={cn("relative isolate overflow-hidden border-t bg-background", spacingClass[st("contact").spacing])}>
        <UploadedBackground photo={content.backgrounds.contact} framing={content.framing.contact} />
        <Tint style={st("contact")} />
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <Eyebrow>{t.contact.eyebrow}</Eyebrow>
              <h2 data-edit="contact.title" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t.contact.title}
              </h2>
              <p data-edit="contact.lead" className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {t.contact.lead}
              </p>
              <ul className="mt-10 divide-y rounded-xl border bg-card shadow-xs">
                <Detail icon={Phone} label={t.contact.phone}>
                  <a href={tel} className="hover:underline hover:underline-offset-4">
                    {business.phone}
                  </a>
                </Detail>
                <Detail icon={Mail} label={t.contact.email}>
                  <a href={`mailto:${business.email}`} className="break-all hover:underline hover:underline-offset-4">
                    {business.email}
                  </a>
                </Detail>
                <Detail icon={MapPin} label={t.contact.area}>
                  {t.contact.office}
                  <span className="block text-sm font-normal text-muted-foreground">{t.contact.areaNote}</span>
                </Detail>
              </ul>
            </div>
            <div className={cn("lg:col-span-7", design.layout.contactForm === "left" && "lg:order-first")}>
              <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{t.contact.formTitle}</h3>
                <Separator className="my-5" />
                <ContactForm t={t.form} fields={design.forms} />
              </div>
            </div>
          </div>
        </Container>
      </section>
    ),
    testimonials: content.testimonials.items.length > 0 && (
      <section id="testimonials" className={cn("relative isolate overflow-hidden border-t bg-muted/40", spacingClass[st("testimonials").spacing])}>
        <Tint style={st("testimonials")} />
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mb-4 flex justify-center gap-0.5 text-amber-400" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <h2 data-edit="testimonials.title" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {content.testimonials.title[locale]}
            </h2>
          </div>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {content.testimonials.items.map((q, i) => (
              <li key={i} className="flex flex-col justify-between rounded-xl border bg-card p-6 shadow-xs">
                <div>
                  <Quote aria-hidden className="mb-4 h-5 w-5 text-muted-foreground/50" />
                  <blockquote data-edit={`testimonials.items.${i}.quote`} className="leading-relaxed text-foreground/90">
                    {q.quote[locale]}
                  </blockquote>
                </div>
                <div className="mt-6 flex items-center gap-3 border-t pt-4">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="bg-muted text-xs font-semibold text-navy">{initialsOf(q.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{q.name}</p>
                    {q.detail[locale] && <p className="text-xs text-muted-foreground">{q.detail[locale]}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    ),
    faq: content.faq.items.length > 0 && (
      <section id="faq" className={cn("relative isolate overflow-hidden border-t bg-background", spacingClass[st("faq").spacing])}>
        <Tint style={st("faq")} />
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 data-edit="faq.title" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {content.faq.title[locale]}
            </h2>
            <p className="mt-4 text-muted-foreground">{t.contact.lead}</p>
            <Button href={sectionHref(locale, "contact")} variant="outline" className="mt-6">
              {t.nav.contact}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible defaultValue="faq-0" className="rounded-xl border bg-card px-5 shadow-xs">
              {content.faq.items.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="py-5 text-base font-medium hover:no-underline">{f.q[locale]}</AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line pb-5 text-[0.95rem] leading-relaxed text-muted-foreground">{f.a[locale]}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </section>
    ),
    ...Object.fromEntries(
      content.blocks.map((b) => [
        b.id,
        <section key={b.id} id={b.id} className={cn("relative isolate overflow-hidden border-t bg-background", spacingClass[st(b.id as DesignSection).spacing])}>
          <Tint style={st(b.id as DesignSection)} />
          <Container className={b.photo ? "grid items-center gap-12 lg:grid-cols-2" : "[&>div]:max-w-3xl"}>
            {b.photo && (
              <div className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted shadow-lg shadow-foreground/5", b.photoSide === "right" && "lg:order-last")}>
                <Image src={b.photo.src} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </div>
            )}
            <div>
              {b.eyebrow[locale] && <Eyebrow>{b.eyebrow[locale]}</Eyebrow>}
              <h2 data-edit={`blocks.${content.blocks.indexOf(b)}.title`} className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {b.title[locale]}
              </h2>
              {b.text[locale]
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className="mt-4 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
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
      {/* ---------- Hero: headline and actions beside a framed photo of Ziad at work ---------- */}
      <section data-hero className="relative isolate -mt-16 overflow-hidden bg-background pt-16">
        <div aria-hidden className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div aria-hidden className="aurora absolute -top-24 left-[8%] -z-10 h-[26rem] w-[34rem] max-w-[90vw] rounded-full bg-blue/15 blur-3xl" />
        <div aria-hidden className="aurora-slow absolute right-[4%] top-32 -z-10 h-[22rem] w-[28rem] max-w-[80vw] rounded-full bg-green/12 blur-3xl" />
        <Container className={cn("grid items-center gap-12 pb-16 pt-12 sm:pt-16 lg:gap-16 lg:pb-24 lg:pt-20", !centered && "lg:grid-cols-12")}>
          <div className={cn(centered ? "mx-auto flex min-w-0 max-w-3xl flex-col items-center text-center" : "flex min-w-0 flex-col items-start lg:col-span-6")}>
            <Link
              href={book}
              className="animate-fade-up group mb-6 inline-flex max-w-full items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-3 text-xs font-medium text-muted-foreground shadow-xs transition hover:bg-muted"
            >
              <Badge className="h-5 shrink-0 bg-navy px-2 text-[11px] text-white">
                <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
                {t.hero.eyebrow}
              </Badge>
              <span className="truncate">{t.tagline}</span>
              <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <h1 data-edit="hero.title" className={cn(
                "animate-fade-up delay-1 bg-gradient-to-br from-foreground from-40% to-[color-mix(in_oklab,var(--color-navy)_85%,var(--color-blue))] bg-clip-text pb-1 font-semibold leading-[1.05] tracking-[-0.04em] text-transparent caret-foreground",
                heroSizeClass[design.hero.size],
              )}>
              {t.hero.title}
            </h1>
            <p data-edit="hero.lead" className="animate-fade-up delay-2 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t.hero.lead}
            </p>
            <div className={cn("animate-fade-up delay-3 mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row", centered && "justify-center")}>
              <Button href={book} size="lg" className="shadow-lg shadow-navy/20">
                {t.hero.book}
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button href={tel} variant="outline" size="lg">
                <Phone className="h-4 w-4" /> {t.hero.call}
              </Button>
            </div>
            <ul className={cn("animate-fade-up delay-3 mt-10 grid w-full gap-x-6 gap-y-3 border-t pt-6 sm:grid-cols-2", centered && "max-w-2xl")}>
              {t.about.credentials.map((c, i) => {
                const Icon = trustIcons[i % trustIcons.length];
                return (
                  <li key={c} className={cn("flex items-center gap-2 text-sm text-muted-foreground", centered && "justify-center")}>
                    <Icon aria-hidden className="h-4 w-4 shrink-0 text-navy" />
                    {c}
                  </li>
                );
              })}
            </ul>
          </div>

          {!centered && (
            <div className="animate-fade-up delay-2 relative min-w-0 lg:col-span-6">
              <div className="relative overflow-hidden rounded-2xl border bg-muted p-1.5 shadow-2xl shadow-foreground/10">
                <div className="relative aspect-[5/4] overflow-hidden rounded-xl sm:aspect-[4/3] lg:aspect-[5/6]">
                  <HeroImage alt={t.hero.imageAlt} photo={content.hero.photo} />
                  {design.hero.shade > 0 && <div aria-hidden className="absolute inset-0 bg-black" style={{ opacity: design.hero.shade / 100 }} />}
                </div>
              </div>
              <div className="animate-float-slow absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl border bg-background/95 p-3 pr-4 shadow-lg backdrop-blur sm:-left-6">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={portrait} alt="" className="object-cover object-top" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{site.owner}</p>
                  <p className="text-xs text-muted-foreground">{t.credentialsLine}</p>
                </div>
              </div>
              <div className="animate-float absolute -top-4 right-4 hidden items-center gap-2 rounded-full border bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur sm:flex">
                <span aria-hidden className="h-2 w-2 rounded-full bg-green ring-4 ring-green/20" />
                {t.contact.office}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* ---------- Marquee: services and credentials ---------- */}
      <div className="marquee-wrap relative overflow-hidden border-y bg-muted/40 py-4 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="marquee flex w-max">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center">
              {[...content.services.items.map((s) => s.title[locale]), ...t.about.credentials].map((label, i) => (
                <li key={i} className="flex items-center gap-8 pr-8 text-sm font-medium whitespace-nowrap text-muted-foreground">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
                  {label}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {normalizeSections(
        design,
        content.blocks.map((b) => b.id),
      )
        .filter((s) => s.visible)
        .map((s) => (
          <div key={s.key} data-section={s.key}>
            {sections[s.key]}
          </div>
        ))}
    </>
  );
}

/** Heading on the left, lead on the right (stacks on phones). */
function SplitHeader({ eyebrow, title, lead, edit }: { eyebrow: string; title: string; lead: string; edit: { title: string; lead: string } }) {
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 data-edit={edit.title} className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
      </div>
      <p data-edit={edit.lead} className="max-w-md leading-relaxed text-muted-foreground">
        {lead}
      </p>
    </div>
  );
}

function CenterHeader({ eyebrow, title, lead, edit }: { eyebrow: string; title: string; lead: string; edit: { title: string; lead: string } }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 data-edit={edit.title} className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <p data-edit={edit.lead} className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {lead}
      </p>
    </div>
  );
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
      <div aria-hidden className="absolute inset-0 -z-10 bg-background/95" />
    </>
  );
}

/** Hero photo: an uploaded photo if there is one, otherwise Ziad's treatment photo. */
function HeroImage({ alt, photo }: { alt: string; photo: SitePhoto | null }) {
  const cls = "absolute inset-0 h-full w-full object-cover object-[60%_30%]";
  if (photo) return <Image data-parallax src={photo.src} fill alt={alt} sizes="(min-width: 1024px) 50vw, 100vw" priority className={cls} />;
  const { props } = getImageProps({ alt, sizes: "(min-width: 1024px) 50vw, 100vw", loading: "eager", fetchPriority: "high", ...images.hero.square });
  return <img data-parallax {...props} alt={alt} className={cls} />;
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
    <li className="flex gap-4 p-4 sm:p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border bg-muted text-navy">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-0.5 font-medium text-foreground">{children}</div>
      </div>
    </li>
  );
}
