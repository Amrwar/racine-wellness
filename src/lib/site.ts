export const site = {
  name: "HealthyZone",
  brand: { first: "Healthy", second: "Zone" },
  owner: "Ziad Bik",
  url: "https://healthyzone.vercel.app",
  email: "info@healthyzone.ca",
  phone: "+1 (438) 225-8859",
  phoneHref: "tel:+14382258859",
  address: {
    city: "Saint-Laurent",
    region: "QC",
    country: "CA",
  },
  socials: {
    instagram: "https://www.instagram.com/healthyzone.ca/",
  },
};

/** Navigation, in order: home-page sections (`section`) and separate pages (`page`). */
export const navItems = [
  { key: "services", section: "services" },
  { key: "about", section: "about" },
  { key: "blog", page: "/blog" },
  { key: "contact", section: "contact" },
] as const;

export type NavItem = (typeof navItems)[number];

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
