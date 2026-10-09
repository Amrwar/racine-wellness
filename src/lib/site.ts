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
  /** 3D renders of hot massage stones; re-render from design/hero-stones-scene.html. */
  hero: {
    wide: { src: "/images/hero-stones-wide.webp", width: 2400, height: 1200 },
    tall: { src: "/images/hero-stones-tall.webp", width: 1200, height: 2000 },
  },
  portrait: "/images/portrait.jpg",
};
