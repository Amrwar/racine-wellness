import type { SVGProps } from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export function Dumbbell(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11M3.5 9h3v6h-3zM17.5 9h3v6h-3z" />
    </svg>
  );
}

export function Hands(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M10 10V4.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M13 10.5V6a1.5 1.5 0 0 1 3 0v6" />
      <path d="M16 12V8.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6.5 7S6 18.5 4.5 15.5L3 12.5a1.4 1.4 0 0 1 2.4-1.4L7 13" />
    </svg>
  );
}

export function MapPin(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function Phone(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function Mail(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function Receipt(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

export function Instagram(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function Posture(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="4" r="1.8" />
      <path d="M12 7v13" />
      <path d="M9.5 9.5h5M10 13h4M10.5 16.5h3" />
    </svg>
  );
}

export function Mobility(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M20 12a8 8 0 0 1-14 5.3" />
      <path d="M4 12a8 8 0 0 1 14-5.3" />
      <path d="M18.5 3v4h-4M5.5 21v-4h4" />
    </svg>
  );
}

export function Heart(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
      <path d="M7.5 12h2.5l1.5-2.5 2 4 1.5-1.5h1.5" />
    </svg>
  );
}

export function Youth(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m12 7.5 2.4 1.8-.9 2.9h-3l-.9-2.9L12 7.5ZM9.6 9.3 5.5 8.5M14.4 9.3l4.1-.8M10.5 12.2 8.5 16M13.5 12.2l2 3.8" />
    </svg>
  );
}

export const serviceIcons = {
  hands: Hands,
  posture: Posture,
  mobility: Mobility,
  strength: Dumbbell,
  heart: Heart,
  youth: Youth,
};
