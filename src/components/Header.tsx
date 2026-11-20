"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu } from "lucide-react";
import { navItems, type NavItem } from "@/lib/site";
import { localePath, sectionHref, splitLocale, type Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/en";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { Button } from "./ui/site";
import { Button as UIButton } from "./ui/button";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

export function Header({ t, hidden = [] }: { t: Pick<Dictionary, "nav" | "header" | "tagline">; hidden?: string[] }) {
  const items = navItems.filter((item) => !hidden.includes(item.key));
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
      className="inline-flex h-9 items-center rounded-md border bg-background px-2.5 text-xs font-semibold tracking-wider text-muted-foreground shadow-xs transition hover:bg-muted hover:text-foreground"
    >
      {t.header.switchShort}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo label={t.header.home} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {items.map((item) => (
            <Link
              key={item.key}
              href={hrefFor(item)}
              aria-current={isActive(item) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                isActive(item) ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {langSwitch}
          <Button href={localePath(locale, "/book")} className="h-9">
            {t.header.book}
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {langSwitch}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <UIButton variant="outline" size="icon-lg" aria-label={open ? t.header.closeMenu : t.header.openMenu}>
                <Menu className="size-5" />
              </UIButton>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetHeader>
                <SheetTitle className="sr-only">{t.header.openMenu}</SheetTitle>
                <Logo label={t.header.home} />
                <SheetDescription>{t.tagline}</SheetDescription>
              </SheetHeader>
              <Separator />
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {items.map((item) => (
                  <Link
                    key={item.key}
                    href={hrefFor(item)}
                    onClick={close}
                    aria-current={isActive(item) ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted",
                      isActive(item) ? "bg-muted text-foreground" : "text-foreground/80",
                    )}
                  >
                    {t.nav[item.key]}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-4">
                <Button href={localePath(locale, "/book")} size="lg" className="w-full" onClick={close}>
                  {t.header.book}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
