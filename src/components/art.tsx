/**
 * Decorative 3D-style shapes (glossy orbs, a torus ring and capsules) rendered as SVG in
 * the brand palette, plus one composition per page section. Purely decorative: every
 * shape is aria-hidden and ignores pointer events. Each primitive needs a unique `id`
 * because SVG gradient ids are document-global.
 */

const C = {
  navy: "#004575",
  navyDeep: "#00304f",
  blue: "#009ffb",
  green: "#00ee81",
};

type Tone = "blue" | "green" | "navy" | "brand";

const toneStops: Record<Tone, [string, string]> = {
  blue: ["#4cc0ff", "#0077c0"],
  green: ["#5cf7ad", "#00b865"],
  navy: ["#1f6fa8", C.navyDeep],
  brand: [C.blue, C.green],
};

type ShapeProps = { id: string; tone?: Tone; className?: string; style?: React.CSSProperties };

/** Glossy sphere: base colour, soft core shadow, coloured rim light and a specular highlight. */
export function Orb({ id, tone = "blue", className = "", style }: ShapeProps) {
  const [light, dark] = toneStops[tone];
  return (
    <svg viewBox="0 0 200 200" className={`pointer-events-none ${className}`} style={style} aria-hidden>
      <defs>
        <linearGradient id={`${id}-base`} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`${id}-shade`} cx="0.68" cy="0.75" r="0.75">
          <stop offset="0" stopColor={C.navyDeep} stopOpacity="0" />
          <stop offset="0.6" stopColor={C.navyDeep} stopOpacity="0.15" />
          <stop offset="1" stopColor={C.navyDeep} stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id={`${id}-rim`} cx="0.78" cy="0.85" r="0.5">
          <stop offset="0" stopColor={tone === "green" ? C.blue : C.green} stopOpacity="0.55" />
          <stop offset="1" stopColor={tone === "green" ? C.blue : C.green} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-spec`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#${id}-base)`} />
      <circle cx="100" cy="100" r="96" fill={`url(#${id}-shade)`} />
      <circle cx="100" cy="100" r="96" fill={`url(#${id}-rim)`} />
      <ellipse cx="68" cy="58" rx="34" ry="24" fill={`url(#${id}-spec)`} transform="rotate(-30 68 58)" />
      <circle cx="58" cy="50" r="7" fill="#fff" opacity="0.85" />
    </svg>
  );
}

/** Torus seen from slightly above: gradient body, shaded inner wall and a top highlight. */
export function Torus({ id, tone = "brand", className = "", style }: ShapeProps) {
  const [a, b] = toneStops[tone];
  return (
    <svg viewBox="0 0 400 260" className={`pointer-events-none ${className}`} style={style} aria-hidden>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0.2" x2="1" y2="0.8">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor={C.navyDeep} stopOpacity="0.1" />
          <stop offset="1" stopColor={C.navyDeep} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.navyDeep} stopOpacity="0.85" />
          <stop offset="0.55" stopColor={C.navy} stopOpacity="0.25" />
          <stop offset="1" stopColor={C.navy} stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-hole`}>
          <rect width="400" height="260" fill="#fff" />
          <ellipse cx="200" cy="116" rx="104" ry="46" fill="#000" />
        </mask>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-far`}>
          <rect x="90" y="68" width="220" height="96" fill={`url(#${id}-fade)`} />
        </mask>
        <clipPath id={`${id}-in`}>
          <ellipse cx="200" cy="116" rx="104" ry="46" />
        </clipPath>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g mask={`url(#${id}-hole)`}>
        <ellipse cx="200" cy="130" rx="192" ry="112" fill={`url(#${id}-body)`} />
        <ellipse cx="200" cy="130" rx="192" ry="112" fill={`url(#${id}-shade)`} />
        <ellipse
          cx="200"
          cy="104"
          rx="150"
          ry="72"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.55"
          strokeWidth="6"
          filter={`url(#${id}-soft)`}
        />
      </g>
      {/* Far inner wall, visible through the top of the hole; the rest stays see-through. */}
      <g clipPath={`url(#${id}-in)`} mask={`url(#${id}-far)`}>
        <ellipse cx="200" cy="116" rx="104" ry="46" fill={`url(#${id}-body)`} />
        <rect x="90" y="68" width="220" height="96" fill={`url(#${id}-wall)`} />
      </g>
    </svg>
  );
}

