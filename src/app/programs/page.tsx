import type { Metadata } from "next";
import { programs } from "@/lib/content";
import { Arrow, Button, Check, Container, PageHero, SectionHeader } from "@/components/ui";
import { CTA, FAQList } from "@/components/sections";
import { faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Programs & Pricing",
  description:
    "Transparent pricing for personal training, naturopathy and online coaching programs in Montréal. Packages from 8 weeks to ongoing monthly coaching.",
};

const extras = [
  { name: "Single training session", price: "$95" },
  { name: "Naturopathic initial consultation (90 min)", price: "$180" },
  { name: "Naturopathic follow-up (45 min)", price: "$110" },
  { name: "Nutrition audit & plan", price: "$220" },
  { name: "Body composition scan", price: "$45" },
];

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs & pricing"
        title={
          <>
            Clear programs.{" "}
            <em className="font-light italic text-moss">Honest pricing.</em>
          </>
        }
        lead="Every program is personalized, but the structure and investment are transparent from day one. Naturopathic consultations may be reimbursable through your group insurance."
      />

      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {programs.map((p, i) => (
              <article
                key={p.name}
                className={`relative flex flex-col rounded-[2rem] p-8 sm:p-10 animate-fade-up delay-${i + 1} ${
                  p.highlighted
                    ? "bg-forest text-cream shadow-soft lg:-my-4 lg:py-14"
                    : "bg-white text-forest shadow-card"
                }`}
              >
                {p.highlighted && (
                  <span className="absolute right-8 top-8 rounded-full bg-clay px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-cream">
                    Most popular
                  </span>
                )}
                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${p.highlighted ? "text-sage" : "text-clay"}`}>
                  {p.duration}
                </p>
                <h2 className="mt-3 font-display text-3xl font-medium">{p.name}</h2>
                <p className={`mt-2 ${p.highlighted ? "text-sage" : "text-stone"}`}>{p.tagline}</p>
                <p className="mt-8 font-display text-4xl font-medium">{p.price}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium">
                      <Check className={p.highlighted ? "text-sage" : "text-moss"} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Button
                    href="/contact"
                    variant={p.highlighted ? "light" : "primary"}
                    className="w-full"
                  >
                    Start with {p.name} <Arrow />
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-stone">
            Prices in CAD, taxes extra. Payment plans available for all programs.
          </p>
        </Container>
      </section>

      <section className="bg-sand/50 py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeader
                eyebrow="À la carte"
                title="Prefer to start small?"
                lead="Book individual sessions or consultations without committing to a full program. Many clients begin here."
              />
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <dl className="divide-y divide-sand-dark/70 rounded-3xl bg-white/70 px-6 shadow-card sm:px-8">
                {extras.map((e) => (
                  <div key={e.name} className="flex items-center justify-between gap-6 py-5">
                    <dt className="font-medium text-forest">{e.name}</dt>
                    <dd className="font-display text-xl text-forest">{e.price}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeader eyebrow="Pricing questions" title="Common questions" />
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FAQList items={[faqs[3], faqs[4], faqs[6]]} />
            </div>
          </div>
        </Container>
      </section>

      <CTA />
    </>
  );
}
