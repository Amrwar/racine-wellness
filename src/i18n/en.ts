/** English dictionary. */
export const en = {
  nav: {
    services: "Services",
    pricing: "Pricing",
    about: "About",
    blog: "Blog",
    contact: "Contact",
  },
  header: {
    book: "Book a session",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchShort: "FR",
    switchTitle: "Voir le site en français",
    skip: "Skip to content",
    home: "HealthyZone home",
  },
  tagline: "Massage Therapy & Active Health Training",
  credentialsLine: "Registered Massage Therapist · Personal Trainer",
  meta: {
    titleDefault: "HealthyZone · Massage Therapy & Active Health Training in the West Island, Montréal",
    description:
      "Personalized massage therapy, posture correction, mobility and strength training with Ziad Bik, registered massage therapist and personal trainer. Based in Saint-Jean, West Island, with mobile sessions across Greater Montréal.",
    keywords: [
      "massage therapist West Island",
      "mobile massage Montreal",
      "posture correction Montreal",
      "personal trainer West Island",
      "active aging",
      "youth fitness",
    ],
    blog: {
      title: "Blog",
      description:
        "Practical articles on massage therapy, recovery, posture and mobility from Ziad Bik, registered massage therapist and personal trainer in the West Island, Montréal.",
    },
    privacy: {
      title: "Privacy Policy",
      description: "How HealthyZone collects, uses and protects your personal information.",
    },
  },
  og: { line1: "Personalized active health.", sub: "Massage therapy & training · West Island, QC" },

  hero: {
    eyebrow: "West Island · Greater Montréal",
    title: "Feel better. Move better. Stay active.",
    lead: "A unique, personalized experience adapted to your needs, at home or at work. Registered massage therapy and active-health coaching with Ziad Bik.",
    call: "Call us",
    book: "Book a session",
    imageAlt: "Ziad giving a back massage to a client on a treatment table",
  },

  services: {
    eyebrow: "Services",
    title: "Care tailored to your body",
    lead: "Every session starts with your goals and how you move today. Choose one service or combine them.",
    items: [
      {
        icon: "hands" as const,
        title: "Massage Therapy",
        text: "Therapeutic massage to relieve pain and tension, speed up recovery, improve blood circulation and help you relax. Insurance receipts provided.",
      },
      {
        icon: "posture" as const,
        title: "Posture Correction",
        text: "Assessment and targeted exercises to ease back and neck strain from desk work and daily habits.",
      },
      {
        icon: "mobility" as const,
        title: "Mobility",
        text: "Restore range of motion in stiff joints and move through your day with more freedom and less discomfort.",
      },
      {
        icon: "strength" as const,
        title: "Strength",
        text: "Progressive, safe strength training built around your level, injury history and schedule.",
      },
      {
        icon: "heart" as const,
        title: "Active Aging",
        text: "Gentle, effective training to keep balance, strength and independence at every age.",
      },
      {
        icon: "youth" as const,
        title: "Youth Fitness",
        text: "Supervised training that builds good movement habits, coordination and confidence in young athletes.",
      },
    ],
  },

  pricing: {
    eyebrow: "Pricing",
    title: "Massage therapy rates",
    lead: "Choose the treatment and duration that best suit your needs. Insurance receipts are provided for every massage session.",
    duration: "{n} min",
    book: "Book a session",
  },

  booking: {
    metaTitle: "Book a session",
    metaDescription:
      "Request a massage therapy appointment with Ziad Bik, registered massage therapist, at the Saint-Jean office in the West Island or at your home.",
    eyebrow: "Online booking",
    title: "Book a massage session",
    lead: "Choose your treatment, then a date and time that suit you. Ziad reviews each request and confirms your appointment by email.",
    steps: ["Treatment", "Date and time", "Your details"],
    chooseService: "Choose a treatment",
    chooseDuration: "Session length",
    chooseDay: "Choose a date",
    chooseTime: "Available times",
    loading: "Loading available times…",
    noDays: "No times are open for online booking at the moment. Please contact us and we'll find a time that works for you.",
    pickDay: "Select a date to see the available times.",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    where: "Location",
    office: "At the office",
    officeNote: "Saint-Jean, West Island",
    home: "Home or workplace visit",
    homeNote: "A travel fee is added depending on your location.",
    address: "Address for the visit",
    addressPlaceholder: "Street, city, postal code",
    notes: "Anything Ziad should know (optional)",
    notesPlaceholder: "Areas of tension, injuries, health conditions or preferences.",
    email: "Email",
    summary: "Your appointment",
    change: "Change",
    back: "Back",
    next: "Continue",
    submit: "Request this appointment",
    sending: "Sending…",
    pendingNote: "Your appointment is confirmed once Ziad has reviewed your request.",
    successTitle: "Request received",
    success: "Thank you {name}. Your request for {when} has been sent. You'll receive an email once Ziad confirms your appointment.",
    taken: "That time has just been booked. Please choose another time.",
    errors: {
      address: "Please enter the address for the visit.",
      slot: "Please choose a treatment, a date and a time.",
    },
    emails: {
      requestSubject: "Your HealthyZone appointment request",
      request:
        "Hello {name},\n\nThank you for your request. Here are the details:\n\n{when}\n{service}\n{where}\n\nZiad will review your request and confirm your appointment by email. If you have any questions, call {phone} or reply to this email.\n\nHealthyZone",
      confirmedSubject: "Your HealthyZone appointment is confirmed",
      confirmed:
        "Hello {name},\n\nYour appointment is confirmed:\n\n{when}\n{service}\n{where}\n\nIf you need to change or cancel it, call {phone} or reply to this email.\n\nSee you soon,\nZiad, HealthyZone",
      declinedSubject: "About your HealthyZone appointment request",
      declined:
        "Hello {name},\n\nUnfortunately, the time you requested ({when}) is not available. Please choose another time at {link} or call {phone}, and we'll find a time that suits you.\n\nHealthyZone",
      cancelledSubject: "Your HealthyZone appointment has been cancelled",
      cancelled:
        "Hello {name},\n\nYour appointment on {when} has been cancelled. To book a new time, visit {link} or call {phone}.\n\nHealthyZone",
      updatedSubject: "Your HealthyZone appointment has been updated",
      updated:
        "Hello {name},\n\nYour appointment details have been updated:\n\n{when}\n{service}\n{where}\n\nIf you have any questions, call {phone} or reply to this email.\n\nHealthyZone",
      reminderSubject: "Reminder: your HealthyZone appointment tomorrow",
      reminder:
        "Hello {name},\n\nThis is a reminder of your appointment tomorrow:\n\n{when}\n{service}\n{where}\n\nIf you need to change or cancel it, please call {phone} or reply to this email as soon as possible.\n\nSee you soon,\nZiad, HealthyZone",
    },
  },

  about: {
    eyebrow: "About",
    title: "Hi, I'm Ziad",
    text1:
      "I'm a registered massage therapist and personal trainer based in Montréal's West Island. I help people relieve pain, correct their posture and stay strong and active, whatever their age.",
    text2:
      "I come to you with everything needed for treatment or training, at home, at the office or at your gym, and I build each plan around your body and your schedule.",
    portraitAlt: "Portrait of Ziad, massage therapist and personal trainer",
    credentials: [
      "Registered Massage Therapist · RMQ member",
      "Certified Personal Trainer",
      "Mobile service across Greater Montréal",
      "Insurance receipts available",
    ],
  },

  contact: {
    eyebrow: "Contact",
    title: "Book a session or ask a question",
    lead: "Send a message and I'll get back to you within one business day.",
    phone: "Phone",
    email: "Email",
    area: "Office",
    office: "Saint-Jean, West Island",
    areaNote: "Mobile service across Greater Montréal",
    formTitle: "Send a message",
  },

  form: {
    name: "Full name",
    namePlaceholder: "Marie Tremblay",
    email: "Email (optional)",
    emailPlaceholder: "you@example.com",
    phone: "Phone",
    phonePlaceholder: "+1 438 225 8859",
    message: "Message (optional)",
    messagePlaceholder: "How can I help? Tell me about your goals or any pain you're dealing with.",
    receipt: "I'd like an insurance receipt",
    receiptNote: "Insurance receipts available",
    consent: "By submitting, you agree to be contacted about your enquiry. Your information is never shared.",
    submit: "Send message",
    sending: "Sending…",
    successTitle: "Message received",
    success: "Thanks {name}! Your message is on its way. Expect a reply within one business day.",
    fixFields: "Please fix the highlighted fields.",
    required: "required",
    failed: "Something went wrong sending your message. Please email {email} directly.",
    errors: {
      name: "Please enter your name.",
      phone: "Please enter a valid phone number.",
      email: "Please enter a valid email address.",
    },
  },

  blog: {
    eyebrow: "The HealthyZone blog",
    title: "Notes on moving and feeling better",
    lead: "Practical, no-nonsense articles on massage therapy, recovery, posture and mobility, written by Ziad.",
    featured: "Featured",
    readArticle: "Read article",
    minRead: "{n} min read",
    by: "By",
    author: "Ziad",
    authorRole: "Registered Massage Therapist · Personal Trainer",
    authorBio:
      "Ziad is a registered massage therapist (RMQ) and personal trainer in Montréal's West Island. He treats clients at home, at work and at the gym across Greater Montréal.",
    backToBlog: "All articles",
    related: "Keep reading",
    latestEyebrow: "From the blog",
    latestTitle: "Tips for a body that feels better",
    viewAll: "View all articles",
    ctaTitle: "Ready to feel the difference?",
    ctaText: "Book a session at home, at work or at the gym. We'll start with your goals and build from there.",
    ctaButton: "Book a session",
    disclaimer:
      "This article is for general information and isn't a substitute for medical advice. If you have pain, an injury or a health condition, consult a qualified health professional.",
  },

  footer: {
    rights: "All rights reserved.",
    privacy: "Privacy policy",
  },

  privacy: {
    eyebrow: "Legal",
    title: "Privacy policy",
    updated: "Last updated October 2026.",
    intro:
      "HealthyZone (“we”, “us”) respects your privacy and complies with Québec's Act respecting the protection of personal information in the private sector (Law 25) and Canada's PIPEDA. This policy explains what we collect, why, and your rights.",
    sections: [
      {
        title: "What we collect",
        items: [
          "Contact details you submit through our contact form (name, email, phone).",
          "Information you share about your goals, health and lifestyle during sessions.",
        ],
      },
      {
        title: "How we use it",
        text: "To respond to your enquiry, deliver massage therapy and training services, issue receipts, and send you information you have requested. We never sell your data and never share health information without your explicit consent, except as required by law.",
      },
      {
        title: "Storage and security",
        text: "Client records are stored in secure, access-controlled systems. Contact form submissions are transmitted over HTTPS and delivered to our business email.",
      },
      {
        title: "Your rights",
        text: "You may request access to, correction of, or deletion of your personal information at any time by emailing {email}. Our privacy officer is Ziad Bik.",
      },
      {
        title: "Cookies",
        text: "This site uses only strictly necessary cookies.",
      },
    ],
  },

  pricingPage: {
    metaTitle: "Pricing & services",
    metaDescription:
      "Massage therapy rates in the West Island, Montréal: Swedish relaxation and therapeutic massage, 60 to 120 minutes. Insurance receipts provided for every massage.",
    eyebrow: "Pricing & services",
    title: "Simple, transparent pricing.",
    lead: "Choose your treatment, then the length of your session. Sessions take place at the Saint-Jean office or at your home, and an insurance receipt is provided for every massage.",
    highlights: ["Insurance receipts provided", "Office in Saint-Jean, West Island", "Home visits across Greater Montréal", "Sessions adapted to your needs"],
    choose: "Choose a treatment",
    perSession: "per session",
    select: "Book {n} min",
    included: ["Insurance receipt provided", "At the office or at your home", "Adapted to your needs and goals"],
    compareEyebrow: "All rates",
    compareTitle: "Every treatment at a glance",
    compareLead: "Prices per session, by treatment and length.",
    treatment: "Treatment",
    stepsEyebrow: "How booking works",
    stepsTitle: "Book online in four steps",
    stepsLead: "Request your appointment in a few minutes. Ziad confirms every request personally.",
    steps: [
      { title: "Choose your treatment", text: "Pick a massage and the length of your session." },
      { title: "Pick a date and time", text: "See the times that are open and choose the one that suits you." },
      { title: "Add your details", text: "Tell us where the session takes place and anything Ziad should know." },
      { title: "Ziad confirms", text: "Ziad reviews your request and confirms your appointment by email." },
    ],
    insuranceEyebrow: "Insurance",
    insuranceTitle: "Insurance receipts for every massage",
    insuranceText:
      "Ziad is a registered massage therapist. After every massage session you receive a receipt you can submit to your insurance plan. Just check the box when you book.",
    ctaTitle: "Ready to book your session?",
    ctaText: "Choose a time online, or call us and we'll find a time that works for you.",
  },

  notFound: {
    title: "Page not found",
    lead: "The page you're looking for doesn't exist or has moved.",
    backHome: "Back to home",
  },
};

export type Dictionary = typeof en;
