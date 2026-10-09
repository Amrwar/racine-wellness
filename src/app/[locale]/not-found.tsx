"use client";

import { getDictionary } from "@/i18n";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import { Arrow, Button, Container, Eyebrow } from "@/components/ui";

export default function NotFound() {
  const locale = useLocale();
  const t = getDictionary(locale);

  return (
    <section className="flex min-h-[70svh] items-center py-20">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>404</Eyebrow>
          <h1 className="text-4xl font-semibold tracking-tight text-navy sm:text-5xl">{t.notFound.title}</h1>
          <p className="mt-5 text-lg text-muted">{t.notFound.lead}</p>
          <Button href={localePath(locale, "/")} variant="navy" size="lg" className="mt-9">
            {t.notFound.backHome} <Arrow />
          </Button>
        </div>
      </Container>
    </section>
  );
}
