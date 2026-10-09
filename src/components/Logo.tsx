import { LLink } from "@/i18n/LocaleProvider";
import { site } from "@/lib/site";

/** HealthyZone wordmark. Designed for navy backgrounds, like the business card. */
export function Logo({ label, className = "" }: { label: string; className?: string }) {
  return (
    <LLink
      href="/"
      aria-label={label}
      className={`inline-flex items-baseline text-2xl font-bold tracking-[-0.03em] ${className}`}
    >
      <span className="text-blue">{site.brand.first}</span>
      <span className="text-green">{site.brand.second}</span>
    </LLink>
  );
}
