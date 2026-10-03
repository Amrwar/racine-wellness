import type { Metadata } from "next";
import Image from "next/image";
import { services } from "@/lib/content";
import { serviceIcons } from "@/components/icons";
import { Arrow, Button, Check, Container, Eyebrow, Heading, PageHero } from "@/components/ui";
import { CTA } from "@/components/sections";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Personal training, naturopathic consultations, nutrition coaching and online coaching in Montréal. Combine them into one personalized plan.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Four ways to work together,{" "}
            <em className="font-light italic text-moss">one philosophy.</em>
          </>
        }
        lead="Start with the service that matches your biggest need. Most clients combine training with naturopathic care for the fastest, most lasting results."
      >
        <nav aria-label="Services" className="flex flex-wrap gap-2">
          {services.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="rounded-full border border-forest/15 px-4 py-2 text-sm font-semibold text-forest transition hover:border-forest hover:bg-forest hover:text-cream"
            >
              {s.title}
            </a>
          ))}
        </nav>
      </PageHero>

      {services.map((s, i) => {
        const Icon = serviceIcons[s.icon];
        const flip = i % 2 === 1;
        return (
          <section
            key={s.slug}
            id={s.slug}
            className={`scroll-mt-28 py-20 sm:py-28 ${i % 2 === 1 ? "bg-sand/50" : ""}`}
          >
            <Container>
              <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
                <div className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
                  <div className="relative aspect-[5/4] overflow-hidden rounded-[2.5rem] shadow-soft">
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute left-6 top-6 grid h-14 w-14 place-items-center rounded-2xl bg-cream/90 text-forest backdrop-blur">
                      <Icon className="h-7 w-7" />
                    </span>
                  </div>
                </div>
                <div className={`lg:col-span-6 ${flip ? "lg:order-1" : ""}`}>
                  <Eyebrow>0{i + 1}</Eyebrow>
                  <Heading>{s.title}</Heading>
                  <p className="mt-6 text-lg leading-relaxed text-stone">{s.description}</p>
                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {s.includes.map((inc) => (
                      <li key={inc} className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 text-sm font-medium text-forest">
                        <Check className="text-moss" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Button href="/contact">
                      Enquire about {s.title.toLowerCase()} <Arrow />
                    </Button>
                    <Button href="/programs" variant="ghost">
                      See programs
                    </Button>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        );
      })}

      <CTA
        title="Not sure where to start?"
        text="Book a free discovery call and I'll recommend the right starting point for your goals, schedule and budget."
      />
    </>
  );
}
