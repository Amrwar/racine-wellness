/** Pricing shown on the home page and edited in /admin/pricing. Safe to import on the client. */

export type Rate = { minutes: number; price: number };
export type Bilingual = { en: string; fr: string };
export type PricedService = {
  id: string;
  title: Bilingual;
  text: Bilingual;
  rates: Rate[];
  /**
   * Fixed price per session; the length depends on the client. Has exactly one rate, whose minutes
   * are only the time reserved in the calendar (never shown to clients).
   */
  perSession?: boolean;
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
      title: { en: "Sports / Therapeutic Massage", fr: "Massage sportif / thérapeutique" },
      text: {
        en: "Specialized therapeutic techniques, including deep tissue work, fascial release, pressure points and passive stretching.",
        fr: "Des techniques thérapeutiques spécialisées, notamment le travail des tissus profonds, le relâchement fascial, les points de pression et les étirements passifs.",
      },
      rates: [
        { minutes: 60, price: 130 },
        { minutes: 90, price: 180 },
        { minutes: 120, price: 230 },
      ],
    },
    {
      id: "active-aging",
      title: { en: "Active Aging", fr: "Vieillissement actif" },
      text: {
        en: "Gentle, effective training to keep balance, strength and independence at every age. The length of each session is adapted to you.",
        fr: "Un entraînement doux et efficace pour garder équilibre, force et autonomie à tout âge. La durée de chaque séance est adaptée à vous.",
      },
      rates: [{ minutes: 60, price: 65 }],
      perSession: true,
    },
    {
      id: "fitness-coaching",
      title: { en: "Fitness and Healthy Lifestyle Coaching", fr: "Coaching forme physique et mode de vie sain" },
      text: {
        en: "Personalized coaching for strength, fitness and healthy habits, built around your level, goals and schedule. The length of each session is adapted to you.",
        fr: "Un coaching personnalisé pour la force, la forme physique et de saines habitudes, adapté à votre niveau, à vos objectifs et à votre horaire. La durée de chaque séance est adaptée à vous.",
      },
      rates: [{ minutes: 60, price: 80 }],
      perSession: true,
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
    const perSession = r.perSession === true;
    // A per-session price has a single rate (its minutes = time reserved in the calendar).
    const rawRates = Array.isArray(r.rates) ? r.rates.slice(0, perSession ? 1 : 8) : [];
    const rates = rawRates
      .map((x) => ({ minutes: Math.round(Number(x?.minutes)), price: Math.round(Number(x?.price) * 100) / 100 }))
      .filter((x) => x.minutes > 0 && x.minutes <= 600 && x.price >= 0 && x.price <= 10000);
    return {
      id: str(r.id, 40) || `service-${i + 1}`,
      title: bilingual(r.title, 120),
      text: bilingual(r.text, 600),
      rates,
      perSession,
      // Any unusable duration or price rejects the whole save rather than silently dropping it.
      invalid: rates.length !== rawRates.length,
    };
  });
  if (services.length === 0 || services.some((s) => s.invalid || !s.title.en || !s.title.fr || s.rates.length === 0)) {
    return null;
  }
  const valid = services.map((s) => ({ id: s.id, title: s.title, text: s.text, rates: s.rates, ...(s.perSession && { perSession: true }) }));
  return {
    promo: { enabled: promo.enabled === true, ...bilingual(promo, 160) },
    services: valid,
    homeVisits: bilingual(o.homeVisits, 300),
  };
}

/** Labels for prices (from the pricing strings of the dictionary). */
export type PriceLabels = { duration: string; perSession: string; perSessionTitle: string; from: string };

/** What a client sees for one rate: "60 min", or "Per session" for a fixed per-session price. */
export function rateLabel(s: Pick<PricedService, "perSession">, r: Rate, t: Pick<PriceLabels, "duration" | "perSessionTitle">) {
  return s.perSession ? t.perSessionTitle : t.duration.replace("{n}", String(r.minutes));
}

/** Short price summary for a service card: "$65 per session" or "From $100". */
export function priceSummary(s: PricedService, locale: "en" | "fr", t: PriceLabels) {
  if (!s.rates.length) return "";
  if (s.perSession) return `${formatPrice(s.rates[0].price, locale)} ${t.perSession}`;
  const min = Math.min(...s.rates.map((r) => r.price));
  return s.rates.length > 1 ? t.from.replace("{price}", formatPrice(min, locale)) : formatPrice(min, locale);
}

/** The treatment line in client emails: "Swedish massage, 60 min ($100)" or "Active Aging, per session ($65)". */
export function serviceLine(
  service: Pick<PricedService, "perSession"> | undefined,
  title: string,
  minutes: number,
  price: number,
  locale: "en" | "fr",
  perSessionWord: string,
) {
  return `${title}, ${service?.perSession ? perSessionWord : `${minutes} min`} (${formatPrice(price, locale)})`;
}

/** "$100" in English, "100 $" in French. */
export function formatPrice(price: number, locale: "en" | "fr") {
  const n = Number.isInteger(price) ? String(price) : price.toFixed(2);
  return locale === "fr" ? `${n.replace(".", ",")} $` : `$${n}`;
}
