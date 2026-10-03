import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { site } from "@/lib/site";
import { Container, Eyebrow, Heading, Lead, Rich } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { Clock, Mail, MapPin, Phone } from "@/components/icons";
import { alternatesFor } from "../layout";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getDictionary(locale).meta.pages.contact;
  return { title: m.title, description: m.description, alternates: alternatesFor("/contact") };
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const c = t.contactPage;

  return (
    <>
      <section className="relative overflow-hidden border-b border-sand bg-sand/40 pt-36 pb-20 sm:pt-44 sm:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full bg-sage/30 blur-3xl"
        />
        <Container className="relative">
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow className="animate-fade-up">{c.eyebrow}</Eyebrow>
              <Heading as="h1" className="animate-fade-up delay-1">
                <Rich text={c.title} />
              </Heading>
              <Lead className="mt-7 animate-fade-up delay-2">{c.lead}</Lead>

              <ul className="mt-12 space-y-7 animate-fade-up delay-3">
                <Detail icon={MapPin} label={c.studio}>
                  <a href={site.mapsLink} target="_blank" rel="noreferrer" className="hover:text-clay">
                    {site.address.street}
                    <br />
                    {site.address.city}, {site.address.region} {site.address.postal}
                  </a>
                  <span className="mt-1 block text-sm text-stone">{c.studioNote}</span>
                </Detail>
                <Detail icon={Phone} label={c.phone}>
                  <a href={site.phoneHref} className="hover:text-clay">
                    {site.phone}
                  </a>
                </Detail>
                <Detail icon={Mail} label={c.email}>
                  <a href={`mailto:${site.email}`} className="hover:text-clay">
                    {site.email}
                  </a>
                </Detail>
                <Detail icon={Clock} label={c.hours}>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                    {t.hours.map((h) => (
                      <div key={h.day} className="contents">
                        <dt className="text-stone">{h.day}</dt>
                        <dd className="font-medium">{h.time}</dd>
                      </div>
                    ))}
                  </dl>
                </Detail>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="relative rounded-[2.5rem] bg-cream p-6 shadow-soft sm:p-10 animate-fade-up delay-2">
                <h2 className="font-display text-2xl font-medium text-forest">{c.formTitle}</h2>
                <p className="mt-2 mb-8 text-sm text-stone">{c.formNote}</p>
                <ContactForm t={t.form} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow>{c.mapEyebrow}</Eyebrow>
              <Heading as="h3">{c.mapTitle}</Heading>
              <p className="mt-5 leading-relaxed text-stone">{c.mapText}</p>
              <a
                href={site.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clay"
              >
                {t.common.openMaps}
              </a>
            </div>
            <div className="lg:col-span-8">
              <div className="overflow-hidden rounded-[2.5rem] shadow-card">
                <iframe
                  title={c.mapAlt}
                  src={`${site.mapsEmbed}&hl=${locale}`}
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
