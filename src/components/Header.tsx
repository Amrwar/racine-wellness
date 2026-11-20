"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

/**
 * At the top of the page the bar is transparent and full width. Once the visitor scrolls it
 * becomes a floating navy glass bar with a reading-progress line (colours follow Admin → Design).
 */
export function Header({ t, hidden = [] }: { t: Pick<Dictionary, "nav" | "header" | "tagline">; hidden?: string[] }) {
  const items = navItems.filter((item) => !hidden.includes(item.key));
  const locale = useLocale();
  const { path: barePath } = splitLocale(usePathname());
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const otherLocale: Locale = locale === "en" ? "fr" : "en";
  const switchHref = localePath(otherLocale, barePath);
  const close = () => setOpen(false);
  const hrefFor = (item: NavItem) => ("page" in item ? localePath(locale, item.page) : sectionHref(locale, item.section));
  const isActive = (item: NavItem) => "page" in item && (barePath === item.page || barePath.startsWith(item.page + "/"));

  const langSwitch = (
    <Link
      href={switchHref}
      scroll={false}
      hrefLang={otherLocale}
      lang={otherLocale}
      title={t.header.switchTitle}
      className={cn(
        "inline-flex h-9 items-center rounded-md border px-2.5 text-xs font-semibold tracking-wider transition-colors duration-300",
        scrolled
          ? "border-white/15 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white"
          : "bg-background text-muted-foreground shadow-xs hover:bg-muted hover:text-foreground",
      )}
    >
      {t.header.switchShort}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 h-16">
      <div className={cn("transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", scrolled ? "px-3 pt-2.5 sm:px-5" : "px-0 pt-0")}>
        <div
          className={cn(
            "relative mx-auto flex items-center justify-between gap-6 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            scrolled
              ? "h-14 max-w-5xl rounded-2xl border border-white/10 bg-[color-mix(in_oklab,var(--color-navy-deep)_88%,transparent)] px-3 shadow-[0_18px_50px_-12px_rgb(0_30_50/0.45)] backdrop-blur-xl backdrop-saturate-150 sm:px-4"
              : "h-16 max-w-6xl border border-transparent bg-transparent px-5 sm:px-8",
          )}
        >
          <Logo label={t.header.home} tone={scrolled ? "dark" : "light"} />

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
            {items.map((item) => (
              <Link
                key={item.key}
                href={hrefFor(item)}
                aria-current={isActive(item) ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300",
                  scrolled
                    ? isActive(item)
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                    : isActive(item)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {langSwitch}
            <Button
              href={localePath(locale, "/book")}
              className={cn("btn-shine h-9 transition-colors duration-300", scrolled && "bg-white text-navy-deep hover:bg-white/90")}
            >
              {t.header.book}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {langSwitch}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <UIButton
                  variant="outline"
                  size="icon-lg"
                  aria-label={open ? t.header.closeMenu : t.header.openMenu}
                  className={cn("transition-colors duration-300", scrolled && "border-white/15 bg-white/5 text-white hover:bg-white/15 hover:text-white")}
                >
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
                  {items.map((item, i) => (
                    <Link
                      key={item.key}
                      href={hrefFor(item)}
                      onClick={close}
                      aria-current={isActive(item) ? "page" : undefined}
                      style={{ animationDelay: `${80 + i * 50}ms` }}
                      className={cn(
                        "animate-fade-up flex items-center justify-between rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted",
                        isActive(item) ? "bg-muted text-foreground" : "text-foreground/80",
                      )}
                    >
                      {t.nav[item.key]}
                      <ArrowRight aria-hidden className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-4">
                  <Button href={localePath(locale, "/book")} size="lg" className="btn-shine w-full" onClick={close}>
                    {t.header.book}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Reading progress, shown on the floating bar */}
          <span
            aria-hidden
            className={cn(
              "scroll-progress pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-blue via-green to-green transition-opacity duration-500",
              scrolled ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>
    </header>
  );
}
