"use client";

import { getDictionary } from "@/i18n";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import { Arrow, Button, Container, Eyebrow } from "@/components/ui/site";

export default function NotFound() {
  const locale = useLocale();
  const t = getDictionary(locale);

  return (
    <section className="relative isolate -mt-16 flex min-h-[80svh] items-center overflow-hidden pb-20 pt-36">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]" />
      <Container>
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Eyebrow>404</Eyebrow>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{t.notFound.title}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{t.notFound.lead}</p>
          <Button href={localePath(locale, "/")} size="lg" className="mt-8">
            {t.notFound.backHome} <Arrow />
          </Button>
        </div>
      </Container>
    </section>
  );
}
