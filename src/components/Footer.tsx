import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { localePath, sectionHref, type Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { phoneHref, type Business } from "@/lib/business-data";
import { LLink } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { Container } from "./ui/site";
import { buttonVariants } from "./ui/button";
import { Facebook, GoogleG, Instagram, Linkedin, Mail, MapPin, Phone, Tiktok, Youtube } from "./icons";

export function Footer({ t, business, locale }: { t: Dictionary; business: Business; locale: Locale }) {
  const book = localePath(locale, "/book");
  const quick = [
    [t.nav.services, localePath(locale, "/services")],
    [t.nav.pricing, localePath(locale, "/pricing")],
    [t.nav.about, sectionHref(locale, "about")],
    [t.nav.blog, localePath(locale, "/blog")],
    [t.nav.contact, sectionHref(locale, "contact")],
  ] as const;
  const socials = (
    [
      ["instagram", "Instagram", Instagram],
      ["facebook", "Facebook", Facebook],
      ["google", "Google", GoogleG],
      ["linkedin", "LinkedIn", Linkedin],
      ["youtube", "YouTube", Youtube],
      ["tiktok", "TikTok", Tiktok],
    ] as const
  ).filter(([key]) => business[key]);

  return (
    <footer className="relative isolate overflow-hidden bg-[var(--footer-bg,var(--color-navy-deep))] text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,black,transparent)]"
      />
      <Container>
        {/* Booking call to action */}
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-14 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.contact.title}</h2>
            <p className="mt-2 text-white/65">{t.contact.lead}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={book}
              className={cn(buttonVariants(), "group h-11 rounded-[var(--btn-radius,0.625rem)] bg-white px-5 text-[var(--footer-bg,var(--color-navy-deep))] hover:bg-white/90")}
            >
              {t.header.book}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={phoneHref(business.phone)}
              className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-[var(--btn-radius,0.625rem)] border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white")}
            >
              <Phone className="h-4 w-4" />
              {business.phone}
            </a>
          </div>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-5 sm:col-span-2 lg:col-span-5">
            <Logo label={t.header.home} tone="dark" />
            <p className="max-w-sm text-sm leading-relaxed text-white/65">{t.meta.description}</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/85">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
              {t.credentialsLine}
            </span>
            {socials.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                {socials.map(([key, label, Icon]) => (
                  <a
                    key={key}
                    href={business[key]}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <FooterCol title={site.name} className="lg:col-span-2">
            {quick.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-white/65 transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={book} className="inline-flex items-center gap-1 font-medium text-green transition-colors hover:text-white">
                {t.header.book}
                <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </li>
          </FooterCol>

          <FooterCol title={t.nav.contact} className="lg:col-span-3">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <a href={phoneHref(business.phone)} className="text-white/80 transition-colors hover:text-white">
                {business.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <a href={`mailto:${business.email}`} className="break-all text-white/80 transition-colors hover:text-white">
                {business.email}
              </a>
            </li>
          </FooterCol>

          <FooterCol title={t.contact.area} className="lg:col-span-2">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <span>
                <span className="block text-white/80">{t.contact.office}</span>
                <span className="mt-1 block text-white/50">{t.contact.areaNote}</span>
              </span>
            </li>
          </FooterCol>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-white/50 md:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </p>
          <LLink href="/privacy" className="transition-colors hover:text-white">
            {t.footer.privacy}
          </LLink>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h2 className="text-sm font-medium text-white">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm">{children}</ul>
    </div>
  );
}
