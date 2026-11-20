import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "./ui/badge";

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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 motion-reduce:hover:translate-y-0">
      <div className={`relative aspect-[16/10] overflow-hidden border-b ${a.diagram ? "bg-white" : "bg-muted"}`}>
        <Image
          src={a.cover.src}
          alt={a.coverAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          preload={priority}
          className={`transition duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100 ${a.diagram ? "object-contain p-4" : "object-cover object-[50%_30%]"}`}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Badge variant="outline" className="font-medium text-muted-foreground">
            {a.category}
          </Badge>
          <time dateTime={a.dateIso}>{a.dateLabel}</time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="h-3.5 w-3.5" />
            {a.minutesLabel}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-foreground">
          <Link href={a.href} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring">
            {a.title}
          </Link>
        </h3>
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-foreground">
          {readMore}
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
