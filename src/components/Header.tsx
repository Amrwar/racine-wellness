"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";
import { Logo } from "./Logo";
import { Button, Arrow } from "./ui";

export function Header() {
  const pathname = usePathname();
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

  const dark = pathname === "/" && !scrolled && !open;

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
          <Logo light={dark} />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-colors ${
                    dark
                      ? active
                        ? "text-cream"
                        : "text-cream/70 hover:text-cream"
                      : active
                        ? "text-forest"
                        : "text-stone hover:text-forest"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                        dark ? "bg-sage" : "bg-clay"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <Button href="/contact" variant={dark ? "light" : "primary"}>
              Book a free call <Arrow />
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={`relative z-50 grid h-11 w-11 place-items-center rounded-full border lg:hidden ${
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

      <div
        id="mobile-menu"
        className={`fixed inset-0 top-20 z-40 bg-cream transition-all duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col px-6 pt-6 pb-10" aria-label="Mobile">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
              className={`flex items-center justify-between border-b border-sand py-5 font-display text-3xl font-medium text-forest transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              {item.label}
              <Arrow className="h-5 w-5 text-clay" />
            </Link>
          ))}
          <div className="mt-auto">
            <Button href="/contact" size="lg" className="w-full" onClick={() => setOpen(false)}>
              Book a free discovery call
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
