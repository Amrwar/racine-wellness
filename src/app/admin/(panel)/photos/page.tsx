import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getLibrary } from "@/lib/photos";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { DeletePhoto } from "@/components/admin/DeletePhoto";

export const metadata: Metadata = { title: "Photos" };

const kind = (path: string) =>
  path.startsWith("blog/") ? "Blog" : path.startsWith("site/icon") ? "Icon" : path.startsWith("site/background") ? "Background" : path.startsWith("site/share") ? "Link preview" : "Website";
const mb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const day = (d: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "America/Montreal" }).format(new Date(d));

export default async function PhotosPage({ searchParams }: PageProps<"/admin/photos">) {
  await requireAdmin();
  const { show } = await searchParams;
  const all = await getLibrary();
  const unusedOnly = show === "unused";
  const photos = unusedOnly ? all.filter((p) => !p.inUse) : all;
  const unused = all.filter((p) => !p.inUse);

  return (
    <>
      <PageHeader
        title="Photos"
        lead="Every photo uploaded from the admin. Photos in use on the website or the blog can't be deleted. A deleted photo is also gone from earlier versions in History."
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-white p-1 shadow-card ring-1 ring-mist/60">
          {[
            ["all", `All (${all.length})`],
            ["unused", `Not in use (${unused.length})`],
          ].map(([key, label]) => (
            <Link
              key={key}
              href={key === "all" ? "/admin/photos" : "/admin/photos?show=unused"}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${(key === "unused") === unusedOnly ? "bg-navy text-white" : "text-navy hover:bg-surface"}`}
            >
              {label}
            </Link>
          ))}
        </div>
        {unused.length > 0 && (
          <p className="text-sm text-muted">
            {unused.length} unused {unused.length === 1 ? "photo takes" : "photos take"} {mb(unused.reduce((s, p) => s + p.size, 0))}.
          </p>
        )}
      </div>
      {photos.length === 0 ? (
        <EmptyState title={unusedOnly ? "Every photo is in use" : "No uploaded photos yet"} text={unusedOnly ? "Nothing to clean up." : "Photos you upload for the website or blog appear here."} />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => (
            <li key={p.url}>
              <Card className="overflow-hidden">
                <a href={p.url} target="_blank" rel="noopener" className="block aspect-[4/3] bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element -- library thumbnails, any format */}
                  <img src={p.url} alt="" loading="lazy" className={`h-full w-full ${kind(p.pathname) === "Icon" ? "object-contain p-6" : "object-cover"}`} />
                </a>
                <div className="space-y-2 p-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {p.inUse ? <Badge tone="green">In use</Badge> : <Badge>Not in use</Badge>}
                    <Badge tone="blue">{kind(p.pathname)}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {day(p.uploadedAt)} · {mb(p.size)}
                  </p>
                  {!p.inUse && <DeletePhoto url={p.url} />}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
