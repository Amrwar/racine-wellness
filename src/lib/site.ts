export const site = {
  name: "HealthyZone",
  brand: { first: "Healthy", second: "Zone" },
  owner: "Ziad",
  url: "https://healthyzone.vercel.app",
  email: "info@healthyzone.ca",
  phone: "+1 (514) 555-0142",
  phoneHref: "tel:+15145550142",
  address: {
    street: "4210 Boulevard Saint-Laurent, Suite 302",
    city: "Montréal",
    region: "QC",
    postal: "H2W 1Z4",
    country: "CA",
  },
  geo: { latitude: 45.5176, longitude: -73.5826 },
  mapsEmbed:
    "https://www.google.com/maps?q=4210+Boulevard+Saint-Laurent,+Montr%C3%A9al,+QC&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=4210+Boulevard+Saint-Laurent+Montr%C3%A9al+QC",
  socials: {
    instagram: "https://www.instagram.com/healthyzone.ca/",
    youtube: "https://youtube.com/",
    facebook: "https://facebook.com/",
  },
};

export const navPaths = [
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "programs", href: "/programs" },
  { key: "videos", href: "/videos" },
  { key: "faq", href: "/faq" },
  { key: "contact", href: "/contact" },
] as const;

export type NavKey = (typeof navPaths)[number]["key"];

/** Site-wide photography. Replace with the studio's own photos in /public/images. */
export const images = {
  hero: "/images/hero.jpg",
  intro: "/images/community.jpg",
  portrait: "/images/portrait.jpg",
  coaching: "/images/coaching.jpg",
};
