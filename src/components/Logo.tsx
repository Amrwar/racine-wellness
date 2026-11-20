import Image from "next/image";
import { LLink } from "@/i18n/LocaleProvider";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** HealthyZone HZ monogram (same artwork as the favicon) + wordmark. `tone="dark"` is for navy/dark backgrounds. */
export function Logo({ label, className = "", tone = "light" }: { label: string; className?: string; tone?: "light" | "dark" }) {
  return (
    <LLink href="/" aria-label={label} className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/images/logo-mark.png"
        alt=""
        width={32}
        height={32}
        priority
        className={cn("h-8 w-8 rounded-lg", tone === "dark" ? "ring-1 ring-white/20" : "shadow-xs")}
      />
      <span className="text-[1.3rem] font-semibold leading-none tracking-[-0.035em]">
        <span className={tone === "dark" ? "text-blue" : "text-blue-dark"}>{site.brand.first}</span>
        <span className={tone === "dark" ? "text-green" : "text-[color-mix(in_oklab,var(--color-green)_62%,black)]"}>{site.brand.second}</span>
      </span>
    </LLink>
  );
}
