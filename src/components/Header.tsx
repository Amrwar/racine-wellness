"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems, type NavItem } from "@/lib/site";
import { localePath, sectionHref, splitLocale, type Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { Logo } from "./Logo";
import { Button } from "./ui";

export function Header({ t }: { t: Pick<Dictionary, "nav" | "header"> }) {
  const locale = useLocale();
  const { path: barePath } = splitLocale(usePathname());
  const [open, setOpen] = useState(false);

  const otherLocale: Locale = locale === "en" ? "fr" : "en";
  const switchHref = localePath(otherLocale, barePath);
  const close = () => setOpen(false);
  const hrefFor = (item: NavItem) =>
    "page" in item ? localePath(locale, item.page) : sectionHref(locale, item.section);
  const isActive = (item: NavItem) =>
    "page" in item && (barePath === item.page || barePath.startsWith(item.page + "/"));

  const langSwitch = (
    <Link
      href={switchHref}
      scroll={false}
      hrefLang={otherLocale}
      lang={otherLocale}
      title={t.header.switchTitle}
      className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold tracking-widest text-white transition hover:bg-white/10"
    >
      {t.header.switchShort}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo label={t.header.home} />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={hrefFor(item)}
              aria-current={isActive(item) ? "page" : undefined}
              className={`text-sm font-medium transition hover:text-white ${
                isActive(item) ? "text-white underline decoration-green decoration-2 underline-offset-8" : "text-white/80"
              }`}
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {langSwitch}
          <Button href={sectionHref(locale, "contact")}>{t.header.book}</Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {langSwitch}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.header.closeMenu : t.header.openMenu}
            className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Mobile"
        hidden={!open}
        className="border-t border-white/10 px-5 pb-6 md:hidden"
      >
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={hrefFor(item)}
            onClick={close}
            aria-current={isActive(item) ? "page" : undefined}
            className="block border-b border-white/10 py-4 text-lg font-medium text-white"
          >
            {t.nav[item.key]}
          </Link>
        ))}
        <Button href={sectionHref(locale, "contact")} size="lg" className="mt-6 w-full" onClick={close}>
          {t.header.book}
        </Button>
      </nav>
    </header>
  );
}
