export const site = {
  name: "HealthyZone",
  brand: { first: "Healthy", second: "Zone" },
  owner: "Ziad Bik",
  url: "https://healthyzone.vercel.app",
  email: "info@healthyzone.ca",
  phone: "(438) 274-5500",
  phoneHref: "tel:+14382745500",
  address: {
    city: "Saint-Laurent",
    region: "QC",
    country: "CA",
  },
  socials: {
    instagram: "https://www.instagram.com/healthyzone.ca/",
  },
};

/** In-page sections of the one-page site, in nav order. */
export const navSections = [
  { key: "services", id: "services" },
  { key: "about", id: "about" },
  { key: "contact", id: "contact" },
] as const;

export const images = {
  /** Ziad's treatment photo, cleaned and graded by design/hero-massage.py. */
  hero: {
    wide: { src: "/images/hero-massage-wide.webp", width: 2400, height: 1200 },
    square: { src: "/images/hero-massage-square.webp", width: 1200, height: 1200 },
  },

  portrait: "/images/portrait.jpg",
  /** Section backgrounds, built by design/section-photos.py. */
  sections: {
    services: "/images/section-training.webp",
    about: "/images/section-community.webp",
    contact: "/images/section-room.webp",
  },
};
