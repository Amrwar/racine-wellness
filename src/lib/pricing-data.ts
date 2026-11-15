/** Pricing shown on the home page and edited in /admin/pricing. Safe to import on the client. */

export type Rate = { minutes: number; price: number };
export type Bilingual = { en: string; fr: string };
export type PricedService = {
  id: string;
  title: Bilingual;
  text: Bilingual;
  rates: Rate[];
};
export type Pricing = {
  promo: { enabled: boolean } & Bilingual;
  services: PricedService[];
  homeVisits: Bilingual;
};

export const defaultPricing: Pricing = {
  promo: { enabled: true, en: "10% off your first session", fr: "10 % de rabais sur votre première séance" },
  services: [
    {
      id: "swedish",
      title: { en: "Swedish Relaxation Massage", fr: "Massage suédois de détente" },
      text: {
        en: "A relaxation massage of the back, neck, legs (front and back), arms and feet.",
        fr: "Un massage de détente du dos, du cou, des jambes (avant et arrière), des bras et des pieds.",
      },
      rates: [
        { minutes: 60, price: 100 },
        { minutes: 90, price: 135 },
        { minutes: 120, price: 170 },
      ],
    },
    {
      id: "therapeutic",
      title: { en: "Therapeutic Massage", fr: "Massage thérapeutique" },
      text: {
        en: "Specialized therapeutic techniques, including deep tissue work, fascial release, pressure points and passive stretching.",
        fr: "Des techniques thérapeutiques spécialisées, notamment le travail des tissus profonds, le relâchement fascial, les points de pression et les étirements passifs.",
      },
      rates: [
        { minutes: 60, price: 135 },
        { minutes: 90, price: 180 },
        { minutes: 120, price: 230 },
      ],
    },
  ],
  homeVisits: {
    en: "Home visits: a travel fee is added depending on your location.",
    fr: "Visites à domicile : des frais de déplacement s'ajoutent selon votre emplacement.",
  },
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bilingual = (v: unknown, max: number): Bilingual => {
  const o = (v ?? {}) as Record<string, unknown>;
  return { en: str(o.en, max), fr: str(o.fr, max) };
};

/** Validates untrusted input (the admin form or the database). Returns null when unusable. */
export function parsePricing(input: unknown): Pricing | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const promo = (o.promo ?? {}) as Record<string, unknown>;
  const services = (Array.isArray(o.services) ? o.services : []).slice(0, 12).map((s, i) => {
    const r = (s ?? {}) as Record<string, unknown>;
    const rawRates = Array.isArray(r.rates) ? r.rates.slice(0, 8) : [];
    const rates = rawRates
      .map((x) => ({ minutes: Math.round(Number(x?.minutes)), price: Math.round(Number(x?.price) * 100) / 100 }))
      .filter((x) => x.minutes > 0 && x.minutes <= 600 && x.price >= 0 && x.price <= 10000);
    return {
      id: str(r.id, 40) || `service-${i + 1}`,
      title: bilingual(r.title, 120),
      text: bilingual(r.text, 600),
      rates,
      // Any unusable duration or price rejects the whole save rather than silently dropping it.
      invalid: rates.length !== rawRates.length,
    };
  });
  if (services.length === 0 || services.some((s) => s.invalid || !s.title.en || !s.title.fr || s.rates.length === 0)) {
    return null;
  }
  const valid = services.map((s) => ({ id: s.id, title: s.title, text: s.text, rates: s.rates }));
  return {
    promo: { enabled: promo.enabled === true, ...bilingual(promo, 160) },
    services: valid,
    homeVisits: bilingual(o.homeVisits, 300),
  };
}

/** "$100" in English, "100 $" in French. */
export function formatPrice(price: number, locale: "en" | "fr") {
  const n = Number.isInteger(price) ? String(price) : price.toFixed(2);
  return locale === "fr" ? `${n.replace(".", ",")} $` : `$${n}`;
}
