import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { site } from "@/lib/site";
import { Container, Eyebrow } from "@/components/ui";
import { PageHeaderArt } from "@/components/art";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getDictionary(locale).meta.privacy;
  return {
    title: m.title,
    description: m.description,
    alternates: alternatesFor("/privacy"),
    robots: { index: false },
  };
}

function withEmail(text: string) {
  const [before, after] = text.split("{email}");
  if (after === undefined) return text;
  return (
    <>
      {before}
      <a href={`mailto:${site.email}`}>{site.email}</a>
      {after}
    </>
  );
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const p = t.privacy;

  return (
    <>
      <section className="relative isolate -mt-18 overflow-hidden bg-navy pb-16 pt-34 text-white sm:pb-20 sm:pt-38">
        <PageHeaderArt />
        <Container>
          <Eyebrow light>{p.eyebrow}</Eyebrow>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{p.title}</h1>
          <p className="mt-4 text-mist">{p.updated}</p>
        </Container>
      </section>
      <section className="py-16 sm:py-20">
        <Container>
          <div className="prose-site max-w-3xl">
            <p>{p.intro}</p>
            {p.sections.map((s) => (
              <div key={s.title}>
                <h2>{s.title}</h2>
                {"items" in s && s.items ? (
                  <ul>
                    {s.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{withEmail(s.text ?? "")}</p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
