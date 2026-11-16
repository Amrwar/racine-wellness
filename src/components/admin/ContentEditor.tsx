"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { updateContent, type ContentState } from "@/app/admin/actions";
import { serviceIconKeys, serviceIconNames, type ServiceItem, type SiteContent, type SitePhoto } from "@/lib/content-data";
import { serviceIcons } from "@/components/icons";
import type { Bilingual } from "@/lib/pricing-data";
import { BilingualFields, Section } from "./fields";

type Path = (string | number)[];

function getAt(obj: unknown, path: Path): unknown {
  return path.reduce<unknown>((o, k) => (o as Record<string | number, unknown>)[k], obj);
}

/** Copy of obj with patch merged into the object at path. */
function mergeAt<T>(obj: T, path: Path, patch: object): T {
  if (!path.length) return { ...obj, ...patch };
  const [k, ...rest] = path;
  const copy = (Array.isArray(obj) ? [...obj] : { ...obj }) as Record<string | number, unknown>;
  copy[k] = mergeAt(copy[k], rest, patch);
  return copy as T;
}

const jump = [
  ["top", "Top of page"],
  ["services", "Services"],
  ["pricing", "Pricing"],
  ["about", "About"],
  ["contact", "Contact"],
] as const;

export function ContentEditor({ initial, defaults }: { initial: SiteContent; defaults: { hero: string; portrait: string } }) {
  const [content, setContent] = useState(initial);
  const [state, action, pending] = useActionState<ContentState, FormData>(updateContent, { status: "idle" });
  const saved = state.content ?? initial;
  const dirty = JSON.stringify(content) !== JSON.stringify(saved);

  // Every update starts from the latest content, so a translation finishing later never undoes other edits.
  /** Props for a bilingual field at a path, e.g. bi("hero", "title") or bi("services", "items", 0, "text"). */
  const bi = (...path: Path) => ({
    value: getAt(content, path) as Bilingual,
    onChange: (patch: Partial<Bilingual>) => setContent((c) => mergeAt(c, path, patch)),
  });
  const setPhoto = (key: "hero" | "about", photo: SitePhoto | null) => setContent((c) => ({ ...c, [key]: { ...c[key], photo } }));
  const items = content.services.items;
  const setItems = (change: (items: ServiceItem[]) => ServiceItem[]) =>
    setContent((c) => ({ ...c, services: { ...c.services, items: change(c.services.items) } }));
  const move = (i: number, d: -1 | 1) =>
    setItems((list) => {
      const next = [...list];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  return (
    <form action={action} className="space-y-6 pb-28">
      <input type="hidden" name="content" value={JSON.stringify(content)} />

      <nav aria-label="Sections" className="flex flex-wrap gap-2">
        {jump.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-navy shadow-card ring-1 ring-mist/60 hover:ring-blue">
            {label}
          </a>
        ))}
      </nav>

      <Section id="top" title="Top of the page" text="The first thing visitors see: the large photo, heading and introduction.">
        <BilingualFields label="Tagline" hint="Small line above the heading; also in the footer." {...bi("tagline")} />
        <BilingualFields label="Main heading" {...bi("hero", "title")} />
        <BilingualFields label="Introduction" multiline rows={3} {...bi("hero", "lead")} />
        <PhotoField
          label="Main photo"
          note="Works best as a wide landscape photo with you on the right side, leaving space on the left for the text."
          photo={content.hero.photo}
          fallback={defaults.hero}
          onChange={(photo) => setPhoto("hero", photo)}
        />
      </Section>

      <Section id="services" title="Services" text="The service cards on the home page. Prices are edited on the Pricing page.">
        <BilingualFields label="Heading" {...bi("services", "title")} />
        <BilingualFields label="Introduction" multiline rows={2} {...bi("services", "lead")} />
        <ol className="space-y-4">
          {items.map((item, i) => (
            <li key={i} className="rounded-2xl bg-surface p-5 ring-1 ring-mist/60">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-navy">
                  Service {i + 1}
                  {item.title.en && <span className="font-normal text-muted"> · {item.title.en}</span>}
                </p>
                <div className="flex gap-1">
                  <SmallButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)} d="M12 19V5M5 12l7-7 7 7" />
                  <SmallButton label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)} d="M12 5v14M5 12l7 7 7-7" />
                  <SmallButton
                    label="Remove service"
                    danger
                    disabled={items.length === 1}
                    onClick={() => setItems((list) => list.filter((_, j) => j !== i))}
                    d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <fieldset>
                  <legend className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Icon</legend>
                  <div className="flex flex-wrap gap-2">
                    {serviceIconKeys.map((key) => {
                      const Icon = serviceIcons[key];
                      const on = item.icon === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          title={serviceIconNames[key]}
                          aria-label={serviceIconNames[key]}
                          aria-pressed={on}
                          onClick={() => setItems((list) => list.map((x, j) => (j === i ? { ...x, icon: key } : x)))}
                          className={`grid h-11 w-11 place-items-center rounded-xl transition ${on ? "bg-navy text-green" : "bg-white text-muted ring-1 ring-mist hover:text-navy hover:ring-blue"}`}
                        >
                          <Icon className="h-6 w-6" strokeWidth={1.75} />
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <BilingualFields label="Name" {...bi("services", "items", i, "title")} />
                <BilingualFields label="Description" multiline rows={3} {...bi("services", "items", i, "text")} />
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          disabled={items.length >= 12}
          onClick={() => setItems((list) => [...list, { icon: "hands", title: { en: "", fr: "" }, text: { en: "", fr: "" } }])}
          className="rounded-full border-2 border-dashed border-blue/50 px-5 py-2.5 text-sm font-semibold text-blue-dark hover:border-blue disabled:opacity-40"
        >
          + Add a service
        </button>
      </Section>

      <Section
        id="pricing"
        title="Pricing section"
        text={
          <>
            Heading and introduction only. The rates and promotion are on the{" "}
            <Link href="/admin/pricing" className="font-medium text-blue-dark hover:underline">
              Pricing page
            </Link>
            .
          </>
        }
      >
        <BilingualFields label="Heading" {...bi("pricing", "title")} />
        <BilingualFields label="Introduction" multiline rows={2} {...bi("pricing", "lead")} />
      </Section>

      <Section id="about" title="About you">
        <BilingualFields label="Heading" {...bi("about", "title")} />
        <BilingualFields
          label="Titles"
          hint="Under the heading; also used for your author line on the blog."
          {...bi("about", "credentialsLine")}
        />
        <BilingualFields label="Paragraph 1" multiline {...bi("about", "text1")} />
        <BilingualFields label="Paragraph 2" multiline {...bi("about", "text2")} />
        <BilingualFields
          label="Checklist"
          hint="One item per line."
          multiline
          {...bi("about", "credentials")}
        />
        <PhotoField
          label="Your portrait"
          note="A portrait (taller than wide) works best."
          portrait
          photo={content.about.photo}
          fallback={defaults.portrait}
          onChange={(photo) => setPhoto("about", photo)}
        />
      </Section>

      <Section
        id="contact"
        title="Contact section"
        text={
          <>
            Your phone, email and Instagram are on the{" "}
            <Link href="/admin/settings" className="font-medium text-blue-dark hover:underline">
              Settings page
            </Link>
            .
          </>
        }
      >
        <BilingualFields label="Heading" {...bi("contact", "title")} />
        <BilingualFields label="Introduction" multiline rows={2} {...bi("contact", "lead")} />
        <BilingualFields
          label="Office"
          hint="Also shown in the footer and the booking page."
          {...bi("contact", "office")}
        />
        <BilingualFields label="Service area" {...bi("contact", "areaNote")} />
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist/70 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="text-sm" role="status" aria-live="polite">
            {state.status === "error" ? (
              <span className="text-danger">{state.message}</span>
            ) : dirty ? (
              <span className="text-muted">You have unsaved changes.</span>
            ) : state.status === "saved" ? (
              <span className="font-medium text-[#007a43]">Saved. The website has been updated.</span>
            ) : (
              <span className="text-muted">Everything is up to date.</span>
            )}
          </p>
          <div className="flex shrink-0 gap-2">
            {dirty && (
              <button type="button" onClick={() => setContent(saved)} className="rounded-full px-4 py-2.5 text-sm font-medium text-muted hover:text-navy">
                Undo changes
              </button>
            )}
            <button
              disabled={!dirty || pending}
              className="rounded-full bg-blue-dark px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 transition hover:bg-[#00649f] disabled:opacity-50 disabled:shadow-none"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function SmallButton({ label, d, onClick, disabled, danger = false }: { label: string; d: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 place-items-center rounded-full transition disabled:opacity-30 ${danger ? "text-danger hover:bg-danger/10" : "text-muted hover:bg-white hover:text-navy"}`}
    >
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={d} />
      </svg>
    </button>
  );
}

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

function PhotoField({
  label,
  note,
  photo,
  fallback,
  portrait = false,
  onChange,
}: {
  label: string;
  note: string;
  photo: SitePhoto | null;
  fallback: string;
  portrait?: boolean;
  onChange: (p: SitePhoto | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function onFile(file: File) {
    setError("");
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return setError("Please choose a JPG, PNG or WebP photo.");
    if (file.size > 20 * 1024 * 1024) return setError("That photo is over 20 MB. Please choose a smaller one.");
    try {
      setProgress(0);
      const { width, height } = await imageSize(file);
      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const blob = await upload(`site/${portrait ? "portrait" : "hero"}-${width}x${height}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/admin/upload",
        contentType: file.type,
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      onChange({ src: blob.url, width, height });
    } catch (err) {
      console.error(err);
      setError("The upload didn't work. Please try again.");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-5">
        <div className={`relative shrink-0 overflow-hidden rounded-xl bg-surface ring-1 ring-mist/70 ${portrait ? "h-36 w-28" : "h-28 w-48"}`}>
          <Image src={photo?.src ?? fallback} alt="" fill sizes="200px" className="object-cover object-top" />
        </div>
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={progress !== null}
              onClick={() => fileRef.current?.click()}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy ring-1 ring-mist hover:ring-blue disabled:cursor-wait"
            >
              {progress === null ? "Upload a new photo" : `Uploading… ${Math.round(progress)}%`}
            </button>
            {photo && (
              <button type="button" onClick={() => onChange(null)} className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-navy">
                Use the original photo
              </button>
            )}
          </div>
          <p className="max-w-sm text-xs text-muted">{note} JPG, PNG or WebP, up to 20 MB.</p>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
