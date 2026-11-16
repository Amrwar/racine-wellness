"use client";

import { useActionState, useState } from "react";
import { updateDesign, type DesignState } from "@/app/admin/actions";
import {
  defaultDesign,
  designSectionNames,
  menuKeys,
  type Design,
  type DesignSection,
  type SectionStyle,
  type Spacing,
} from "@/lib/design-data";
import { Section } from "./fields";

const menuNames: Record<string, string> = { services: "Services", pricing: "Pricing", about: "About", blog: "Blog", contact: "Contact" };

function ColorField({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-xl bg-surface p-3 ring-1 ring-mist/60">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-navy">{label}</span>
        <span className="block font-mono text-xs uppercase text-muted">{value}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-full bg-surface p-1 ring-1 ring-mist/60">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${value === o.value ? "bg-navy text-white" : "text-navy hover:bg-white"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DesignEditor({ initial, backgrounds }: { initial: Design; backgrounds: Partial<Record<DesignSection, string>> }) {
  const [design, setDesign] = useState(initial);
  const [state, action, pending] = useActionState<DesignState, FormData>(updateDesign, { status: "idle" });
  const [dragging, setDragging] = useState<number | null>(null);
  const [openStyle, setOpenStyle] = useState<DesignSection | null>(null);
  const saved = state.design ?? initial;
  const dirty = JSON.stringify(design) !== JSON.stringify(saved);
  const { navy, blue, green } = design.colors;

  const setColors = (c: Partial<Design["colors"]>) => setDesign((d) => ({ ...d, colors: { ...d.colors, ...c } }));
  const setStyle = (key: DesignSection, s: Partial<SectionStyle>) => setDesign((d) => ({ ...d, style: { ...d.style, [key]: { ...d.style[key], ...s } } }));
  const move = (from: number, to: number) =>
    setDesign((d) => {
      if (to < 0 || to >= d.sections.length || from === to) return d;
      const list = [...d.sections];
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      return { ...d, sections: list };
    });

  return (
    <form action={action} className="space-y-6 pb-28">
      <input type="hidden" name="design" value={JSON.stringify(design)} />

      <Section
        title="Colours"
        text="The website's brand colours. Buttons, headings, icons and highlights all follow them."
        action={
          JSON.stringify(design.colors) !== JSON.stringify(defaultDesign.colors) ||
          design.header.bg !== defaultDesign.header.bg ||
          design.footer.bg !== defaultDesign.footer.bg ? (
            <button
              type="button"
              onClick={() => setDesign((d) => ({ ...d, colors: defaultDesign.colors, header: defaultDesign.header, footer: defaultDesign.footer }))}
              className="shrink-0 text-sm font-medium text-blue-dark hover:underline"
            >
              Original colours
            </button>
          ) : null
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <ColorField label="Main colour" hint="Headings, dark sections" value={navy} onChange={(v) => setColors({ navy: v })} />
          <ColorField label="Accent colour" hint="Buttons and links" value={blue} onChange={(v) => setColors({ blue: v })} />
          <ColorField label="Highlight colour" hint="Icons and small details" value={green} onChange={(v) => setColors({ green: v })} />
          <ColorField label="Top menu bar" hint="Text is white: pick a dark colour" value={design.header.bg} onChange={(v) => setDesign((d) => ({ ...d, header: { bg: v } }))} />
          <ColorField label="Footer" hint="Text is white: pick a dark colour" value={design.footer.bg} onChange={(v) => setDesign((d) => ({ ...d, footer: { bg: v } }))} />
        </div>
        {/* Live preview */}
        <div className="overflow-hidden rounded-2xl ring-1 ring-mist/70" aria-label="Preview">
          <div className="flex items-center justify-between px-5 py-3" style={{ background: design.header.bg }}>
            <span className="text-lg font-bold">
              <span style={{ color: blue }}>Healthy</span>
              <span style={{ color: green }}>Zone</span>
            </span>
            <span className="rounded-full px-4 py-1.5 text-xs font-semibold text-white" style={{ background: `color-mix(in oklab, ${blue} 78%, black)` }}>
              Book a session
            </span>
          </div>
          <div className="bg-white px-5 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: `color-mix(in oklab, ${blue} 78%, black)` }}>
              Services
            </p>
            <p className="mt-1 text-xl font-semibold" style={{ color: navy }}>
              Care tailored to your body
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: navy, color: green }}>
                ✓
              </span>
              <span className="text-sm text-muted">Icons, links and buttons use these colours.</span>
            </div>
          </div>
          <div className="px-5 py-3 text-xs text-white/70" style={{ background: design.footer.bg }}>
            © HealthyZone · Footer
          </div>
        </div>
      </Section>

      <Section title="Text size" text="Makes all text on the website larger or smaller.">
        <Segmented
          label="Text size"
          value={design.textScale}
          onChange={(v) => setDesign((d) => ({ ...d, textScale: v }))}
          options={[
            { value: 90, label: "Smaller" },
            { value: 100, label: "Normal" },
            { value: 110, label: "Larger" },
            { value: 120, label: "Largest" },
          ]}
        />
      </Section>

      <Section title="Home page sections" text="Drag to change the order, switch a section off to hide it, and open Style to change its colour wash and height.">
        <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted ring-1 ring-mist/60">
          <span className="font-semibold text-navy">Top of the page</span> (photo and main heading) always comes first.
        </p>
        <ol className="space-y-3">
          {design.sections.map((s, i) => {
            const st = design.style[s.key];
            const bg = backgrounds[s.key];
            return (
              <li
                key={s.key}
                draggable
                onDragStart={(e) => {
                  setDragging(i);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragging !== null && dragging !== i) {
                    move(dragging, i);
                    setDragging(i);
                  }
                }}
                onDragEnd={() => setDragging(null)}
                className={`rounded-2xl bg-white ring-1 transition ${dragging === i ? "opacity-60 ring-2 ring-blue" : "ring-mist/70"}`}
              >
                <div className="flex items-center gap-3 p-3 sm:p-4">
                  <span className="cursor-grab text-muted active:cursor-grabbing" title="Drag to move" aria-hidden>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <circle cx="9" cy="6" r="1.5" />
                      <circle cx="15" cy="6" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="18" r="1.5" />
                      <circle cx="15" cy="18" r="1.5" />
                    </svg>
                  </span>
                  {/* Thumbnail with the section's photo and colour wash */}
                  <span className="relative hidden h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-mist/70 sm:block">
                    {bg && (
                      // eslint-disable-next-line @next/next/no-img-element -- tiny preview
                      <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <span className="absolute inset-0" style={{ background: st.overlay, opacity: st.strength / 100 }} />
                  </span>
                  <span className={`min-w-0 flex-1 font-semibold ${s.visible ? "text-navy" : "text-muted line-through"}`}>
                    {i + 1}. {designSectionNames[s.key]}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface hover:text-navy disabled:opacity-30">
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={i === design.sections.length - 1}
                      onClick={() => move(i, i + 1)}
                      className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface hover:text-navy disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenStyle((o) => (o === s.key ? null : s.key))}
                      aria-expanded={openStyle === s.key}
                      className="rounded-full px-3 py-1.5 text-sm font-semibold text-blue-dark hover:bg-surface"
                    >
                      Style
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={s.visible}
                      aria-label={`Show the ${designSectionNames[s.key]} section`}
                      onClick={() => setDesign((d) => ({ ...d, sections: d.sections.map((x) => (x.key === s.key ? { ...x, visible: !x.visible } : x)) }))}
                      className={`relative ml-1 h-7 w-12 shrink-0 rounded-full transition ${s.visible ? "bg-green" : "bg-mist"}`}
                    >
                      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${s.visible ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                </div>
                {openStyle === s.key && (
                  <div className="grid gap-5 border-t border-mist/60 p-4 sm:grid-cols-[auto_1fr] sm:p-5">
                    <label className="flex items-center gap-3">
                      <input type="color" value={st.overlay} onChange={(e) => setStyle(s.key, { overlay: e.target.value })} className="h-11 w-11 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
                      <span className="text-sm font-semibold text-navy">Colour wash</span>
                    </label>
                    <label className="block">
                      <span className="flex justify-between text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        Strength <span className="normal-case tracking-normal">{st.strength ? `${st.strength}%` : "Off"}</span>
                      </span>
                      <input type="range" min={0} max={90} step={5} value={st.strength} onChange={(e) => setStyle(s.key, { strength: Number(e.target.value) })} className="mt-1 w-full accent-navy" />
                      <span className="flex justify-between text-[0.7rem] text-muted">
                        <span>Original</span>
                        <span>Strong</span>
                      </span>
                    </label>
                    <div className="sm:col-span-2">
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Height</p>
                      <Segmented<Spacing>
                        label="Section height"
                        value={st.spacing}
                        onChange={(v) => setStyle(s.key, { spacing: v })}
                        options={[
                          { value: "compact", label: "Compact" },
                          { value: "normal", label: "Normal" },
                          { value: "spacious", label: "Spacious" },
                        ]}
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </Section>

      <Section title="Top menu" text="Choose which links appear in the top menu. Links to hidden sections are hidden automatically. The link names are edited under Text & photos → All other text.">
        <div className="flex flex-wrap gap-3">
          {menuKeys.map((k) => {
            const sectionHidden = design.sections.some((s) => s.key === k && !s.visible);
            const shown = !design.hiddenMenu.includes(k) && !sectionHidden;
            return (
              <label key={k} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 ${shown ? "bg-white text-navy ring-mist" : "bg-surface text-muted ring-mist/60"}`}>
                <input
                  type="checkbox"
                  checked={shown}
                  disabled={sectionHidden}
                  onChange={() =>
                    setDesign((d) => ({
                      ...d,
                      hiddenMenu: d.hiddenMenu.includes(k) ? d.hiddenMenu.filter((x) => x !== k) : [...d.hiddenMenu, k],
                    }))
                  }
                  className="h-4 w-4 accent-navy"
                />
                {menuNames[k]}
                {sectionHidden && <span className="text-xs">(section hidden)</span>}
              </label>
            );
          })}
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist/70 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="text-sm" role="status" aria-live="polite">
            {state.status === "error" ? (
              <span className="text-danger">{state.message}</span>
            ) : dirty ? (
              <span className="text-muted">You have unsaved changes.</span>
            ) : state.status === "saved" ? (
              <span className="font-medium text-[#007a43]">
                Saved.{" "}
                <a href="/" target="_blank" rel="noopener" className="underline">
                  See the website
                </a>
              </span>
            ) : (
              <span className="text-muted">Everything is up to date.</span>
            )}
          </p>
          <div className="flex shrink-0 gap-2">
            {dirty && (
              <button type="button" onClick={() => setDesign(saved)} className="rounded-full px-4 py-2.5 text-sm font-medium text-muted hover:text-navy">
                Undo changes
              </button>
            )}
            <button
              type="button"
              onClick={() => setDesign(defaultDesign)}
              className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-muted hover:text-navy sm:block"
            >
              Reset all
            </button>
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
