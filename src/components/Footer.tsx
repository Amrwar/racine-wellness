import { site } from "@/lib/site";
import { phoneHref, type Business } from "@/lib/business-data";
import { LLink } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { Logo } from "./Logo";
import { Facebook, GoogleG, Instagram, Linkedin, Tiktok, Youtube } from "./icons";

export function Footer({ t, business }: { t: Dictionary; business: Business }) {
  return (
    <footer className="bg-[var(--footer-bg,var(--color-navy-deep))] text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo label={t.header.home} />
            <p className="mt-2 text-sm font-medium text-mist">{t.tagline}</p>
          </div>
          <div className="space-y-1.5 text-sm text-white/80 sm:text-right">
            <a href={phoneHref(business.phone)} className="block hover:text-white">
              {business.phone}
            </a>
            <a href={`mailto:${business.email}`} className="block hover:text-white">
              {business.email}
            </a>
            <p>
              {t.contact.office}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </p>
          <div className="flex items-center gap-5">
            <LLink href="/blog" className="hover:text-white">
              {t.nav.blog}
            </LLink>
            <LLink href="/privacy" className="hover:text-white">
              {t.footer.privacy}
            </LLink>
            {(
              [
                ["instagram", "Instagram", Instagram],
                ["facebook", "Facebook", Facebook],
                ["google", "Google", GoogleG],
                ["linkedin", "LinkedIn", Linkedin],
                ["youtube", "YouTube", Youtube],
                ["tiktok", "TikTok", Tiktok],
              ] as const
            ).map(([key, label, Icon]) =>
              business[key] ? (
                <a key={key} href={business[key]} target="_blank" rel="noreferrer" aria-label={label} className="text-white/70 hover:text-green">
                  <Icon className="h-5 w-5" />
                </a>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