/** Rounded capsule with a glossy top edge. */
export function Capsule({ id, tone = "brand", className = "", style }: ShapeProps) {
  const [a, b] = toneStops[tone];
  return (
    <svg viewBox="0 0 320 120" className={`pointer-events-none ${className}`} style={style} aria-hidden>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor={C.navyDeep} stopOpacity="0.1" />
          <stop offset="1" stopColor={C.navyDeep} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="308" height="108" rx="54" fill={`url(#${id}-body)`} />
      <rect x="6" y="6" width="308" height="108" rx="54" fill={`url(#${id}-shade)`} />
      <rect x="40" y="18" width="200" height="14" rx="7" fill="#fff" opacity="0.45" />
    </svg>
  );
}

/* ---------- Section compositions ---------- */

const wrap = "pointer-events-none absolute inset-0 -z-10 overflow-hidden";

export function ServicesArt() {
  return (
    <div className={wrap} aria-hidden>
      <Torus
        id="svc-torus"
        className="animate-float-slow absolute -right-56 -top-24 w-[380px] rotate-[14deg] opacity-25 sm:-right-48 sm:-top-10 sm:w-[560px] sm:opacity-30"
      />
      <Orb id="svc-orb-a" tone="green" className="animate-float absolute -left-16 top-[45%] w-44 opacity-40" />
      <Orb id="svc-orb-b" tone="blue" className="absolute -bottom-24 right-[20%] w-72 opacity-20 blur-2xl" />
      <Orb
        id="svc-orb-c"
        tone="blue"
        className="animate-float absolute right-[30%] top-24 hidden w-10 opacity-60 lg:block"
        style={{ animationDelay: "-4s" }}
      />
    </div>
  );
}

export function AboutArt() {
  return (
    <div className={wrap} aria-hidden>
      <Orb id="about-orb-a" tone="brand" className="animate-float absolute -left-10 top-10 w-40 opacity-70 sm:w-52" />
      <Capsule
        id="about-capsule-a"
        tone="brand"
        className="animate-float-slow absolute -right-16 bottom-16 w-80 -rotate-[24deg] opacity-40"
      />
      <Capsule
        id="about-capsule-b"
        tone="blue"
        className="animate-float absolute -right-6 bottom-56 hidden w-40 -rotate-[24deg] opacity-30 lg:block"
        style={{ animationDelay: "-5s" }}
      />
      <Orb id="about-orb-b" tone="green" className="absolute right-[25%] -top-20 w-72 opacity-25 blur-2xl" />
    </div>
  );
}

export function ContactArt() {
  return (
    <div className={wrap} aria-hidden>
      <Torus
        id="contact-torus"
        tone="blue"
        className="animate-float-slow absolute -bottom-32 -left-48 w-[560px] rotate-[22deg] opacity-25"
      />
      <Orb id="contact-orb-a" tone="green" className="animate-float absolute -right-12 -top-6 w-24 opacity-50 sm:top-16 sm:w-36" />
      <Orb id="contact-orb-b" tone="blue" className="absolute -right-20 bottom-0 w-80 opacity-20 blur-2xl" />
    </div>
  );
}

export function PageHeaderArt() {
  return (
    <div className={wrap} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(50%_90%_at_90%_0%,rgb(0_159_251/0.25),transparent_70%)]" />
      <Torus id="page-torus" className="absolute -right-48 -top-28 w-[340px] rotate-[-18deg] opacity-50 sm:-right-32 sm:-top-20 sm:w-[480px] sm:opacity-80" />
      <Orb id="page-orb" tone="green" className="absolute bottom-6 right-[30%] hidden w-16 sm:block" />
    </div>
  );
}
