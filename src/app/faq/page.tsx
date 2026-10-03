import type { Metadata } from "next";
import { faqs } from "@/lib/content";
import { Arrow, Button, Container, PageHero } from "@/components/ui";
import { CTA, FAQList } from "@/components/sections";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about personal training, naturopathy, insurance coverage, pricing and getting started in Montréal.",
};

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Questions,{" "}
            <em className="font-light italic text-moss">answered honestly.</em>
          </>
        }
        lead="If you don't find what you're looking for, send a message. I reply to every enquiry personally."
      />
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="sticky top-32 rounded-3xl bg-sand/60 p-8">
                <p className="font-display text-2xl font-medium text-forest">Still have a question?</p>
                <p className="mt-3 text-stone">
                  The fastest way to get an answer is a free discovery call.
                </p>
                <Button href="/contact" className="mt-6 w-full">
                  Get in touch <Arrow />
                </Button>
              </div>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FAQList />
            </div>
          </div>
        </Container>
      </section>
      <CTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
