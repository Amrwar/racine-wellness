"use client";

import { useRef, useState, useTransition } from "react";
import { translateToFrench } from "@/app/admin/actions";
import type { Bilingual } from "@/lib/pricing-data";

export const input =
  "w-full rounded-xl border border-mist bg-white px-3.5 py-2.5 text-ink outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/15";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Section({
  id,
  title,
  text,
  children,
  action,
}: {
  id?: string;
  title: string;
  text?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-card ring-1 ring-mist/60 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          {text && <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/**
 * English and French side by side. The French side has a "Translate from English" button that
 * drafts the French with AI; Ziad reviews it before saving.
 * onChange receives only the language that changed, so parents merge it into their latest state:
 * a translation that finishes after other edits never overwrites them.
 */
export function BilingualFields({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  hint,
}: {
  label: string;
  value: Bilingual;
  onChange: (patch: Partial<Bilingual>) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [drafted, setDrafted] = useState(false);
  const Tag = multiline ? "textarea" : "input";

  const translate = () => {
    setError("");
    start(async () => {
      const res = await translateToFrench(value.en);
      if (res.text) {
        onChange({ fr: res.text });
        setDrafted(true);
      } else setError(res.error ?? "The translation didn't work.");
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={`${label} · English`} hint={hint}>
        <Tag
          value={value.en}
          onChange={(e) => onChange({ en: e.target.value })}
          rows={multiline ? rows : undefined}
          className={`${input} ${multiline ? "resize-y leading-relaxed" : ""}`}
        />
      </Field>
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label} · Français</span>
          <button
            type="button"
            onClick={translate}
            disabled={pending || !value.en.trim()}
            title="Writes a French draft from the English text. Check it before saving."
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-blue-dark transition hover:bg-blue/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c0 4-3 7-6 8M13 21l4-10 4 10M14.5 17h5" />
            </svg>
            {pending ? "Translating…" : "Translate from English"}
          </button>
        </div>
        <Tag
          aria-label={`${label} · Français`}
          value={value.fr}
          onChange={(e) => {
            onChange({ fr: e.target.value });
            setDrafted(false);
          }}
          rows={multiline ? rows : undefined}
          className={`${input} ${multiline ? "resize-y leading-relaxed" : ""} ${drafted ? "border-blue bg-blue/[0.03]" : ""}`}
        />
        {drafted && <p className="mt-1.5 text-xs text-blue-dark">Translated automatically. Please read it over before saving.</p>}
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    </div>
  );
}

/**
 * Drag-to-reorder for a list of cards that contain text fields: dragging starts only from the
 * handle, so selecting text inside a field never moves the card.
 */
export function useDragReorder(move: (from: number, to: number) => void) {
  const [armed, setArmed] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  // A ref as well as state: drag events can arrive before React re-renders.
  const current = useRef<number | null>(null);
  const item = (i: number) => ({
    draggable: armed === i,
    onDragStart: (e: React.DragEvent) => {
      current.current = i;
      setDragging(i);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(i));
    },
    onDragEnter: (e: React.DragEvent) => {
      if (current.current !== null) e.preventDefault();
    },
    onDragOver: (e: React.DragEvent) => {
      const from = current.current;
      if (from === null) return;
      e.preventDefault();
      if (from !== i) {
        move(from, i);
        current.current = i;
        setDragging(i);
      }
    },
    onDrop: (e: React.DragEvent) => e.preventDefault(),
    onDragEnd: () => {
      current.current = null;
      setDragging(null);
      setArmed(null);
    },
  });
  const handle = (i: number) => ({
    onPointerDown: () => setArmed(i),
    onPointerUp: () => setArmed(null),
  });
  return { item, handle, dragging };
}

/** The six-dot grip shown on draggable cards. */
export function DragHandle(props: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} title="Drag to move" className="cursor-grab touch-none text-muted-foreground hover:text-navy active:cursor-grabbing">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
      </svg>
    </span>
  );
}
