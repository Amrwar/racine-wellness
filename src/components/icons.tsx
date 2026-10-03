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

export function Leaf(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M4 20c0-9 5-15 16-16-.5 10-6 16-14.5 16" />
      <path d="M4 20c3-4 7-7.5 12-10" />
    </svg>
  );
}

export function Bowl(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M3 11h18c0 5-4 9-9 9s-9-4-9-9Z" />
      <path d="M8 7c0-2 1.5-2 1.5-4M12 7c0-2 1.5-2 1.5-4M16 7c0-2 1.5-2 1.5-4" />
    </svg>
  );
}

export function Laptop(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M2 19h20" />
    </svg>
  );
}

export function Play(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
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

export function Clock(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
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

export function Youtube(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" />
    </svg>
  );
}

export function Facebook(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M14 8h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3h2.5v7h3v-7H16l.5-3h-3V8.5A.5.5 0 0 1 14 8Z" />
    </svg>
  );
}

export function Quote(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="M7.5 6C4.9 6 3 8.1 3 10.8c0 2.4 1.6 4.2 3.9 4.2.4 0 .7 0 1-.1C7.4 17 6 18.2 4.3 18.7l.5 1.3C8.7 19 11 16.2 11 11.9 11 8.3 9.6 6 7.5 6Zm10 0C14.9 6 13 8.1 13 10.8c0 2.4 1.6 4.2 3.9 4.2.4 0 .7 0 1-.1-.5 2.1-1.9 3.3-3.6 3.8l.5 1.3c3.9-1 6.2-3.8 6.2-8.1C21 8.3 19.6 6 17.5 6Z" />
    </svg>
  );
}

export const serviceIcons = { dumbbell: Dumbbell, leaf: Leaf, bowl: Bowl, laptop: Laptop };
