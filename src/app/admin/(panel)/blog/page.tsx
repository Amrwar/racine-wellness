import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getPosts } from "@/lib/posts";
import { formatDate } from "@/lib/blog";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogAdminPage() {
  await requireAdmin();
  const posts = await getPosts({ drafts: true });
  const drafts = posts.filter((p) => !p.published).length;

  return (
    <>
      <PageHeader
        title="Blog"
        lead={`${posts.length} article${posts.length === 1 ? "" : "s"}${drafts ? `, ${drafts} draft${drafts === 1 ? "" : "s"}` : ""}. Each article has an English and a French version.`}
        action={
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-full bg-blue-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 hover:bg-[#00649f]"
          >
            + New article
          </Link>
        }
      />

      {posts.length === 0 ? (
        <EmptyState title="No articles yet" text="Write your first article with the New article button." />
      ) : (
        <Card className="divide-y divide-mist/60 overflow-hidden">
          {posts.map((p) => (
            <Link key={p.slug} href={`/admin/blog/${p.slug}`} className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-surface sm:px-5">
              <span className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ${p.coverDiagram ? "bg-white ring-1 ring-mist/70" : "bg-surface"}`}>
                <Image src={p.cover.src} alt="" fill sizes="56px" className={p.coverDiagram ? "object-contain p-1" : "object-cover"} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-navy">{p.en.title}</span>
                <span className="block truncate text-sm text-muted-foreground">
                  {formatDate(p.date, "en")} · {p.en.category || "No category"}
                </span>
              </span>
              {p.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
