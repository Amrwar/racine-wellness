"use client";

import { useEffect, useRef, useState } from "react";
import { savePreviewDraft } from "@/app/admin/actions";
import type { PreviewableKey } from "@/lib/settings";

const devices = {
  desktop: { width: 1280, height: 860, label: "Computer" },
  phone: { width: 390, height: 844, label: "Phone" },
} as const;

/**
 * The real website in a frame, showing the editor's unsaved changes (via preview/Draft Mode).
 * Each change is stored as a draft after a short pause, then the frame reloads where it was.
 */
export function LivePreview({ kind, value, focus }: { kind: PreviewableKey; value: unknown; focus?: string | null }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<keyof typeof devices>("desktop");
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [width, setWidth] = useState(600);
  const [status, setStatus] = useState<"ready" | "updating" | "error">("ready");
  const json = JSON.stringify(value);
  const first = useRef(true);
  const keepScroll = useRef(0);

  // Fit the frame to the column.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Save the draft after a pause, then reload the frame.
  useEffect(() => {
    // The frame already shows the starting state; only later edits need a draft.
    if (first.current) {
      first.current = false;
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setStatus("updating");
      const res = await savePreviewDraft(kind, json);
      if (cancelled) return;
      if (!res.ok) return setStatus("error");
      const win = frame.current?.contentWindow;
      keepScroll.current = win?.scrollY ?? 0;
      win?.location.reload();
    }, 700);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [json, kind]);

  // Scroll the preview to the section being edited.
  useEffect(() => {
    if (!focus) return;
    frame.current?.contentDocument?.getElementById(focus)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focus]);

  const d = devices[device];
  const scale = Math.min(1, width / d.width);
  const path = lang === "fr" ? "/fr" : "/";
  const src = `/admin/preview/start?to=${encodeURIComponent(path)}&embed=1`;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-[#e9edf2] ring-1 ring-mist/70">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mist/70 bg-white px-3 py-2">
        <div className="flex items-center gap-1 rounded-full bg-surface p-0.5">
          {(Object.keys(devices) as (keyof typeof devices)[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setDevice(k)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${device === k ? "bg-navy text-white" : "text-navy hover:bg-white"}`}
            >
              {devices[k].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-surface p-0.5">
          {(["en", "fr"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${lang === l ? "bg-navy text-white" : "text-navy hover:bg-white"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted" aria-live="polite">
          <span className={`h-2 w-2 rounded-full ${status === "updating" ? "animate-pulse bg-blue" : status === "error" ? "bg-danger" : "bg-green"}`} />
          {status === "updating" ? "Updating…" : status === "error" ? "Preview failed" : "Live preview"}
        </span>
        <a href={`/admin/preview/start?to=${encodeURIComponent(path)}`} target="_blank" rel="noopener" className="text-xs font-semibold text-blue-dark hover:underline">
          Open full page ↗
        </a>
      </div>
      <div ref={box} className="relative min-h-0 flex-1 overflow-hidden p-3">
        <div className="mx-auto overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/5" style={{ width: d.width * scale, height: "100%" }}>
          <iframe
            key={`${device}-${lang}`}
            ref={frame}
            src={src}
            title="Website preview"
            onLoad={() => {
              setStatus("ready");
              const win = frame.current?.contentWindow;
              if (win && keepScroll.current) win.scrollTo(0, keepScroll.current);
            }}
            style={{ width: d.width, height: `${100 / scale}%`, transform: `scale(${scale})`, transformOrigin: "0 0" }}
            className="border-0"
          />
        </div>
      </div>
    </div>
  );
}
