import { navPaths, site } from "@/lib/site";
import { LLink } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { Logo } from "./Logo";
import { Facebook, Instagram, Youtube } from "./icons";

export function Footer({ t }: { t: Dictionary }) {
  return (
    <footer className="relative overflow-hidden bg-forest-deep text-cream">
      <div className="grain absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 pt-20 pb-10 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo light label={t.header.home} />
            <p className="mt-6 max-w-sm text-base leading-relaxed text-sage">{t.footer.description}</p>
            <div className="mt-8 flex gap-3">
              {[
                { href: site.socials.instagram, Icon: Instagram, label: "Instagram" },
                { href: site.socials.youtube, Icon: Youtube, label: "YouTube" },
                { href: site.socials.facebook, Icon: Facebook, label: "Facebook" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-cream/15 text-sage transition hover:border-sage hover:text-cream"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-sage">{t.footer.explore}</h3>
            <ul className="mt-5 space-y-3">
              {navPaths.map((n) => (
                <li key={n.href}>
                  <LLink href={n.href} className="text-cream/80 transition hover:text-cream">
                    {t.nav[n.key]}
                  </LLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-sage">{t.footer.hours}</h3>
            <ul className="mt-5 space-y-3 text-cream/80">
              {t.hours.map((h) => (
                <li key={h.day}>
                  <span className="block text-sm text-sage/80">{h.day}</span>
                  {h.time}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-sage">{t.footer.studio}</h3>
            <address className="mt-5 not-italic leading-relaxed text-cream/80">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.region} {site.address.postal}
            </address>
            <a href={site.phoneHref} className="mt-4 block text-cream/80 transition hover:text-cream">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="block text-cream/80 transition hover:text-cream">
              {site.email}
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-cream/10 pt-8 text-sm text-sage/80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </p>
          <div className="flex gap-6">
            <LLink href="/privacy" className="hover:text-cream">
              {t.footer.privacy}
            </LLink>
            <span>{t.footer.city}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
