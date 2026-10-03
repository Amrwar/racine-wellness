import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/lib/site";
import { Arrow, Button, Container, Eyebrow, Heading, Lead, PageHero, SectionHeader } from "@/components/ui";
import { CTA } from "@/components/sections";

export const metadata: Metadata = {
  title: "About",
  description: `Meet ${site.owner}, certified personal trainer and naturopath in Montréal. Learn about the philosophy behind ${site.name}.`,
};

const values = [
  {
    title: "Root causes, not symptoms",
    text: "Fatigue, cravings and plateaus have reasons. We find them and fix them at the source instead of masking them.",
  },
  {
    title: "Strength as the foundation",
    text: "Muscle is the organ of longevity. Progressive strength training anchors every plan, whatever your age or starting point.",
  },
  {
    title: "Sustainable over extreme",
    text: "No 1,200-calorie diets, no two-hour sessions. Small, consistent changes you can actually keep for years.",
  },
  {
    title: "Evidence first, nature always",
    text: "Natural doesn't mean unscientific. Every recommendation is grounded in current research and clinical experience.",
  },
];

const credentials = [
  "Certified Personal Trainer (CSEP-CPT)",
  "Diploma in Naturopathy (N.D.), 4-year program",
  "Precision Nutrition Level 2 Coach",
  "Functional Movement Screen (FMS) certified",
  "Member, Association des Naturopathes Agréés du Québec",
  "First Aid & CPR-C certified",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            Hi, I’m {site.owner.split(" ")[0]}.{" "}
            <em className="font-light italic text-moss">Trainer. Naturopath. Montrealer.</em>
          </>
        }
        lead="For over ten years I've helped people in this city get stronger, leaner and healthier without turning their lives upside down."
      />

      {/* Story */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="sticky top-32">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-soft">
                  <Image
                    src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1400&q=80"
                    alt={`${site.owner}, personal trainer and naturopath`}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-6 rounded-3xl bg-sand/60 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Credentials</p>
                  <ul className="mt-4 space-y-2.5 text-sm text-forest">
                    {credentials.map((c) => (
                      <li key={c} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="prose-site lg:col-span-6 lg:col-start-7">
              <Eyebrow>My story</Eyebrow>
              <Heading>From burned-out athlete to whole-person coach</Heading>
              <p className="mt-8">
                I started as a competitive rugby player who trained hard, ate badly and slept worse.
                By 24 I was strong on paper but exhausted, inflamed and injured every season. The
                fix wasn’t more training. It was understanding what my body actually needed to recover.
              </p>
              <p>
                That search led me to naturopathic medicine. Four years of study later, I had a new
                lens: the body is a system, and performance, physique and health are the same project
                seen from different angles. I’ve coached from that principle ever since.
              </p>
              <h2>Who I work with</h2>
              <p>
                Mostly busy professionals, parents and people in their 30s to 60s who are tired of
                programs that ignore the rest of their lives. Some want to lose fat. Some want to get
                strong. Many just want their energy back. Almost everyone wants a plan they can trust.
              </p>
              <h2>How I work</h2>
              <p>
                Every client starts with a full assessment: how you move, how you eat, how you sleep,
                how you handle stress. From that we build one plan with three pillars, training,
                nutrition and natural health, and refine it every week based on what your body tells us.
              </p>
              <p>
                Sessions happen at my private studio in the Plateau or online. I coach in French and
                English, and I work closely with physicians, physiotherapists and osteopaths when it
                helps you.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button href="/contact">
                  Book a free call <Arrow />
                </Button>
                <Button href="/videos" variant="ghost">
                  Watch my videos
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="bg-forest py-24 text-cream sm:py-32">
        <Container>
          <SectionHeader
            light
            eyebrow="What I believe"
            title="Four principles behind every plan"
          />
          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-cream/10 sm:grid-cols-2">
            {values.map((v, i) => (
              <div key={v.title} className={`bg-forest p-8 sm:p-10 animate-fade-up delay-${i + 1}`}>
                <span className="font-display text-4xl font-light text-sage/60">0{i + 1}</span>
                <h3 className="mt-5 font-display text-2xl font-medium">{v.title}</h3>
                <Lead light className="mt-3 text-base sm:text-base">{v.text}</Lead>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTA />
    </>
  );
}
