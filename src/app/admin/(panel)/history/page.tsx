import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { RestoreButton } from "@/components/admin/RestoreButton";

export const metadata: Metadata = { title: "Change history" };

const names: Record<string, string> = {
  content: "Home page text & photos",
  text: "All other text",
  design: "Design",
  pricing: "Pricing",
  business: "Contact details",
  availability: "Opening hours & time off",
};

const when = (d: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Montreal" }).format(new Date(d));

export default async function HistoryPage() {
  await requireAdmin();
  const sql = await db();
  const rows = await sql`SELECT id, key, saved_at FROM settings_history ORDER BY saved_at DESC LIMIT 200`;
  const groups = Object.keys(names)
    .map((key) => ({ key, items: rows.filter((r) => r.key === key) }))
    .filter((g) => g.items.length);

  return (
    <>
      <PageHeader
        title="Change history"
        lead="Every time you save, the version before is kept here. Restore one if a change didn't work out; the version you replace is kept too, so you can always go back."
      />
      {groups.length === 0 ? (
        <EmptyState title="No earlier versions yet" text="Earlier versions appear here after you save changes to the website, design, prices or hours." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.key} className="overflow-hidden">
              <h2 className="border-b border-mist/60 px-5 py-4 font-semibold text-navy">{names[g.key]}</h2>
              <ul className="divide-y divide-mist/60">
                {g.items.slice(0, 12).map((r, i) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span className="text-ink">
                      Before your change of {when(r.saved_at)}
                      {i === 0 && <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-mist/70">most recent</span>}
                    </span>
                    <RestoreButton id={r.id} />
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
