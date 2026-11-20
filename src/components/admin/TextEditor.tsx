"use client";

import { useActionState, useMemo, useState } from "react";
import { updateText, type TextState } from "@/app/admin/actions";
import { placeholders, textFields, textGroups, type TextOverrides } from "@/lib/text-data";
import type { Bilingual } from "@/lib/pricing-data";
import { PreviewButton } from "./PreviewButton";
import { BilingualFields, input } from "./fields";

const same = (a: Bilingual, b: Bilingual) => a.en === b.en && a.fr === b.fr;

/** Only the fields that differ from the original text, so the comparison ignores no-op edits. */
const edited = (o: TextOverrides) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(o)
        .filter(([path, v]) => {
          const f = textFields.find((x) => x.path === path);
          return f && !same(v, f.original);
        })
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  );

export function TextEditor({ initial }: { initial: TextOverrides }) {
  const [overrides, setOverrides] = useState(initial);
  const [state, action, pending] = useActionState<TextState, FormData>(updateText, { status: "idle" });
  const [query, setQuery] = useState("");
  const saved = state.overrides ?? initial;
  const dirty = edited(overrides) !== edited(saved);

  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const by = new Map<string, typeof textFields>();
    for (const f of textFields) {
      const v = overrides[f.path] ?? f.original;
      if (q && ![f.label, v.en, v.fr, textGroups[f.group].title].some((s) => s.toLowerCase().includes(q))) continue;
      by.set(f.group, [...(by.get(f.group) ?? []), f]);
    }
    return [...by.entries()];
  }, [overrides, q]);

  return (
    <form action={action} className="space-y-4 pb-28">
      <input type="hidden" name="text" value={JSON.stringify(overrides)} />
      <div className="sticky top-16 z-20 -mx-1 bg-surface/95 px-1 py-2 backdrop-blur lg:top-0">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a word or sentence, in English or French…"
          className={input}
          aria-label="Search the text"
        />
      </div>

      {groups.length === 0 && <p className="rounded-2xl bg-white p-6 text-muted-foreground shadow-card ring-1 ring-mist/60">Nothing matches “{query}”.</p>}

      {groups.map(([group, fields]) => {
        const changed = fields.filter((f) => overrides[f.path] && !same(overrides[f.path], f.original)).length;
        return (
          <details key={group} open={Boolean(q)} className="group rounded-2xl bg-white shadow-card ring-1 ring-mist/60">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 sm:px-7">
              <span>
                <span className="block text-lg font-semibold text-navy">{textGroups[group].title}</span>
                <span className="block text-sm text-muted-foreground">{textGroups[group].text}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {changed > 0 && <span className="rounded-full bg-green/15 px-2.5 py-0.5 text-xs font-semibold text-[#007a43]">{changed} edited</span>}
                <span className="text-xs text-muted-foreground">{fields.length}</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted-foreground transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </summary>
            <div className="space-y-6 border-t border-mist/60 p-6 sm:px-7">
              {fields.map((f) => {
                const value = overrides[f.path] ?? f.original;
                const isEdited = !same(value, f.original);
                const tokens = placeholders(f.original.en);
                return (
                  <div key={f.path}>
                    <BilingualFields
                      label={f.label}
                      multiline={f.multiline}
                      rows={f.original.en.length > 300 ? 7 : 3}
                      hint={tokens.length ? `Keep ${tokens.join(", ")} exactly as written: the site fills them in.` : undefined}
                      value={value}
                      onChange={(patch) => setOverrides((o) => ({ ...o, [f.path]: { ...(o[f.path] ?? f.original), ...patch } }))}
                    />
                    {isEdited && (
                      <button
                        type="button"
                        onClick={() =>
                          setOverrides((o) => {
                            const next = { ...o };
                            delete next[f.path];
                            return next;
                          })
                        }
                        className="mt-1.5 text-xs font-medium text-blue-dark hover:underline"
                      >
                        Back to the original text
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist/70 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="text-sm" role="status" aria-live="polite">
            {state.status === "error" ? (
              <span className="text-danger">{state.message}</span>
            ) : dirty ? (
              <span className="text-muted-foreground">You have unsaved changes.</span>
            ) : state.status === "saved" ? (
              <span className="font-medium text-[#007a43]">Saved. The website has been updated.</span>
            ) : (
              <span className="text-muted-foreground">Everything is up to date.</span>
            )}
          </p>
          <div className="flex shrink-0 gap-2">
            {dirty && <PreviewButton kind="text" value={overrides} />}
            {dirty && (
              <button type="button" onClick={() => setOverrides(saved)} className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-navy">
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
