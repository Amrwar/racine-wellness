"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navPaths } from "@/lib/site";
import { localePath, splitLocale, type Locale } from "@/i18n/config";
import { LLink, useLocale } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { Logo } from "./Logo";
import { Button, Arrow } from "./ui";

export function Header({ t }: { t: Pick<Dictionary, "nav" | "header"> }) {
  const locale = useLocale();
  const pathname = usePathname();
  const { path: barePath } = splitLocale(pathname);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isHome = barePath === "/";
  const dark = isHome && !scrolled && !open;
  const otherLocale: Locale = locale === "en" ? "fr" : "en";
  const switchHref = localePath(otherLocale, barePath);

  const linkTone = (active: boolean) =>
    dark
      ? active
        ? "text-cream"
        : "text-cream/70 hover:text-cream"
      : active
        ? "text-forest"
        : "text-stone hover:text-forest";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-500 ${
          scrolled || open
            ? "border-b border-sand/80 bg-cream/85 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Logo light={dark} label={t.header.home} />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {navPaths.map((item) => {
              const active = barePath === item.href || barePath.startsWith(item.href + "/");
              return (
                <LLink
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-colors ${linkTone(active)}`}
                >
                  {t.nav[item.key]}
                  {active && (
                    <span
                      className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                        dark ? "bg-sage" : "bg-clay"
                      }`}
                    />
                  )}
                </LLink>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href={switchHref}
              hrefLang={otherLocale}
              lang={otherLocale}
              title={t.header.switchTitle}
              className={`rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-[0.15em] transition ${
                dark
                  ? "border-cream/30 text-cream hover:bg-cream/10"
                  : "border-forest/15 text-forest hover:border-forest"
              }`}
            >
              {t.header.switchShort}
            </Link>
            <Button href="/contact" variant={dark ? "light" : "primary"}>
              {t.header.bookCall} <Arrow />
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href={switchHref}
              hrefLang={otherLocale}
              lang={otherLocale}
              title={t.header.switchTitle}
              className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] ${
                dark ? "border-cream/30 text-cream" : "border-forest/15 text-forest"
              }`}
            >
              {t.header.switchShort}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.header.closeMenu : t.header.openMenu}
              className={`relative z-50 grid h-11 w-11 place-items-center rounded-full border ${
                dark ? "border-cream/30 text-cream" : "border-forest/15 text-forest"
              }`}
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={`absolute left-0 top-0 h-[1.5px] w-full bg-current transition-all duration-300 ${
                    open ? "top-1/2 -translate-y-1/2 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-current transition-opacity duration-300 ${
                    open ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-[1.5px] w-full bg-current transition-all duration-300 ${
                    open ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`fixed inset-0 top-20 z-40 bg-cream transition-all duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col px-6 pt-6 pb-10" aria-label="Mobile">
          {navPaths.map((item, i) => (
            <LLink
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
              className={`flex items-center justify-between border-b border-sand py-5 font-display text-3xl font-medium text-forest transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              {t.nav[item.key]}
              <Arrow className="h-5 w-5 text-clay" />
            </LLink>
          ))}
          <div className="mt-auto">
            <Button href="/contact" size="lg" className="w-full" onClick={() => setOpen(false)}>
              {t.header.bookDiscovery}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
