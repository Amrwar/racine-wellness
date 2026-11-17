import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import { PreviewBanner } from "@/components/PreviewBanner";
import { SiteEditor } from "@/components/SiteEditor";
import { fontVariables } from "@/lib/fonts";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionLinks } from "@/components/SectionLinks";
import { site } from "@/lib/site";
import { getContent, getText } from "@/lib/content";
import { getBusiness } from "@/lib/business";
import { getDesign } from "@/lib/design";
import { designCss, hiddenMenuKeys } from "@/lib/design-data";
import { phoneHref, type Business } from "@/lib/business-data";
import type { Dictionary } from "@/i18n/en";
import { htmlLang, isLocale, locales, localePath, ogLocale, type Locale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import "../globals.css";



export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/** Build hreflang alternates for a bare path, e.g. "/about". */
export function alternatesFor(path: string) {
  return {
    canonical: path,
    languages: {
      en: localePath("en", path),
      fr: localePath("fr", path),
      "x-default": localePath("en", path),
    },
  };
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = (await getText(locale));
  const share = (await getContent()).share.home;
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.titleDefault, template: `%s · ${site.name}` },
    description: t.meta.description,
    keywords: t.meta.keywords,
    alternates: alternatesFor("/"),
    openGraph: {
      type: "website",
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      siteName: site.name,
      title: t.meta.titleDefault,
      description: t.meta.description,
      images: share ? [{ url: share.src, width: share.width, height: share.height }] : [{ url: `/opengraph-image?lang=${locale}`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

function businessJsonLd(locale: Locale, t: Dictionary, business: Business) {
  return {
    "@context": "https://schema.org",
    "@type": ["HealthAndBeautyBusiness", "LocalBusiness"],
    name: site.name,
    description: t.meta.description,
    url: `${site.url}${localePath(locale, "/")}`,
    inLanguage: htmlLang[locale],
    telephone: phoneHref(business.phone).replace("tel:", ""),
    email: business.email,
    image: `${site.url}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    founder: { "@type": "Person", name: site.owner, jobTitle: t.credentialsLine },
    areaServed: "Greater Montréal, QC",
    sameAs: [business.instagram, business.facebook, business.google, business.linkedin, business.youtube, business.tiktok].filter(Boolean),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [t, business, design] = await Promise.all([getText(locale), getBusiness(), getDesign()]);
  const preview = (await draftMode()).isEnabled;

  return (
    <html lang={htmlLang[locale]} className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col">
        {/* Colours and text size chosen in Admin → Design */}
        <style dangerouslySetInnerHTML={{ __html: designCss(design) }} />
        <LocaleProvider locale={locale}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
          >
            {t.header.skip}
          </a>
          <Header t={{ nav: t.nav, header: t.header, tagline: t.tagline }} hidden={hiddenMenuKeys(design)} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer t={t} business={business} locale={locale} />
          <SectionLinks />
          {preview && (
            <Suspense>
              <PreviewBanner />
              <SiteEditor />
            </Suspense>
          )}
        </LocaleProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd(locale, t, business)) }}
        />
      </body>
    </html>
  );
}
