import { LLink } from "@/i18n/LocaleProvider";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** HealthyZone mark + wordmark. `tone="dark"` is for navy/dark backgrounds, like the business card. */
export function Logo({ label, className = "", tone = "light" }: { label: string; className?: string; tone?: "light" | "dark" }) {
  return (
    <LLink href="/" aria-label={label} className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg shadow-xs",
          tone === "dark" ? "bg-white/10 ring-1 ring-white/15" : "bg-navy",
        )}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" strokeWidth="2.2" strokeLinecap="round">
          <path d="M7 5v14M17 5v14" stroke="var(--color-blue)" />
          <path d="M7 12h10" stroke="var(--color-green)" />
        </svg>
      </span>
      <span className="text-[1.3rem] font-semibold leading-none tracking-[-0.035em]">
        <span className={tone === "dark" ? "text-blue" : "text-navy"}>{site.brand.first}</span>
        <span className={tone === "dark" ? "text-green" : "text-[color-mix(in_oklab,var(--color-green)_62%,black)]"}>{site.brand.second}</span>
      </span>
    </LLink>
  );
}
