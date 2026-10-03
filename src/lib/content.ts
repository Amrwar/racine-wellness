export type Service = {
  slug: string;
  title: string;
  short: string;
  description: string;
  includes: string[];
  image: string;
  icon: "dumbbell" | "leaf" | "bowl" | "laptop";
};

export const services: Service[] = [
  {
    slug: "personal-training",
    title: "Personal Training",
    short:
      "One-on-one strength and conditioning built around your body and your schedule.",
    description:
      "Every session is programmed for you: your goals, your injury history, your lifestyle. We focus on compound strength, mobility and conditioning so you look better, move better and stay pain-free for the long term.",
    includes: [
      "Movement & posture assessment",
      "Personalized periodized program",
      "In-studio sessions in the Plateau",
      "Progress tracking & body composition check-ins",
    ],
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80",
    icon: "dumbbell",
  },
  {
    slug: "naturopathy",
    title: "Naturopathic Consultations",
    short:
      "Address the root causes of fatigue, digestion, stress and hormonal imbalances.",
    description:
      "A thorough health intake looking at sleep, digestion, stress, energy and nutrition. You leave with a clear, natural plan of botanicals, supplementation, lifestyle and dietary changes that supports your body instead of fighting it.",
    includes: [
      "90-minute initial consultation",
      "Personalized natural health protocol",
      "Supplement & botanical guidance",
      "Follow-up adjustments every 4–6 weeks",
    ],
    image:
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1400&q=80",
    icon: "leaf",
  },
  {
    slug: "nutrition-coaching",
    title: "Nutrition & Lifestyle Coaching",
    short: "Simple, whole-food eating that fits your life. No crash diets.",
    description:
      "We build a way of eating you can actually maintain: realistic meals, grocery strategies, eating out, and habits for sleep and stress. Designed to support your training and long-term physique goals.",
    includes: [
      "Nutrition audit & macro targets",
      "Weekly habit-based coaching",
      "Grocery lists & meal templates",
      "Sleep, stress & recovery strategies",
    ],
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80",
    icon: "bowl",
  },
  {
    slug: "online-coaching",
    title: "Online Coaching",
    short:
      "Full coaching from anywhere in Québec: programming, nutrition and weekly check-ins.",
    description:
      "Get the complete Racine approach remotely. Your training is delivered through an app with video demos, your nutrition is adjusted weekly, and we meet by video call to review progress and keep you accountable.",
    includes: [
      "App-based training with video demos",
      "Weekly video check-ins",
      "Nutrition adjustments & habit tracking",
      "Direct messaging support",
    ],
    image:
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1400&q=80",
    icon: "laptop",
  },
];

export const programs = [
  {
    name: "Foundations",
    duration: "8 weeks",
    price: "From $890",
    tagline: "Learn to train and eat for life.",
    features: [
      "2 training sessions / week",
      "Initial naturopathic intake",
      "Nutrition fundamentals plan",
      "Bi-weekly check-ins",
    ],
    highlighted: false,
  },
  {
    name: "Transformation",
    duration: "12 weeks",
    price: "From $1,590",
    tagline: "Our most popular program for a visible physique change.",
    features: [
      "3 training sessions / week",
      "Full naturopathic protocol",
      "Weekly nutrition coaching",
      "Body composition tracking",
      "Priority scheduling",
    ],
    highlighted: true,
  },
  {
    name: "Online Coaching",
    duration: "Monthly",
    price: "$249 / month",
    tagline: "Everything remote, fully personalized.",
    features: [
      "Custom app-based programming",
      "Weekly video check-in",
      "Nutrition adjustments",
      "Messaging support",
    ],
    highlighted: false,
  },
];

export const testimonials = [
  {
    quote:
      "I came in exhausted with constant bloating and no energy to train. Six months later I've lost 11 kg, I sleep through the night and I actually enjoy lifting. Alex looks at the whole picture.",
    name: "Marie-Ève L.",
    detail: "Plateau-Mont-Royal · Transformation program",
  },
  {
    quote:
      "Finally a trainer who doesn't just count reps. The naturopathic side changed how I eat and recover. My back pain is gone and my deadlift is at 140 kg.",
    name: "Jonathan R.",
    detail: "Rosemont · Personal training",
  },
  {
    quote:
      "The online coaching works. Clear plan, honest feedback every week, and adjustments when life gets busy. Down two dress sizes without feeling deprived.",
    name: "Sophie D.",
    detail: "Laval · Online coaching",
  },
];

export const faqs = [
  {
    q: "What is a naturopath, and how is it different from a doctor?",
    a: "A naturopath looks at nutrition, lifestyle, stress, sleep and natural therapies to support your body's own ability to heal and perform. It complements, but does not replace, your physician's care. I never ask you to stop a prescribed treatment, and I'm happy to coordinate with your doctor.",
  },
  {
    q: "I've never trained before. Is this for me?",
    a: "Absolutely. Most of my clients are busy professionals, not athletes. Every program starts with an assessment and progresses at your pace.",
  },
  {
    q: "Where do sessions take place?",
    a: "In-person sessions happen at a private studio on Boulevard Saint-Laurent in the Plateau, a few minutes from Mont-Royal metro. Online coaching is available anywhere in Québec and beyond.",
  },
  {
    q: "Are your services covered by insurance?",
    a: "Many group insurance plans in Québec reimburse naturopathic consultations. I'm a member of a recognized naturopathic association and provide receipts you can submit. Check your plan for the exact coverage.",
  },
  {
    q: "How soon will I see results?",
    a: "Most clients notice better energy and sleep within 2–3 weeks. Visible physique changes typically appear around weeks 6–8 with consistent training and nutrition.",
  },
  {
    q: "Do you offer services in French?",
    a: "Oui, bien sûr. All consultations, training and coaching are available in French or English.",
  },
  {
    q: "How do I get started?",
    a: "Book a free 20-minute discovery call through the contact page. We'll talk about your goals and I'll recommend the right starting point, with no pressure.",
  },
];

export const stats = [
  { value: "10+", label: "Years coaching" },
  { value: "400+", label: "Clients transformed" },
  { value: "2", label: "Disciplines, one plan" },
  { value: "FR / EN", label: "Bilingual service" },
];

export const process = [
  {
    step: "01",
    title: "Discovery call",
    text: "A free 20-minute conversation about your goals, history and schedule. We decide together if we're a fit.",
  },
  {
    step: "02",
    title: "Full assessment",
    text: "Movement screen, body composition and a naturopathic health intake covering sleep, digestion, stress and nutrition.",
  },
  {
    step: "03",
    title: "Your personal plan",
    text: "A training program, nutrition framework and natural health protocol built as one coherent system.",
  },
  {
    step: "04",
    title: "Coach, measure, adjust",
    text: "Weekly coaching and regular check-ins. We track what matters and refine the plan as your body changes.",
  },
];
