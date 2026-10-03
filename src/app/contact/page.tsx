import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Container, Eyebrow, Heading, Lead } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { Clock, Mail, MapPin, Phone } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description: `Book a free discovery call with ${site.owner}, personal trainer and naturopath in the Plateau, Montréal. Studio hours, address and contact form.`,
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-sand bg-sand/40 pt-36 pb-20 sm:pt-44 sm:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full bg-sage/30 blur-3xl"
        />
        <Container className="relative">
          <div className="grid gap-16 lg:grid-cols-12">
            {/* Left: intro + details */}
            <div className="lg:col-span-5">
              <Eyebrow className="animate-fade-up">Contact</Eyebrow>
              <Heading as="h1" className="animate-fade-up delay-1">
                Let’s start with a{" "}
                <em className="font-light italic text-moss">conversation.</em>
              </Heading>
              <Lead className="mt-7 animate-fade-up delay-2">
                Tell me where you are and where you want to be. I’ll reply within one business day
                to set up a free 20-minute discovery call, in French or English.
              </Lead>

              <ul className="mt-12 space-y-7 animate-fade-up delay-3">
                <Detail icon={MapPin} label="Studio">
                  <a href={site.mapsLink} target="_blank" rel="noreferrer" className="hover:text-clay">
                    {site.address.street}
                    <br />
                    {site.address.city}, {site.address.region} {site.address.postal}
                  </a>
                  <span className="mt-1 block text-sm text-stone">
                    Plateau-Mont-Royal · 4 min from Mont-Royal metro
                  </span>
                </Detail>
                <Detail icon={Phone} label="Phone">
                  <a href={site.phoneHref} className="hover:text-clay">
                    {site.phone}
                  </a>
                </Detail>
                <Detail icon={Mail} label="Email">
                  <a href={`mailto:${site.email}`} className="hover:text-clay">
                    {site.email}
                  </a>
                </Detail>
                <Detail icon={Clock} label="Hours">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                    {site.hours.map((h) => (
                      <div key={h.day} className="contents">
                        <dt className="text-stone">{h.day}</dt>
                        <dd className="font-medium">{h.time}</dd>
                      </div>
                    ))}
                  </dl>
                </Detail>
              </ul>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-7">
              <div className="relative rounded-[2.5rem] bg-cream p-6 shadow-soft sm:p-10 animate-fade-up delay-2">
                <h2 className="font-display text-2xl font-medium text-forest">Send a message</h2>
                <p className="mt-2 mb-8 text-sm text-stone">
                  All fields except phone are required. Your details stay private.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Map */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow>Find the studio</Eyebrow>
              <Heading as="h3">In the heart of the Plateau</Heading>
              <p className="mt-5 leading-relaxed text-stone">
                A private, fully equipped studio on Boulevard Saint-Laurent. Street parking and
                BIXI stations nearby. Buzz #302 when you arrive. Showers and towels provided.
              </p>
              <a
                href={site.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clay"
              >
                Open in Google Maps ↗
              </a>
            </div>
            <div className="lg:col-span-8">
              <div className="overflow-hidden rounded-[2.5rem] shadow-card">
                <iframe
                  title={`Map to ${site.name}`}
                  src={site.mapsEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[380px] w-full grayscale-[30%] sm:h-[460px]"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest text-sage">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">{label}</p>
        <div className="mt-1.5 leading-relaxed text-forest">{children}</div>
      </div>
    </li>
  );
}
