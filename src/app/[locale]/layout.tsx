import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionLinks } from "@/components/SectionLinks";
import { site } from "@/lib/site";
import { getDictionary } from "@/i18n";
import { htmlLang, isLocale, locales, localePath, ogLocale, type Locale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import "../globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
  const t = getDictionary(locale);
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
      images: [{ url: `/opengraph-image?lang=${locale}`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

function businessJsonLd(locale: Locale) {
  const t = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": ["HealthAndBeautyBusiness", "LocalBusiness"],
    name: site.name,
    description: t.meta.description,
    url: `${site.url}${localePath(locale, "/")}`,
    inLanguage: htmlLang[locale],
    telephone: site.phoneHref.replace("tel:", ""),
    email: site.email,
    image: `${site.url}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    founder: { "@type": "Person", name: site.owner, jobTitle: t.credentialsLine },
    areaServed: "Greater Montréal, QC",
    sameAs: Object.values(site.socials),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <html lang={htmlLang[locale]} className={`${poppins.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <LocaleProvider locale={locale}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
          >
            {t.header.skip}
          </a>
          <Header t={{ nav: t.nav, header: t.header }} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer t={t} />
          <SectionLinks />
        </LocaleProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd(locale)) }}
        />
      </body>
    </html>
  );
}
