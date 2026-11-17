"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { updateContent, type ContentState } from "@/app/admin/actions";
import { defaultFraming, framingStyle, newBlockId, serviceIconChoices, type BackgroundKey, type Framing, type ServiceItem, type SiteContent, type SitePhoto } from "@/lib/content-data";
import { ServiceIconView, serviceIcons } from "@/components/icons";
import type { Bilingual } from "@/lib/pricing-data";
import { PreviewButton } from "./PreviewButton";
import { BilingualFields, DragHandle, Section, useDragReorder } from "./fields";

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
  ["blog", "Blog preview"],
  ["testimonials", "Testimonials"],
  ["faq", "Questions"],
  ["own", "Your own sections"],
  ["share", "Link previews"],
  ["contact", "Contact"],
] as const;

export function ContentEditor({
  initial,
  defaults,
}: {
  initial: SiteContent;
  defaults: { hero: string; portrait: string; backgrounds: Record<BackgroundKey, string> };
}) {
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
  /** Background photo field for one home-page section. */
  const background = (key: BackgroundKey, note = "") => (
    <div className="space-y-4 rounded-2xl bg-surface p-5 ring-1 ring-mist/60">
      <PhotoField
        label="Background photo"
        kind="background"
        name={`background-${key}`}
        note={`Optional. Without one, the section has a plain light background. A calm, wide photo works best; it is softened so the text stays readable.${note}`}
        photo={content.backgrounds[key]}
        fallback={defaults.backgrounds[key]}
        onChange={(photo) => setContent((c) => ({ ...c, backgrounds: { ...c.backgrounds, [key]: photo } }))}
      />
      {content.backgrounds[key] && <FramingControls
        src={content.backgrounds[key].src}
        value={content.framing[key]}
        fallback={defaultFraming[key]}
        onChange={(f) => setContent((c) => ({ ...c, framing: { ...c.framing, [key]: f } }))}
      />}
    </div>
  );
  const items = content.services.items;
  const setItems = (change: (items: ServiceItem[]) => ServiceItem[]) =>
    setContent((c) => ({ ...c, services: { ...c.services, items: change(c.services.items) } }));
  const moveTo = (from: number, to: number) =>
    setItems((list) => {
      const next = [...list];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
  const drag = useDragReorder(moveTo);
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
          kind="hero"
          name="hero"
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
            <li key={i} {...drag.item(i)} className={`rounded-2xl bg-surface p-5 ring-1 transition ${drag.dragging === i ? "opacity-60 ring-2 ring-blue" : "ring-mist/60"}`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 font-semibold text-navy">
                  <DragHandle {...drag.handle(i)} />
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
                <IconPicker
                  item={item}
                  onChange={(change) => setItems((list) => list.map((x, j) => (j === i ? { ...x, ...change } : x)))}
                />
                <BilingualFields label="Name" {...bi("services", "items", i, "title")} />
                <BilingualFields label="Description" multiline rows={3} {...bi("services", "items", i, "text")} />
                <PhotoField
                  label="Card photo (optional)"
                  kind="hero"
                  name={`service-${i}`}
                  note="Shown on the left of the service card. Without one, the card shows the icon on a blue panel."
                  photo={item.photo}
                  fallback=""
                  onChange={(photo) => setItems((list) => list.map((x, j) => (j === i ? { ...x, photo } : x)))}
                />
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          disabled={items.length >= 12}
          onClick={() => setItems((list) => [...list, { icon: "hands", image: null, photo: null, title: { en: "", fr: "" }, text: { en: "", fr: "" } }])}
          className="rounded-full border-2 border-dashed border-blue/50 px-5 py-2.5 text-sm font-semibold text-blue-dark hover:border-blue disabled:opacity-40"
        >
          + Add a service
        </button>
        {background("services")}
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
          kind="portrait"
          name="portrait"
          photo={content.about.photo}
          fallback={defaults.portrait}
          onChange={(photo) => setPhoto("about", photo)}
        />
        {background("about")}
      </Section>

      <Section id="blog" title="Blog preview" text="The “From the blog” section with your three latest articles. The articles themselves are edited on the Blog page.">
        {background("blog")}
      </Section>

      <Section id="testimonials" title="Testimonials" text="Short quotes from happy clients. The section appears on the home page once there is at least one (with their permission).">
        <BilingualFields label="Heading" {...bi("testimonials", "title")} />
        <ListEditor
          items={content.testimonials.items}
          noun="testimonial"
          onChange={(items) => setContent((c) => ({ ...c, testimonials: { ...c.testimonials, items: items(c.testimonials.items) } }))}
          blank={() => ({ quote: { en: "", fr: "" }, name: "", detail: { en: "", fr: "" } })}
          render={(t, i) => (
            <>
              <BilingualFields label="Quote" multiline rows={3} {...bi("testimonials", "items", i, "quote")} />
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">Name</span>
                  <input
                    value={t.name}
                    placeholder="e.g. Marie T."
                    onChange={(e) => {
                      const name = e.target.value;
                      setContent((c) => ({ ...c, testimonials: { ...c.testimonials, items: c.testimonials.items.map((x, j) => (j === i ? { ...x, name } : x)) } }));
                    }}
                    className="w-full rounded-xl border border-mist bg-white px-3.5 py-2.5 text-ink outline-none focus:border-blue focus:ring-4 focus:ring-blue/15"
                  />
                </label>
                <div className="sm:col-span-2">
                  <BilingualFields label="Detail (optional)" hint="e.g. Office worker, Pointe-Claire" {...bi("testimonials", "items", i, "detail")} />
                </div>
              </div>
            </>
          )}
        />
      </Section>

      <Section id="faq" title="Questions & answers" text="Common questions, shown as an expandable list. Appears once there is at least one.">
        <BilingualFields label="Heading" {...bi("faq", "title")} />
        <ListEditor
          items={content.faq.items}
          noun="question"
          onChange={(items) => setContent((c) => ({ ...c, faq: { ...c.faq, items: items(c.faq.items) } }))}
          blank={() => ({ q: { en: "", fr: "" }, a: { en: "", fr: "" } })}
          render={(_, i) => (
            <>
              <BilingualFields label="Question" {...bi("faq", "items", i, "q")} />
              <BilingualFields label="Answer" multiline rows={3} {...bi("faq", "items", i, "a")} />
            </>
          )}
        />
      </Section>

      <Section id="own" title="Your own sections" text="Add a section about anything: a heading, text and an optional photo. Order and style them on the Design page.">
        <ListEditor
          items={content.blocks}
          noun="section"
          onChange={(items) => setContent((c) => ({ ...c, blocks: items(c.blocks) }))}
          blank={() => ({ id: newBlockId(), eyebrow: { en: "", fr: "" }, title: { en: "", fr: "" }, text: { en: "", fr: "" }, photo: null, photoSide: "right" as const })}
          render={(b, i) => {
            const setBlock = (change: Partial<typeof b>) => setContent((c) => ({ ...c, blocks: c.blocks.map((x, j) => (j === i ? { ...x, ...change } : x)) }));
            return (
              <>
                <BilingualFields label="Small label above (optional)" {...bi("blocks", i, "eyebrow")} />
                <BilingualFields label="Heading" {...bi("blocks", i, "title")} />
                <BilingualFields label="Text" hint="Leave an empty line between paragraphs." multiline rows={5} {...bi("blocks", i, "text")} />
                <PhotoField label="Photo (optional)" kind="hero" name="section" note="Shown beside the text on computers, above it on phones." photo={b.photo} fallback="" onChange={(photo) => setBlock({ photo })} />
                {b.photo && (
                  <div className="flex gap-2">
                    {(["left", "right"] as const).map((side) => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setBlock({ photoSide: side })}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold ${b.photoSide === side ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-mist"}`}
                      >
                        Photo on the {side}
                      </button>
                    ))}
                  </div>
                )}
              </>
            );
          }}
        />
      </Section>

      <Section id="share" title="Link previews" text="The picture shown when someone shares a page on Facebook, WhatsApp, Messenger or by text. Without one, a HealthyZone card with your name and phone is used.">
        {(
          [
            ["home", "Home page"],
            ["book", "Booking page"],
            ["blog", "Blog"],
          ] as const
        ).map(([key, label]) => (
          <PhotoField
            key={key}
            label={label}
            kind="hero"
            name={`share-${key}`}
            note={key === "home" ? "1200 × 630 pixels works best. Also used for other pages without their own." : "Leave empty to use the home page picture."}
            photo={content.share[key]}
            fallback=""
            onChange={(photo) => setContent((c) => ({ ...c, share: { ...c.share, [key]: photo } }))}
          />
        ))}
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
        {background("contact")}
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
            {dirty && <PreviewButton kind="content" value={content} />}
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

/** A list of cards with drag-to-reorder, remove and add. */
function ListEditor<T>({
  items,
  noun,
  onChange,
  blank,
  render,
}: {
  items: T[];
  noun: string;
  /** Receives an updater so it always applies to the latest list. */
  onChange: (change: (list: T[]) => T[]) => void;
  blank: () => T;
  render: (item: T, i: number) => React.ReactNode;
}) {
  const drag = useDragReorder((from, to) =>
    onChange((list) => {
      const next = [...list];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    }),
  );
  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <ol className="space-y-4">
          {items.map((item, i) => (
            <li key={i} {...drag.item(i)} className={`rounded-2xl bg-surface p-5 ring-1 transition ${drag.dragging === i ? "opacity-60 ring-2 ring-blue" : "ring-mist/60"}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 font-semibold text-navy">
                  <DragHandle {...drag.handle(i)} />
                  {noun[0].toUpperCase() + noun.slice(1)} {i + 1}
                </p>
                <button type="button" onClick={() => onChange((list) => list.filter((_, j) => j !== i))} className="rounded-full px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10">
                  Remove
                </button>
              </div>
              <div className="space-y-4">{render(item, i)}</div>
            </li>
          ))}
        </ol>
      )}
      <button
        type="button"
        onClick={() => onChange((list) => [...list, blank()])}
        className="rounded-full border-2 border-dashed border-blue/50 px-5 py-2.5 text-sm font-semibold text-blue-dark hover:border-blue"
      >
        + Add a {noun}
      </button>
    </div>
  );
}

/** Built-in icons (the six HealthyZone ones up front, more on demand) or an uploaded icon. */
function IconPicker({ item, onChange }: { item: ServiceItem; onChange: (change: Partial<ServiceItem>) => void }) {
  const [more, setMore] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const first = serviceIconChoices.slice(0, 6);
  // Keep the current choice visible even when the full list is closed.
  const shown = more ? serviceIconChoices : first.some((c) => c.key === item.icon) ? first : [...first, serviceIconChoices.find((c) => c.key === item.icon)!];

  async function onFile(file: File) {
    setError("");
    if (!/^image\/(png|svg\+xml|webp)$/.test(file.type)) return setError("Please choose a PNG, SVG or WebP icon.");
    if (file.size > 2 * 1024 * 1024) return setError("That icon is over 2 MB. Please choose a smaller one.");
    try {
      setProgress(0);
      const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1];
      const blob = await upload(`site/icon-${Date.now().toString(36)}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/admin/upload",
        contentType: file.type,
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      onChange({ image: { src: blob.url, width: 96, height: 96 } });
    } catch (err) {
      console.error(err);
      setError("The upload didn't work. Please try again.");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const tile = (on: boolean) =>
    `grid h-11 w-11 place-items-center rounded-xl transition ${on ? "bg-navy text-green ring-2 ring-blue" : "bg-white text-muted ring-1 ring-mist hover:text-navy hover:ring-blue"}`;

  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Icon</legend>
      <div className="flex flex-wrap gap-2">
        {item.image && (
          <span className={tile(true)} title="Your uploaded icon">
            <ServiceIconView icon={item.icon} image={item.image} className="h-6 w-6" />
          </span>
        )}
        {shown.map(({ key, label }) => {
          const Icon = serviceIcons[key];
          return (
            <button
              key={key}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={!item.image && item.icon === key}
              onClick={() => onChange({ icon: key, image: null })}
              className={tile(!item.image && item.icon === key)}
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <button type="button" onClick={() => setMore((v) => !v)} className="font-semibold text-blue-dark hover:underline">
          {more ? "Show fewer icons" : `More icons (${serviceIconChoices.length - 6})`}
        </button>
        <input ref={fileRef} type="file" accept="image/png,image/svg+xml,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <button type="button" disabled={progress !== null} onClick={() => fileRef.current?.click()} className="font-semibold text-blue-dark hover:underline disabled:cursor-wait">
          {progress === null ? "Upload your own icon" : `Uploading… ${Math.round(progress)}%`}
        </button>
        {item.image && (
          <button type="button" onClick={() => onChange({ image: null })} className="font-medium text-muted hover:text-navy">
            Remove uploaded icon
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">Uploaded icons sit on the dark blue tile: a white or light icon on a transparent background (PNG or SVG) looks best.</p>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </fieldset>
  );
}

/** Zoom and focus-point sliders for a section background, with a live preview of the section's shape. */
function FramingControls({
  src,
  value,
  fallback,
  onChange,
}: {
  src: string;
  value: Framing;
  fallback: Framing;
  onChange: (f: Framing) => void;
}) {
  const sliders: { key: keyof Framing; label: string; min: number; max: number; left: string; right: string }[] = [
    { key: "zoom", label: "Size", min: 100, max: 250, left: "Whole photo", right: "Zoomed in" },
    { key: "x", label: "Left to right", min: 0, max: 100, left: "Left", right: "Right" },
    { key: "y", label: "Top to bottom", min: 0, max: 100, left: "Top", right: "Bottom" },
  ];
  const changed = JSON.stringify(value) !== JSON.stringify(fallback);
  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Preview on a computer screen</p>
        <div className="relative aspect-[16/7] overflow-hidden rounded-xl bg-ink ring-1 ring-mist/70">
          <Image src={src} alt="" fill sizes="400px" className="object-cover" style={framingStyle(value)} />
        </div>
      </div>
      <div className="space-y-3">
        {sliders.map((s) => (
          <label key={s.key} className="block">
            <span className="flex justify-between text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {s.label}
              <span className="normal-case tracking-normal">{s.key === "zoom" ? `${value.zoom}%` : `${value[s.key]}%`}</span>
            </span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              value={value[s.key]}
              onChange={(e) => onChange({ ...value, [s.key]: Number(e.target.value) })}
              className="mt-1 w-full accent-navy"
            />
            <span className="flex justify-between text-[0.7rem] text-muted">
              <span>{s.left}</span>
              <span>{s.right}</span>
            </span>
          </label>
        ))}
        {changed && (
          <button type="button" onClick={() => onChange(fallback)} className="text-sm font-medium text-blue-dark hover:underline">
            Reset size and position
          </button>
        )}
      </div>
    </div>
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
  kind,
  name,
  onChange,
}: {
  label: string;
  note: string;
  photo: SitePhoto | null;
  fallback: string;
  kind: "hero" | "portrait" | "background";
  /** Start of the uploaded file's name. */
  name: string;
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
      const blob = await upload(`site/${name}-${width}x${height}.${ext}`, file, {
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
        {kind !== "background" && <div className={`relative shrink-0 overflow-hidden rounded-xl bg-surface ring-1 ring-mist/70 ${kind === "portrait" ? "h-36 w-28" : "h-28 w-48"}`}>
          {photo?.src || fallback ? (
            <Image src={photo?.src ?? fallback} alt="" fill sizes="200px" className="object-cover object-top" />
          ) : (
            <span className="grid h-full place-items-center text-xs text-muted">No photo</span>
          )}
        </div>}
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
                {fallback ? "Use the original photo" : "Remove photo"}
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
