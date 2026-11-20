"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getEditState, saveInlineEdits, type EditState } from "@/app/admin/actions";

/**
 * On-site edit mode (admin only, inside preview): click any outlined text to change it, and use the
 * side panel to reorder or hide sections. Saving publishes the changes for the language shown.
 */
export function SiteEditor() {
  const params = useSearchParams();
  const pathname = usePathname();
  const active = params.get("edit") === "1";
  const locale = pathname.startsWith("/fr") ? "fr" : "en";
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<EditState["sections"] | null>(null);
  const [sectionsChanged, setSectionsChanged] = useState(false);
  const [panel, setPanel] = useState(true);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const original = useRef<Record<string, string>>({});

  // Make marked text editable.
  useEffect(() => {
    if (!active) return;
    const els = [...document.querySelectorAll<HTMLElement>("[data-edit]")].filter((el) => el.dataset.edit);
    for (const el of els) {
      original.current[el.dataset.edit!] ??= el.innerText;
      el.contentEditable = "plaintext-only";
      el.spellcheck = true;
      el.classList.add("hz-editable");
    }
    const onInput = (e: Event) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-edit]");
      if (!el?.dataset.edit) return;
      const path = el.dataset.edit;
      const value = el.innerText;
      setTexts((t) => {
        const next = { ...t };
        if (value === original.current[path]) delete next[path];
        else next[path] = value;
        return next;
      });
    };
    // Links and buttons inside editable areas shouldn't navigate while editing.
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-edit]")) e.preventDefault();
    };
    document.addEventListener("input", onInput);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("input", onInput);
      document.removeEventListener("click", onClick, true);
      for (const el of els) {
        el.contentEditable = "false";
        el.classList.remove("hz-editable");
      }
    };
  }, [active]);

  useEffect(() => {
    if (active) getEditState().then((s) => setSections(s.sections));
  }, [active]);

  // Reflect order and visibility on the page right away.
  const applySections = useCallback((list: EditState["sections"]) => {
    const wrappers = new Map([...document.querySelectorAll<HTMLElement>("[data-section]")].map((el) => [el.dataset.section!, el]));
    const first = [...wrappers.values()][0];
    const parent = first?.parentElement;
    if (!parent) return;
    let anchor: ChildNode | null = first.previousSibling;
    for (const s of list) {
      const el = wrappers.get(s.key);
      if (!el) continue;
      el.style.display = s.visible ? "" : "none";
      if (anchor) anchor.after(el);
      else parent.prepend(el);
      anchor = el;
    }
  }, []);

  const changeSections = (fn: (list: EditState["sections"]) => EditState["sections"]) => {
    setSections((list) => {
      if (!list) return list;
      const next = fn(list);
      applySections(next);
      return next;
    });
    setSectionsChanged(true);
  };

  if (!active) return null;
  const count = Object.keys(texts).length + (sectionsChanged ? 1 : 0);

  const save = () =>
    start(async () => {
      const res = await saveInlineEdits({ locale, texts, sections: sectionsChanged && sections ? sections.map(({ key, visible }) => ({ key, visible })) : undefined });
      if (res.status === "error") return setMessage({ tone: "error", text: res.message ?? "Saving failed." });
      setMessage({ tone: "ok", text: res.message ?? "Saved." });
      Object.assign(original.current, texts);
      setTexts({});
      setSectionsChanged(false);
    });

  return (
    <>
      <style>{`
        .hz-editable { outline: 2px dashed rgba(0,159,251,.55); outline-offset: 4px; border-radius: 4px; cursor: text; }
        .hz-editable:hover { outline-color: #009ffb; background: rgba(0,159,251,.06); }
        .hz-editable:focus { outline: 2px solid #009ffb; background: rgba(0,159,251,.08); }
      `}</style>

      {/* Top toolbar */}
      <div className="fixed inset-x-0 bottom-0 z-[95] border-t border-white/10 bg-[#111827] text-white shadow-2xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm">
            <strong className="font-semibold">Editing the {locale === "fr" ? "French" : "English"} page.</strong>{" "}
            <span className="text-white/70">Click any outlined text to change it.</span>
            {message && <span className={`ml-2 font-medium ${message.tone === "ok" ? "text-green" : "text-[#fca5a5]"}`}>{message.text}</span>}
          </p>
          <div className="flex items-center gap-2">
            <a href={locale === "fr" ? "/admin/edit" : "/admin/edit?lang=fr"} className="rounded-full px-3 py-1.5 text-sm text-white/80 hover:text-white">
              {locale === "fr" ? "Edit English" : "Edit French"}
            </a>
            <button type="button" onClick={() => setPanel((p) => !p)} className="rounded-full px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/20 hover:text-white">
              Sections
            </button>
            {count > 0 && (
              <button type="button" onClick={() => location.reload()} className="rounded-full px-3 py-1.5 text-sm text-white/80 hover:text-white">
                Discard
              </button>
            )}
            <button
              type="button"
              disabled={!count || pending}
              onClick={save}
              className="rounded-full bg-[#0077c0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#00649f] disabled:opacity-40"
            >
              {pending ? "Saving…" : count ? `Save ${count} change${count === 1 ? "" : "s"}` : "No changes"}
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- route handler: needs a full page load */}
            <a href="/admin/preview/exit?to=/admin" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-mist">
              Done
            </a>
          </div>
        </div>
      </div>

      {/* Sections panel */}
      {panel && sections && (
        <aside className="fixed right-4 top-24 z-[95] w-64 overflow-hidden rounded-2xl bg-white text-ink shadow-2xl ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-mist/70 px-4 py-3">
            <p className="text-sm font-semibold text-navy">Sections</p>
            <button type="button" aria-label="Close" onClick={() => setPanel(false)} className="text-muted-foreground hover:text-navy">
              ×
            </button>
          </div>
          <p className="px-4 pt-2 text-xs text-muted-foreground">Top of the page always comes first.</p>
          <ol className="max-h-[60vh] space-y-1 overflow-y-auto p-2">
            {sections.map((s, i) => (
              <li key={s.key} className="flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-surface">
                <button
                  type="button"
                  className={`min-w-0 flex-1 truncate text-left text-sm ${s.visible ? "text-navy" : "text-muted-foreground line-through"}`}
                  onClick={() => document.querySelector(`[data-section="${s.key}"]`)?.scrollIntoView({ behavior: "smooth" })}
                >
                  {s.name}
                </button>
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => changeSections((l) => swap(l, i, i - 1))} className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-white hover:text-navy disabled:opacity-30">
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={i === sections.length - 1}
                  onClick={() => changeSections((l) => swap(l, i, i + 1))}
                  className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-white hover:text-navy disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => changeSections((l) => l.map((x) => (x.key === s.key ? { ...x, visible: !x.visible } : x)))}
                  className="rounded px-1.5 py-1 text-xs font-semibold text-blue-dark hover:bg-white"
                >
                  {s.visible ? "Hide" : "Show"}
                </button>
              </li>
            ))}
          </ol>
          <p className="border-t border-mist/70 px-4 py-2.5 text-xs text-muted-foreground">Photos, colours and more: in the admin.</p>
        </aside>
      )}
    </>
  );
}

function swap<T>(list: T[], a: number, b: number) {
  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}
