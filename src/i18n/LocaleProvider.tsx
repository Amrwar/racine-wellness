"use client";

import Link from "next/link";
import { createContext, useContext, type ComponentProps } from "react";
import { defaultLocale, localePath, type Locale } from "./config";

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** next/link that automatically prefixes internal paths with the current locale. */
export function LLink({ href, ...rest }: ComponentProps<typeof Link>) {
  const locale = useLocale();
  const h = typeof href === "string" && href.startsWith("/") ? localePath(locale, href) : href;
  return <Link href={h} {...rest} />;
}
