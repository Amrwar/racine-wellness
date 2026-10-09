import { site } from "@/lib/site";
import { LLink } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { Logo } from "./Logo";
import { Instagram } from "./icons";

export function Footer({ t }: { t: Dictionary }) {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo label={t.header.home} />
            <p className="mt-2 text-sm font-medium text-mist">{t.tagline}</p>
          </div>
          <div className="space-y-1.5 text-sm text-white/80 sm:text-right">
            <a href={site.phoneHref} className="block hover:text-white">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="block hover:text-white">
              {site.email}
            </a>
            <p>
              {site.address.city}, {site.address.region}
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
            <a
              href={site.socials.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-white/70 hover:text-green"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
