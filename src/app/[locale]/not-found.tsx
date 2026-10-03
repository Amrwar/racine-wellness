"use client";

import { getDictionary } from "@/i18n";
import { useLocale } from "@/i18n/LocaleProvider";
import { Arrow, Button, Container, Eyebrow, Heading, Lead } from "@/components/ui";

export default function NotFound() {
  const locale = useLocale();
  const t = getDictionary(locale);

  return (
    <section className="flex min-h-[80svh] items-center pt-24">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>404</Eyebrow>
          <Heading as="h1">{t.notFound.title}</Heading>
          <Lead className="mt-6">{t.notFound.lead}</Lead>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/">
              {t.common.backHome} <Arrow />
            </Button>
            <Button href="/contact" variant="ghost">
              {t.common.contactUs}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
