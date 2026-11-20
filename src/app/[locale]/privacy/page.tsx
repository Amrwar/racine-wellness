import { getText } from "@/lib/content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getBusiness } from "@/lib/business";
import { Container, PageHero } from "@/components/ui/site";
import { Badge } from "@/components/ui/badge";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = (await getText(locale)).meta.privacy;
  return {
    title: m.title,
    description: m.description,
    alternates: alternatesFor("/privacy"),
    robots: { index: false },
  };
}

function withEmail(text: string, email: string) {
  const [before, after] = text.split("{email}");
  if (after === undefined) return text;
  return (
    <>
      {before}
      <a href={`mailto:${email}`}>{email}</a>
      {after}
    </>
  );
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (await getText(locale));
  const p = t.privacy;
  const { email } = await getBusiness();

  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title}>
        <Badge variant="outline" className="mt-5 h-6 px-2.5 text-muted-foreground">
          {p.updated}
        </Badge>
      </PageHero>
      <section className="py-16 sm:py-20">
        <Container>
          <div className="prose-site max-w-3xl [&_h2]:border-t [&_h2]:pt-8">
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
                  <p>{withEmail(s.text ?? "", email)}</p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
