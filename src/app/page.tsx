import Image from "next/image";
import Link from "next/link";
import { process, stats } from "@/lib/content";
import { videos } from "@/lib/videos";
import { site } from "@/lib/site";
import { Arrow, Button, Container, Eyebrow, Heading, Lead, SectionHeader } from "@/components/ui";
import { CTA, FAQList, ServicesGrid, Testimonials } from "@/components/sections";
import { VideoCard } from "@/components/video";
import { faqs } from "@/lib/content";

export default function HomePage() {
  const latest = videos.slice(0, 3);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-forest-deep text-cream">
        <Image
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=2400&q=80"
          alt="Athlete training with a kettlebell in natural light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/70 via-forest-deep/40 to-forest-deep" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/80 via-transparent to-transparent" />
        <div className="grain absolute inset-0" aria-hidden />

        <Container className="relative flex min-h-[100svh] flex-col justify-end pb-16 pt-40 sm:pb-24">
          <div className="max-w-4xl">
            <Eyebrow light className="animate-fade-up">
              Personal trainer & naturopath · Montréal
            </Eyebrow>
            <Heading as="h1" light className="animate-fade-up delay-1">
              Build a body that{" "}
              <em className="font-light italic text-sage">looks</em> strong and{" "}
              <em className="font-light italic text-sage">feels</em> alive.
            </Heading>
            <Lead light className="mt-8 max-w-2xl animate-fade-up delay-2">
              Strength training and naturopathic care, combined into one plan. For busy
              Montrealers who want a better physique, more energy and habits that
              finally stick.
            </Lead>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-up delay-3">
              <Button href="/contact" variant="light" size="lg">
                Book a free discovery call <Arrow />
              </Button>
              <Button href="/services" variant="outline-light" size="lg">
                Explore services
              </Button>
            </div>
          </div>

          <dl className="mt-20 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-cream/15 pt-10 sm:grid-cols-4 animate-fade-up delay-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-sage">{s.label}</dt>
                <dd className="font-display text-4xl font-medium text-cream sm:text-5xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ---------- Intro / philosophy ---------- */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-12">
            <div className="relative lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-soft">
                <Image
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80"
                  alt="Calm stretch in morning light"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-4 max-w-[260px] rounded-3xl bg-forest p-6 text-cream shadow-soft sm:-right-10">
                <p className="font-display text-lg leading-snug">
                  “A strong body isn’t built in the gym alone. It’s built in how you eat,
                  sleep and recover.”
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-sage">
                  {site.owner}
                </p>
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <Eyebrow>The Racine approach</Eyebrow>
              <Heading>
                Two disciplines.{" "}
                <em className="font-light italic text-moss">One coherent plan.</em>
              </Heading>
              <Lead className="mt-6">
                Most trainers program your workouts. Most naturopaths talk about your
                digestion. Few look at both, together, as one system.
              </Lead>
              <p className="mt-5 leading-relaxed text-stone">
                That’s the gap I built Racine to close. As a certified personal trainer and
                naturopath, I design your strength training, nutrition and natural health
                protocol as a single plan, so every piece supports the others and nothing
                works against you.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Evidence-based strength programming",
                  "Root-cause naturopathic assessment",
                  "Nutrition you can sustain",
                  "Sleep, stress & recovery coaching",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-forest">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-clay" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button href="/about" variant="ghost">
                  Meet {site.owner.split(" ")[0]} <Arrow />
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- Services ---------- */}
      <section className="bg-sand/50 py-24 sm:py-32">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow="Services"
              title={
                <>
                  Everything you need,{" "}
                  <em className="font-light italic text-moss">nothing you don’t.</em>
                </>
              }
              lead="Choose one service or combine them. Every path starts with a conversation about your goals."
            />
            <Button href="/services" variant="ghost" className="shrink-0">
              All services <Arrow />
            </Button>
          </div>
          <div className="mt-16">
            <ServicesGrid />
          </div>
        </Container>
      </section>

      {/* ---------- Process ---------- */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeader
            eyebrow="How it works"
            align="center"
            title="A clear path from first call to lasting results"
          />
          <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-sand-dark/60 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <li
                key={p.step}
                className={`relative bg-cream p-8 transition hover:bg-white animate-fade-up delay-${i + 1}`}
              >
                <span className="font-display text-5xl font-light text-sand-dark">{p.step}</span>
                <h3 className="mt-6 font-display text-2xl font-medium text-forest">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-stone">{p.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Testimonials />

      {/* ---------- Latest videos ---------- */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow="From the studio"
              title="Latest videos"
              lead="Short, practical lessons on training, nutrition and natural health. New episodes most weeks."
            />
            <Button href="/videos" variant="ghost" className="shrink-0">
              Watch all videos <Arrow />
            </Button>
          </div>
          <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((v, i) => (
              <VideoCard key={v.slug} video={v} index={i} />
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- FAQ teaser ---------- */}
      <section className="bg-sand/50 py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeader
                eyebrow="Questions"
                title="Good to know before you start"
                lead="A few of the things people ask most. The full list lives on the FAQ page."
              />
              <Link
                href="/faq"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-clay"
              >
                See all questions <Arrow />
              </Link>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FAQList items={faqs.slice(0, 4)} />
            </div>
          </div>
        </Container>
      </section>

      <CTA />
    </>
  );
}
