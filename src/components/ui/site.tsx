import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

type ButtonProps = {
  href: string;
  variant?: "brand" | "navy" | "outline" | "outline-light" | "ghost" | "secondary";
  size?: "md" | "lg";
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "children">;

const linkVariants = {
  brand: "default",
  navy: "default",
  outline: "outline",
  "outline-light": "outline",
  ghost: "ghost",
  secondary: "secondary",
} as const;

/**
 * shadcn Button rendered as a Next.js link. `href` is used as-is, so pass a fully localized path.
 * Admin → Design's button shape sets --btn-radius.
 */
export function Button({ href, variant = "brand", size = "md", children, className = "", ...rest }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: linkVariants[variant] }),
        "group rounded-[var(--btn-radius,0.625rem)] font-medium shadow-xs",
        size === "md" ? "h-10 gap-2 px-4 text-sm" : "h-12 gap-2 px-6 text-[0.95rem]",
        variant === "navy" && "bg-foreground hover:bg-foreground/85",
        variant === "brand" && "hover:bg-primary/90",
        variant === "outline-light" && "border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5", className)}
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

/** Small outlined pill above a heading, shadcn-badge style. */
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
      className={cn(
        "mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        light ? "border-white/20 bg-white/10 text-white" : "border-border bg-background text-muted-foreground shadow-xs",
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  light = false,
  className = "",
  edit,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  /** White text, for sections on a dark photo. */
  light?: boolean;
  className?: string;
  /** Content paths for the on-site editor, e.g. { title: "services.title" }. */
  edit?: { title?: string; lead?: string };
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <h2 data-edit={edit?.title} className={cn("text-3xl font-semibold tracking-tight sm:text-4xl", light ? "text-white" : "text-foreground")}>
        {title}
      </h2>
      {lead && (
        <p data-edit={edit?.lead} className={cn("mt-4 text-lg leading-relaxed", light ? "text-white/75" : "text-muted-foreground")}>
          {lead}
        </p>
      )}
    </div>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5 shrink-0", className)}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 10.5 3 3 7-7" />
    </svg>
  );
}

/** Light page header used by inner pages: faint grid, optional breadcrumb, eyebrow, title, lead and an optional side slot. */
export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumb,
  aside,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  breadcrumb?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b bg-background">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div aria-hidden className="absolute left-1/2 top-0 -z-10 h-72 w-[48rem] max-w-full -translate-x-1/2 rounded-full bg-blue/10 blur-3xl" />
      <Container className={cn("py-12 sm:py-16", aside && "grid items-center gap-10 lg:grid-cols-12")}>
        <div className={cn("min-w-0", aside && "lg:col-span-7")}>
          {breadcrumb}
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl">{title}</h1>
          {lead && <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{lead}</p>}
          {children}
        </div>
        {aside && <div className="min-w-0 lg:col-span-5">{aside}</div>}
      </Container>
    </section>
  );
}

/** shadcn-style breadcrumb: Home › Current. */
export function Crumbs({ items }: { items: { label: ReactNode; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 3.5 4.5 4.5L6 12.5" />
              </svg>
            )}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
