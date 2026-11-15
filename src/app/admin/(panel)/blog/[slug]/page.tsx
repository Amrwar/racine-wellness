import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { list } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { getPost } from "@/lib/posts";
import type { Photo, Post } from "@/lib/blog";
import { libraryPhotos } from "@/lib/blog-photos";
import { localDay } from "@/lib/time";
import { PostEditor } from "@/components/admin/PostEditor";

export const metadata: Metadata = { title: "Edit article" };

const blank = (): Post => ({
  slug: "",
  date: localDay(new Date()),
  readMinutes: 1,
  cover: libraryPhotos[0],
  published: false,
  en: { title: "", excerpt: "", category: "", coverAlt: "", body: [{ type: "p", text: "" }] },
  fr: { title: "", excerpt: "", category: "", coverAlt: "", body: [] },
});

/** Photos uploaded earlier, newest first, so they can be reused. Sizes come from the file name. */
async function uploadedPhotos(): Promise<Photo[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const { blobs } = await list({ prefix: "blog/", limit: 200 });
    return blobs
      .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
      .flatMap((b) => {
        const m = b.pathname.match(/-(\d+)x(\d+)(?:-[A-Za-z0-9]+)?\.\w+$/);
        return m ? [{ src: b.url, width: Number(m[1]), height: Number(m[2]) }] : [];
      });
  } catch (err) {
    console.error("[admin] listing uploads failed:", err);
    return [];
  }
}

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/blog/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const { saved } = await searchParams;
  const isNew = slug === "new";
  const post = isNew ? blank() : await getPost(slug, { drafts: true });
  if (!post) notFound();
  const library = [...(await uploadedPhotos()), ...libraryPhotos];

  return (
    <>
      <Link href="/admin/blog" className="mb-4 inline-block text-sm font-semibold text-blue-dark hover:underline">
        ← All articles
      </Link>
      <PostEditor key={post.slug || "new"} initial={post} isNew={isNew} library={library} justSaved={saved === "1"} />
    </>
  );
}
