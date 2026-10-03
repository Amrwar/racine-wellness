import type { ComponentProps, ReactNode } from "react";
import { LLink } from "@/i18n/LocaleProvider";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Renders a dictionary string where *asterisked* segments become italic accent text.
 * Example: "Build a body that *looks* strong" → Build a body that <em>looks</em> strong
 */
export function Rich({ text, emClass = "" }: { text: string; emClass?: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <em key={i} className={`font-light italic ${emClass}`}>
            {p}
          </em>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

type ButtonProps = {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "light" | "outline-light";
  size?: "md" | "lg";
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof LLink>, "href" | "children">;

export function Button({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-cream";
  const sizes = {
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };
  const variants = {
    primary:
      "bg-forest text-cream hover:bg-forest-deep hover:shadow-soft hover:-translate-y-0.5",
    secondary:
      "bg-clay text-cream hover:bg-clay-dark hover:shadow-soft hover:-translate-y-0.5",
    ghost:
      "border border-forest/20 text-forest hover:border-forest hover:bg-forest/5",
    light:
      "bg-cream text-forest hover:bg-sand hover:-translate-y-0.5 hover:shadow-soft",
    "outline-light":
      "border border-cream/40 text-cream hover:border-cream hover:bg-cream/10",
  };
  return (
    <LLink
      href={href}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </LLink>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}

export function Eyebrow({
  children,
  light = false,
  className = "",
}: {
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`mb-4 inline-flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.22em] ${
        light ? "text-sage" : "text-clay"
      } ${className}`}
    >
      <span className={`h-px w-8 ${light ? "bg-sage" : "bg-clay"}`} aria-hidden />
      {children}
    </p>
  );
}

export function Heading({
  as: Tag = "h2",
  children,
  className = "",
  light = false,
}: {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  const sizes = {
    h1: "text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl",
    h2: "text-4xl leading-[1.05] sm:text-5xl",
    h3: "text-2xl leading-tight sm:text-3xl",
  };
  return (
    <Tag
      className={`font-display font-medium tracking-[-0.02em] ${sizes[Tag]} ${
        light ? "text-cream [&_em]:text-sage" : "text-forest [&_em]:text-moss"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Lead({
  children,
  className = "",
  light = false,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <p
      className={`text-lg leading-relaxed sm:text-xl ${
        light ? "text-sage" : "text-stone"
      } ${className}`}
    >
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "left",
  light = false,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow && (
        <Eyebrow light={light} className={align === "center" ? "justify-center" : ""}>
          {eyebrow}
        </Eyebrow>
      )}
      <Heading light={light}>{title}</Heading>
      {lead && (
        <Lead light={light} className="mt-6">
          {lead}
        </Lead>
      )}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-sand bg-sand/40 pt-36 pb-16 sm:pt-44 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full bg-sage/30 blur-3xl"
      />
      <Container className="relative">
        <div className="max-w-3xl">
          <Eyebrow className="animate-fade-up">{eyebrow}</Eyebrow>
          <Heading as="h1" className="animate-fade-up delay-1">
            {title}
          </Heading>
          {lead && <Lead className="mt-7 animate-fade-up delay-2">{lead}</Lead>}
          {children && <div className="mt-9 animate-fade-up delay-3">{children}</div>}
        </div>
      </Container>
    </section>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="10" cy="10" r="8.5" className="opacity-30" />
      <path d="m6.5 10.2 2.3 2.3 4.7-5" />
    </svg>
  );
}
