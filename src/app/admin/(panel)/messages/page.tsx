import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { MessageCard, type Message } from "@/components/admin/MessageCard";

export const metadata: Metadata = { title: "Messages" };


const filters = [
  { key: "new", label: "New" },
  { key: "handled", label: "Handled" },
  { key: "all", label: "All" },
] as const;

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  await requireAdmin();
  const { show } = await searchParams;
  const filter = filters.find((f) => f.key === show)?.key ?? "new";

  const sql = await db();
  const messages = (
    filter === "all"
      ? await sql`SELECT * FROM messages ORDER BY created_at DESC LIMIT 200`
      : await sql`SELECT * FROM messages WHERE status = ${filter} ORDER BY created_at DESC LIMIT 200`
  ) as Message[];

  return (
    <>
      <PageHeader title="Messages" lead="Enquiries sent through the contact form on the website." />

      <div className="mb-6 inline-flex rounded-full bg-white p-1 shadow-card ring-1 ring-mist/60" role="tablist">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/admin/messages?show=${f.key}`}
            role="tab"
            aria-selected={filter === f.key}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f.key ? "bg-navy text-white" : "text-muted hover:text-navy"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {messages.length === 0 ? (
        <EmptyState
          title={filter === "new" ? "You're all caught up" : "No messages here"}
          text={filter === "new" ? "New enquiries from the website will appear here." : "Nothing to show for this filter."}
        />
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id}>
              <MessageCard m={m} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
