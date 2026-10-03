export const site = {
  name: "Racine Wellness",
  tagline: "Train the body. Nourish the roots.",
  owner: "Alex Tremblay",
  credentials: "Certified Personal Trainer · Naturopath (N.D.)",
  description:
    "Montreal personal trainer and naturopath helping busy people build a stronger physique and a sustainable lifestyle through movement, nutrition and natural health.",
  url: "https://racine-wellness.vercel.app",
  email: "hello@racinewellness.ca",
  phone: "+1 (514) 555-0142",
  phoneHref: "tel:+15145550142",
  address: {
    street: "4210 Boulevard Saint-Laurent, Suite 302",
    city: "Montréal",
    region: "QC",
    postal: "H2W 1Z4",
    country: "CA",
  },
  mapsEmbed:
    "https://www.google.com/maps?q=4210+Boulevard+Saint-Laurent,+Montr%C3%A9al,+QC&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=4210+Boulevard+Saint-Laurent+Montr%C3%A9al+QC",
  hours: [
    { day: "Monday – Friday", time: "6:00 – 20:00" },
    { day: "Saturday", time: "8:00 – 14:00" },
    { day: "Sunday", time: "Closed" },
  ],
  socials: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    facebook: "https://facebook.com/",
  },
};

export const nav = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/programs", label: "Programs" },
  { href: "/videos", label: "Videos" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;
