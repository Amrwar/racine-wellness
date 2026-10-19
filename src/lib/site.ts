export const site = {
  name: "HealthyZone",
  brand: { first: "Healthy", second: "Zone" },
  owner: "Ziad Bik",
  url: "https://www.healthyzone.ca",
  email: "info@healthyzone.ca",
  phone: "+1 (438) 225-8859",
  phoneHref: "tel:+14382258859",
  address: {
    city: "Saint-Jean, West Island",
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
  /** Hero background: bare trees against the sky, in black and white. */
  hero: "/images/hero-trees.webp",

  portrait: "/images/portrait.jpg",
  /** Section backgrounds, built by design/section-photos.py. */
  sections: {
    services: "/images/section-beach.webp",
    about: "/images/section-beach-bw.webp",
    blog: "/images/section-riverbank.webp",
    contact: "/images/section-room.webp",
  },
};
