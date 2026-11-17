import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";

/** Everything a card needs, computed on the server (so the client never loads whole articles). */
export type ArticleCardData = {
  slug: string;
  href: string;
  title: string;
  category: string;
  dateIso: string;
  dateLabel: string;
  minutesLabel: string;
  cover: { src: string; width: number; height: number };
  coverAlt: string;
  diagram?: boolean;
};

/** Blog article card, shared by the blog, the home page and related articles. */
export function ArticleCard({ a, readMore, priority = false }: { a: ArticleCardData; readMore: string; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10 motion-reduce:hover:translate-y-0">
      <div className={`relative aspect-[16/10] overflow-hidden ${a.diagram ? "bg-white" : "bg-surface"}`}>
        <Image
          src={a.cover.src}
          alt={a.coverAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          preload={priority}
          className={`transition duration-500 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100 ${a.diagram ? "object-contain p-4" : "object-cover object-[50%_30%]"}`}
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="w-fit rounded-full bg-green/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-navy-deep">{a.category}</span>
        <h3 className="mt-3 text-lg font-semibold leading-snug text-navy">
          <Link href={a.href} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-blue">
            {a.title}
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-5 text-xs text-muted">
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden className="h-4 w-4" />
              <time dateTime={a.dateIso}>{a.dateLabel}</time>
            </span>
            <span aria-hidden className="h-3.5 w-px bg-navy/15" />
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="h-4 w-4" />
              {a.minutesLabel}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-dark">
            {readMore}
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
