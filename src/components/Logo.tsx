import Link from "next/link";
import { site } from "@/lib/site";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${light ? "text-cream" : "text-forest"}`}
      aria-label={`${site.name} home`}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-full ${
          light ? "bg-cream/10 text-sage" : "bg-forest text-sage"
        } transition-transform duration-500 group-hover:rotate-12`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 21V9" />
          <path d="M12 9c0-4 3-6 7-6-.5 4.5-3 6.5-7 6Z" />
          <path d="M12 13c0-3-2.5-5-6-5 .5 3.5 2.5 5 6 5Z" />
          <path d="M8 21c1-2 2.5-3 4-3s3 1 4 3" />
        </svg>
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        {site.name.split(" ")[0]}
        <span className={light ? "text-sage" : "text-clay"}>.</span>
      </span>
    </Link>
  );
}
