import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/**
 * Locale routing:
 *  - /fr/...   → served as-is (French)
 *  - /en/...   → redirected to the unprefixed canonical URL
 *  - /...      → internally rewritten to /en/... (default locale, no prefix in the URL)
 */
function withLocale(request: NextRequest, locale: string) {
  const headers = new Headers(request.headers);
  headers.set("x-locale", locale);
  return headers;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first] = pathname.split("/");

  if (first && isLocale(first)) {
    if (first === defaultLocale) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice(first.length + 1) || "/";
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next({ request: { headers: withLocale(request, first) } });
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url, { request: { headers: withLocale(request, defaultLocale) } });
}

export const config = {
  matcher: [
    // Skip Next internals, static files, and root-level metadata routes.
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\..*).*)",
  ],
};
