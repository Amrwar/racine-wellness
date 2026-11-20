import Link from "next/link";
import { Card } from "./ui";

export type ChecklistItem = { done: boolean; title: string; text: string; href: string; action: string };

/** "Getting set up": what still needs doing, ticked off automatically. Hidden once everything is done. */
export function Checklist({ items }: { items: ChecklistItem[] }) {
  const left = items.filter((i) => !i.done).length;
  if (!left) return null;
  const pct = Math.round(((items.length - left) / items.length) * 100);
  return (
    <Card className="mb-10 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mist/60 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-navy">Getting set up</h2>
          <p className="text-sm text-muted-foreground">
            {left} {left === 1 ? "step" : "steps"} left to make the website fully yours.
          </p>
        </div>
        <div className="flex w-40 items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-green" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-navy">{pct}%</span>
        </div>
      </div>
      <ul className="divide-y divide-mist/60">
        {items.map((i) => (
          <li key={i.title} className="flex items-start gap-4 px-6 py-4">
            <span
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${i.done ? "bg-green text-navy-deep" : "ring-2 ring-mist"}`}
              aria-label={i.done ? "Done" : "To do"}
            >
              {i.done && (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m5 12 5 5L20 7" />
                </svg>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold ${i.done ? "text-muted-foreground line-through decoration-mist" : "text-navy"}`}>{i.title}</p>
              {!i.done && <p className="mt-0.5 text-sm text-muted-foreground">{i.text}</p>}
            </div>
            {!i.done && (
              <Link href={i.href} className="shrink-0 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-navy ring-1 ring-mist/70 hover:ring-blue">
                {i.action}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
