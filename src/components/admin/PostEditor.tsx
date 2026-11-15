"use client";

import Image from "next/image";
import { startTransition, useActionState, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { removePost, updatePost, type PostState } from "@/app/admin/actions";
import type { Block, Photo, Post } from "@/lib/blog";
import { slugify } from "@/lib/post-data";

type Lang = "en" | "fr";
const LANGS: { key: Lang; label: string }[] = [
  { key: "en", label: "English" },
  { key: "fr", label: "Français" },
];

const input =
  "w-full rounded-xl border border-mist bg-white px-3.5 py-2.5 text-ink outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/15";

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">{children}</span>;
}

function Section({ title, text, children, action }: { title: string; text?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-mist/60 sm:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          {text && <p className="mt-0.5 text-sm text-muted">{text}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Bilingual({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: Record<Lang, string>;
  onChange: (lang: Lang, v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {LANGS.map(({ key, label: l }) => (
        <label key={key} className="block">
          <Label>
            {label} · {l}
          </Label>
          {multiline ? (
            <textarea rows={3} value={value[key]} onChange={(e) => onChange(key, e.target.value)} className={`${input} resize-y leading-relaxed`} />
          ) : (
            <input value={value[key]} onChange={(e) => onChange(key, e.target.value)} className={input} />
          )}
        </label>
      ))}
    </div>
  );
}

function IconButton({ label, d, onClick, disabled, danger }: { label: string; d: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-8 w-8 place-items-center rounded-full text-muted transition disabled:opacity-30 ${
        danger ? "hover:bg-danger/8 hover:text-danger" : "hover:bg-surface hover:text-navy"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={d} />
      </svg>
    </button>
  );
}

/* ---------------- Photos ---------------- */

/** Reads the photo's pixel size before upload (the site needs it to lay images out). */
async function imageSize(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = document.createElement("img");
    img.src = url;
    await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function PhotoPicker({ library, onPick, onClose }: { library: Photo[]; onPick: (p: Photo) => void; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function onFile(file: File) {
    setError("");
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
      setError("Please choose a JPG, PNG or WebP photo.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("That photo is over 20 MB. Please choose a smaller one.");
      return;
    }
    try {
      setProgress(0);
      const { width, height } = await imageSize(file);
      const base = slugify(file.name.replace(/\.\w+$/, "")) || "photo";
      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const blob = await upload(`blog/${base}-${width}x${height}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/admin/upload",
        contentType: file.type,
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      onPick({ src: blob.url, width, height });
    } catch (err) {
      console.error(err);
      setError("The upload didn't work. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal aria-label="Choose a photo">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-mist/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-navy">Choose a photo</h2>
          <IconButton label="Close" d="M6 6l12 12M18 6 6 18" onClick={onClose} />
        </div>
        <div className="overflow-y-auto p-6">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <button
            type="button"
            disabled={progress !== null}
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-blue/50 bg-blue/5 px-6 py-6 text-navy transition hover:border-blue disabled:cursor-wait"
          >
            <span className="font-semibold">{progress === null ? "Upload a photo from your device" : `Uploading… ${Math.round(progress)}%`}</span>
            <span className="text-sm text-muted">JPG, PNG or WebP, up to 20 MB</span>
          </button>
          {error && <p className="mt-3 rounded-xl bg-danger/8 px-4 py-2.5 text-sm text-danger">{error}</p>}
          <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Or reuse a photo</p>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {library.map((p) => (
              <li key={p.src}>
                <button type="button" onClick={() => onPick(p)} className="relative block aspect-square w-full overflow-hidden rounded-xl bg-surface ring-1 ring-mist/70 transition hover:ring-2 hover:ring-blue">
                  <Image src={p.src} alt="" fill sizes="160px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PhotoField({ photo, diagram, library, onChange }: { photo?: Photo; diagram?: boolean; library: Photo[]; onChange: (p: Photo) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <div className={`relative h-28 w-36 shrink-0 overflow-hidden rounded-xl ring-1 ring-mist/70 ${diagram ? "bg-white" : "bg-surface"}`}>
        {photo && <Image src={photo.src} alt="" fill sizes="144px" className={diagram ? "object-contain p-2" : "object-cover"} />}
      </div>
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-surface px-4 py-2 text-sm font-semibold text-navy ring-1 ring-mist hover:bg-white">
        {photo ? "Change photo" : "Choose photo"}
      </button>
      {open && (
        <PhotoPicker
          library={library}
          onClose={() => setOpen(false)}
          onPick={(p) => {
            onChange(p);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Article body ---------------- */

const blockLabels: Record<Block["type"], string> = { p: "Paragraph", h2: "Heading", list: "List", quote: "Quote", image: "Photo" };

function newBlock(type: Block["type"], library: Photo[]): Block {
  switch (type) {
    case "list":
      return { type, items: [""] };
    case "image":
      return { type, photo: library[0], alt: "" };
    default:
      return { type, text: "" };
  }
}

function BlockEditor({ block, onChange, library }: { block: Block; onChange: (b: Block) => void; library: Photo[] }) {
  switch (block.type) {
    case "h2":
      return <input value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Section heading" className={`${input} text-lg font-semibold text-navy`} />;
    case "p":
    case "quote":
      return (
        <textarea
          rows={block.type === "p" ? 4 : 3}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder={block.type === "p" ? "Write a paragraph…" : "A short quote or key point"}
          className={`${input} resize-y leading-relaxed ${block.type === "quote" ? "border-l-4 border-l-green italic" : ""}`}
        />
      );
    case "list":
      return (
        <div>
          <textarea
            rows={Math.max(3, block.items.length + 1)}
            value={block.items.join("\n")}
            onChange={(e) => onChange({ ...block, items: e.target.value.split("\n") })}
            placeholder={"One point per line"}
            className={`${input} resize-y leading-relaxed`}
          />
          <p className="mt-1 text-xs text-muted">One bullet point per line.</p>
        </div>
      );
    case "image":
      return (
        <div className="space-y-4">
          <PhotoField photo={block.photo} diagram={block.diagram} library={library} onChange={(photo) => onChange({ ...block, photo })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <Label>Description for screen readers</Label>
              <input value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} className={input} />
            </label>
            <label className="block">
              <Label>Caption (optional)</Label>
              <input value={block.caption ?? ""} onChange={(e) => onChange({ ...block, caption: e.target.value })} className={input} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={block.diagram === true} onChange={(e) => onChange({ ...block, diagram: e.target.checked })} className="h-4 w-4 accent-navy" />
            Show the whole image on white (for diagrams and drawings)
          </label>
        </div>
      );
  }
}

/* ---------------- Editor ---------------- */

export function PostEditor({ initial, isNew, library, justSaved }: { initial: Post; isNew: boolean; library: Photo[]; justSaved: boolean }) {
  const [post, setPost] = useState(initial);
  const [lang, setLang] = useState<Lang>("en");
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [state, action, pending] = useActionState<PostState, FormData>(
    async (prev, data) => {
      const result = await updatePost(prev, data);
      // Show the article exactly as stored (reading time, trimmed text), so it no longer reads as changed.
      if (result.status === "saved" && result.post) setPost(result.post);
      return result;
    },
    { status: justSaved ? "saved" : "idle" },
  );
  const saved = state.post ?? initial;
  const dirty = isNew || JSON.stringify(post) !== JSON.stringify(saved);

  const setLangField = (key: "title" | "excerpt" | "category" | "coverAlt", l: Lang, v: string) =>
    setPost((p) => {
      const next = { ...p, [l]: { ...p[l], [key]: v } };
      if (key === "title" && l === "en" && !slugEdited) next.slug = slugify(v);
      return next;
    });
  const body = post[lang].body;
  const setBody = (b: Block[]) => setPost((p) => ({ ...p, [lang]: { ...p[lang], body: b } }));
  const move = (i: number, d: -1 | 1) => {
    const b = [...body];
    [b[i], b[i + d]] = [b[i + d], b[i]];
    setBody(b);
  };
  const pair = (key: "title" | "excerpt" | "category" | "coverAlt") => ({ en: post.en[key], fr: post.fr[key] });

  return (
    <form
      className="space-y-6 pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData();
        data.set("post", JSON.stringify(post));
        data.set("previousSlug", isNew ? "" : saved.slug);
        startTransition(() => action(data));
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{isNew ? "New article" : post.en.title || "Untitled article"}</h1>
          <p className="mt-1.5 text-muted">{isNew ? "Write it in English and French, then publish when ready." : "Changes appear on the website when you save."}</p>
        </div>
        {!isNew && saved.published && (
          <a href={`/blog/${saved.slug}`} target="_blank" rel="noopener" className="shrink-0 text-sm font-semibold text-blue-dark hover:underline">
            View on website ↗
          </a>
        )}
      </div>

      <Section
        title="Publishing"
        action={
          <label className="flex cursor-pointer items-center gap-3">
            <span className={`text-sm font-semibold ${post.published ? "text-[#007a43]" : "text-muted"}`}>{post.published ? "Published" : "Draft"}</span>
            <button
              type="button"
              role="switch"
              aria-checked={post.published === true}
              aria-label="Published"
              onClick={() => setPost((p) => ({ ...p, published: !p.published }))}
              className={`relative h-7 w-12 rounded-full transition ${post.published ? "bg-green" : "bg-mist"}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${post.published ? "left-6" : "left-1"}`} />
            </button>
          </label>
        }
      >
        <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
          <label className="block">
            <Label>Date</Label>
            <input type="date" value={post.date} onChange={(e) => setPost((p) => ({ ...p, date: e.target.value }))} className={input} />
          </label>
          <label className="block">
            <Label>Web address</Label>
            <div className="flex items-center rounded-xl border border-mist bg-white focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/15">
              <span className="shrink-0 pl-3.5 text-sm text-muted">healthyzone.ca/blog/</span>
              <input
                value={post.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setPost((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }));
                }}
                className="min-w-0 flex-1 rounded-r-xl bg-transparent py-2.5 pr-3.5 text-ink outline-none"
              />
            </div>
          </label>
        </div>
        {!isNew && post.slug !== saved.slug && saved.published && (
          <p className="text-sm text-muted">Changing the web address breaks links people may have shared to the old one.</p>
        )}
      </Section>

      <Section title="Title and summary" text="Shown on the blog page, in search results and when the article is shared.">
        <Bilingual label="Title" value={pair("title")} onChange={(l, v) => setLangField("title", l, v)} />
        <Bilingual label="Summary" value={pair("excerpt")} onChange={(l, v) => setLangField("excerpt", l, v)} multiline />
        <Bilingual label="Category" value={pair("category")} onChange={(l, v) => setLangField("category", l, v)} />
      </Section>

      <Section title="Cover photo">
        <PhotoField photo={post.cover} diagram={post.coverDiagram} library={library} onChange={(cover) => setPost((p) => ({ ...p, cover }))} />
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={post.coverDiagram === true} onChange={(e) => setPost((p) => ({ ...p, coverDiagram: e.target.checked }))} className="h-4 w-4 accent-navy" />
          Show the whole image on white (for diagrams and drawings)
        </label>
        <Bilingual label="Photo description" value={pair("coverAlt")} onChange={(l, v) => setLangField("coverAlt", l, v)} />
      </Section>

      <Section
        title="Article"
        text="Write each language separately. Use headings to break up longer articles."
        action={
          <div className="inline-flex rounded-full bg-surface p-1 ring-1 ring-mist/60" role="tablist">
            {LANGS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={lang === key}
                onClick={() => setLang(key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${lang === key ? "bg-navy text-white" : "text-muted hover:text-navy"}`}
              >
                {label}
                {post[key].body.length === 0 && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-danger align-middle" />}
              </button>
            ))}
          </div>
        }
      >
        {body.length === 0 && lang === "fr" && post.en.body.length > 0 && (
          <div className="rounded-2xl bg-blue/5 p-5 ring-1 ring-blue/20">
            <p className="text-sm text-ink">The French version is empty.</p>
            <button
              type="button"
              onClick={() => setBody(post.en.body.map((b) => ({ ...b })))}
              className="mt-3 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              Start from the English layout
            </button>
            <p className="mt-2 text-xs text-muted">Copies the English blocks and photos so you can translate them one by one.</p>
          </div>
        )}

        <ol className="space-y-4">
          {body.map((b, i) => (
            <li key={`${lang}-${i}`} className="rounded-2xl border border-mist/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-dark">{blockLabels[b.type]}</span>
                <div className="flex gap-0.5">
                  <IconButton label="Move up" d="M12 19V5M5 12l7-7 7 7" disabled={i === 0} onClick={() => move(i, -1)} />
                  <IconButton label="Move down" d="M12 5v14M5 12l7 7 7-7" disabled={i === body.length - 1} onClick={() => move(i, 1)} />
                  <IconButton label="Remove" danger d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" onClick={() => setBody(body.filter((_, j) => j !== i))} />
                </div>
              </div>
              <BlockEditor block={b} library={library} onChange={(nb) => setBody(body.map((x, j) => (j === i ? nb : x)))} />
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-2 border-t border-mist/60 pt-4">
          <span className="mr-1 text-sm text-muted">Add:</span>
          {(Object.keys(blockLabels) as Block["type"][]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setBody([...body, newBlock(type, library)])}
              className="rounded-full bg-surface px-3.5 py-1.5 text-sm font-medium text-navy ring-1 ring-mist hover:bg-white hover:ring-blue"
            >
              + {blockLabels[type]}
            </button>
          ))}
        </div>
      </Section>

      {!isNew && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/20 p-5">
          <p className="text-sm text-muted">Delete this article from the website and the admin.</p>
          {confirmDelete ? (
            <span className="flex items-center gap-2">
              <span className="text-sm text-muted">Delete for good?</span>
              <button
                type="button"
                onClick={() => {
                  const data = new FormData();
                  data.set("slug", saved.slug);
                  startTransition(() => removePost(data));
                }}
                className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-[#a33224]"
              >
                Delete article
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="px-2 text-sm text-muted hover:text-navy">
                Cancel
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/8">
              Delete article
            </button>
          )}
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist/70 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="min-w-0 text-sm" role="status" aria-live="polite">
            {state.status === "error" ? (
              <ul className="text-danger">
                {state.problems?.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            ) : dirty ? (
              <span className="text-muted">{isNew ? "Not saved yet." : "You have unsaved changes."}</span>
            ) : state.status === "saved" ? (
              <span className="font-medium text-[#007a43]">{saved.published ? "Saved. The article is live on the website." : "Saved as a draft. It isn't visible on the website."}</span>
            ) : (
              <span className="text-muted">Everything is up to date.</span>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {dirty && !isNew && (
              <button type="button" onClick={() => setPost(saved)} className="rounded-full px-4 py-2.5 text-sm font-medium text-muted hover:text-navy">
                Undo changes
              </button>
            )}
            <button
              disabled={!dirty || pending}
              className="rounded-full bg-blue-dark px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 transition hover:bg-[#00649f] disabled:opacity-50 disabled:shadow-none"
            >
              {pending ? "Saving…" : isNew ? "Save article" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
