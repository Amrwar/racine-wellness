import Link from "next/link";
import { localePath, sectionHref, type Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { phoneHref, type Business } from "@/lib/business-data";
import { LLink } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { Logo } from "./Logo";
import { Facebook, GoogleG, Instagram, Linkedin, Tiktok, Youtube } from "./icons";

export function Footer({ t, business, locale }: { t: Dictionary; business: Business; locale: Locale }) {
  const quick = [
    [t.nav.services, localePath(locale, "/services")],
    [t.nav.pricing, localePath(locale, "/pricing")],
    [t.nav.about, sectionHref(locale, "about")],
    [t.nav.blog, localePath(locale, "/blog")],
    [t.nav.contact, sectionHref(locale, "contact")],
    [t.header.book, localePath(locale, "/book")],
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
    <footer className="relative overflow-hidden bg-[var(--footer-bg,var(--color-navy-deep))] text-white">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-4 lg:col-span-5">
            <Logo label={t.header.home} />
            <p className="max-w-sm text-sm leading-relaxed text-white/75">{t.meta.description}</p>
            <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium">
              <span aria-hidden className="h-2 w-2 rounded-full bg-green" />
              {t.credentialsLine}
            </span>
          </div>

          <div className="space-y-4 lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider">{t.contact.area}</h2>
            <p className="text-sm text-white/85">{t.contact.office}</p>
            <p className="text-sm text-white/60">{t.contact.areaNote}</p>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider">{t.nav.contact}</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-white/60">{t.contact.phone}</span>
                <a href={phoneHref(business.phone)} className="font-medium hover:text-green">
                  {business.phone}
                </a>
              </div>
              <div>
                <span className="block text-white/60">{t.contact.email}</span>
                <a href={`mailto:${business.email}`} className="break-all font-medium hover:text-green">
                  {business.email}
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider">{site.name}</h2>
            <nav aria-label={site.name} className="flex flex-col gap-2 text-sm text-white/80">
              {quick.map(([label, href]) => (
                <Link key={href} href={href} className="hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
            {socials.length > 0 && (
              <div className="flex items-center gap-4 pt-1">
                {socials.map(([key, label, Icon]) => (
                  <a key={key} href={business[key]} target="_blank" rel="noreferrer" aria-label={label} className="text-white/70 hover:text-green">
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-white/60 md:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </p>
          <LLink href="/privacy" className="hover:text-white">
            {t.footer.privacy}
          </LLink>
        </div>
      </div>
    </footer>
  );
}
