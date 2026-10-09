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
  hero: "/images/massage.jpg",
  portrait: "/images/portrait.jpg",
};
