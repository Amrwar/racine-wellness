"use client";

import { useActionState, useState } from "react";
import { updateDesign, type DesignState } from "@/app/admin/actions";
import {
  defaultDesign,
  designSectionNames,
  fontChoices,
  menuKeys,
  type ButtonShape,
  type Design,
  type DesignSection,
  type FontKey,
  type FormFields,
  type HeroSize,
  type Layout,
  type SectionStyle,
  type Spacing,
} from "@/lib/design-data";
import { DragHandle, useDragReorder } from "./fields";
import { LivePreview } from "./LivePreview";

const menuNames: Record<string, string> = { services: "Services", pricing: "Pricing", about: "About", blog: "Blog", contact: "Contact" };
/** Element ids on the home page, so the preview can scroll to the section being edited. */
const anchors: Record<DesignSection, string> = { services: "services", pricing: "pricing", about: "about", blog: "latest", contact: "contact" };

const tabs = [
  { key: "brand", label: "Brand", d: "M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.8-.8-1.3-.8-2.2 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-7.8-9-7.8z" },
  { key: "hero", label: "Top of page", d: "M3 5h18v14H3zM7 10h6M7 14h10" },
  { key: "sections", label: "Sections", d: "M4 5h16M4 12h16M4 19h16" },
  { key: "forms", label: "Forms & menu", d: "M5 4h14v16H5zM9 9h6M9 13h6M9 17h3" },
] as const;
type Tab = (typeof tabs)[number]["key"];

/* ---------------- Small controls ---------------- */

function Panel({ title, text, children, action }: { title: string; text?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-mist/60 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-navy">{title}</h2>
          {text && <p className="mt-0.5 text-sm text-muted">{text}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{children}</p>;
}

function Swatch({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-surface">
      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl shadow-inner ring-1 ring-black/10" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-navy">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      <span className="ml-auto font-mono text-[0.7rem] uppercase text-muted">{value}</span>
    </label>
  );
}

function Choice<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; preview?: React.ReactNode }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`grid gap-2 ${options.length === 2 ? "grid-cols-2" : options.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${
              on ? "bg-navy text-white shadow-md" : "bg-surface text-navy ring-1 ring-mist/70 hover:ring-blue"
            }`}
          >
            {o.preview}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={`relative h-6 w-10 shrink-0 rounded-full transition ${on ? "bg-green" : "bg-mist"}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-5" : "left-1"}`} />
    </button>
  );
}

function Slider({ label, value, min, max, step = 5, left, right, onChange, format }: { label: string; value: number; min: number; max: number; step?: number; left: string; right: string; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label} <span className="normal-case tracking-normal text-navy">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-navy" />
      <span className="flex justify-between text-[0.7rem] text-muted">
        <span>{left}</span>
        <span>{right}</span>
      </span>
    </label>
  );
}

const fontFamily = (k: FontKey) => `var(--font-${k}), ${k === "lora" || k === "playfair" ? "Georgia, serif" : "system-ui, sans-serif"}`;

/* ---------------- Editor ---------------- */

export function DesignEditor({ initial, backgrounds }: { initial: Design; backgrounds: Partial<Record<DesignSection, string>> }) {
  const [design, setDesign] = useState(initial);
  const [state, action, pending] = useActionState<DesignState, FormData>(updateDesign, { status: "idle" });
  const [tab, setTab] = useState<Tab>("brand");
  const [openStyle, setOpenStyle] = useState<DesignSection | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const saved = state.design ?? initial;
  const dirty = JSON.stringify(design) !== JSON.stringify(saved);
  const { navy, blue, green } = design.colors;

  const setColors = (c: Partial<Design["colors"]>) => setDesign((d) => ({ ...d, colors: { ...d.colors, ...c } }));
  const setLayout = (l: Partial<Layout>) => setDesign((d) => ({ ...d, layout: { ...d.layout, ...l } }));
  const setForms = (f: Partial<FormFields>) => setDesign((d) => ({ ...d, forms: { ...d.forms, ...f } }));
  const setHero = (h: Partial<Design["hero"]>) => setDesign((d) => ({ ...d, hero: { ...d.hero, ...h } }));
  const setStyle = (key: DesignSection, s: Partial<SectionStyle>) => setDesign((d) => ({ ...d, style: { ...d.style, [key]: { ...d.style[key], ...s } } }));
  const move = (from: number, to: number) =>
    setDesign((d) => {
      if (to < 0 || to >= d.sections.length || from === to) return d;
      const list = [...d.sections];
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      return { ...d, sections: list };
    });
  const drag = useDragReorder(move);
  const show = (t: Tab) => {
    setTab(t);
    setFocus(t === "hero" || t === "brand" ? "main" : t === "forms" ? "contact" : null);
  };

  const presets = [
    { name: "HealthyZone", colors: defaultDesign.colors, header: "#004575", footer: "#00304f" },
    { name: "Forest", colors: { navy: "#1f4d3a", blue: "#2f8f5b", green: "#b8e986" }, header: "#1f4d3a", footer: "#16372a" },
    { name: "Ocean", colors: { navy: "#0b3b5c", blue: "#1fa2c7", green: "#7fe3d4" }, header: "#0b3b5c", footer: "#082a42" },
    { name: "Plum", colors: { navy: "#4a2545", blue: "#b5487a", green: "#f2b8c6" }, header: "#4a2545", footer: "#341a31" },
    { name: "Charcoal", colors: { navy: "#24282f", blue: "#d08b3e", green: "#f0c987" }, header: "#24282f", footer: "#181b20" },
  ];

  const layoutControl = (key: DesignSection) => {
    if (key === "services" || key === "pricing" || key === "blog") {
      const field = `${key}Columns` as "servicesColumns" | "pricingColumns" | "blogColumns";
      return (
        <Choice<number>
          label="Cards per row"
          value={design.layout[field]}
          onChange={(v) => setLayout({ [field]: v === 2 ? 2 : 3 } as Partial<Layout>)}
          options={[2, 3].map((n) => ({
            value: n,
            label: `${n} per row`,
            preview: (
              <span className="flex gap-0.5">
                {Array.from({ length: n }, (_, i) => (
                  <span key={i} className="h-4 w-3 rounded-sm bg-current opacity-60" />
                ))}
              </span>
            ),
          }))}
        />
      );
    }
    const field = key === "about" ? "aboutPhoto" : "contactForm";
    const thing = key === "about" ? "Photo" : "Form";
    return (
      <Choice
        label={`${thing} side`}
        value={design.layout[field]}
        onChange={(v) => setLayout({ [field]: v } as Partial<Layout>)}
        options={(["left", "right"] as const).map((side) => ({
          value: side,
          label: `${thing} ${side}`,
          preview: (
            <span className={`flex gap-0.5 ${side === "right" ? "flex-row-reverse" : ""}`}>
              <span className="h-4 w-4 rounded-sm bg-current" />
              <span className="h-4 w-6 rounded-sm bg-current opacity-40" />
            </span>
          ),
        }))}
      />
    );
  };

  return (
    <form action={action} className="wide-page pb-28">
      <input type="hidden" name="design" value={JSON.stringify(design)} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {/* ---------- Controls ---------- */}
        <div className="space-y-4">
          <nav aria-label="Design areas" className="grid grid-cols-4 gap-1 rounded-2xl bg-white p-1 shadow-card ring-1 ring-mist/60">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => show(t.key)}
                aria-current={tab === t.key ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[0.72rem] font-semibold transition ${tab === t.key ? "bg-navy text-white" : "text-navy hover:bg-surface"}`}
              >
                <svg viewBox="0 0 24 24" className={`h-5 w-5 ${tab === t.key ? "text-green" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={t.d} />
                </svg>
                {t.label}
              </button>
            ))}
          </nav>

          {tab === "brand" && (
            <>
              <Panel title="Colour themes" text="Start from a ready-made palette, then fine-tune below.">
                <div className="grid grid-cols-5 gap-2">
                  {presets.map((p) => {
                    const on = JSON.stringify(p.colors) === JSON.stringify(design.colors) && design.header.bg === p.header;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setDesign((d) => ({ ...d, colors: p.colors, header: { bg: p.header }, footer: { bg: p.footer } }))}
                        className={`rounded-xl p-1.5 text-[0.68rem] font-semibold text-navy transition ${on ? "ring-2 ring-blue" : "ring-1 ring-mist/70 hover:ring-blue/60"}`}
                      >
                        <span className="flex h-9 overflow-hidden rounded-lg">
                          <span className="flex-[2]" style={{ background: p.colors.navy }} />
                          <span className="flex-1" style={{ background: p.colors.blue }} />
                          <span className="flex-1" style={{ background: p.colors.green }} />
                        </span>
                        <span className="mt-1 block truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </Panel>
              <Panel title="Colours">
                <div className="-mx-2 divide-y divide-mist/50">
                  <Swatch label="Main colour" hint="Headings and dark areas" value={navy} onChange={(v) => setColors({ navy: v })} />
                  <Swatch label="Accent colour" hint="Buttons and links" value={blue} onChange={(v) => setColors({ blue: v })} />
                  <Swatch label="Highlight colour" hint="Icons and small details" value={green} onChange={(v) => setColors({ green: v })} />
                  <Swatch label="Top menu bar" hint="Pick a dark colour (white text)" value={design.header.bg} onChange={(v) => setDesign((d) => ({ ...d, header: { bg: v } }))} />
                  <Swatch label="Footer" hint="Pick a dark colour (white text)" value={design.footer.bg} onChange={(v) => setDesign((d) => ({ ...d, footer: { bg: v } }))} />
                </div>
              </Panel>
              <Panel title="Fonts">
                {(["heading", "body"] as const).map((slot) => (
                  <div key={slot}>
                    <Label>{slot === "heading" ? "Headings" : "Text"}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {fontChoices.map((f) => {
                        const on = design.fonts[slot] === f.key;
                        return (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => setDesign((d) => ({ ...d, fonts: { ...d.fonts, [slot]: f.key } }))}
                            className={`rounded-xl px-3 py-2 text-left transition ${on ? "bg-navy text-white" : "bg-surface text-navy ring-1 ring-mist/70 hover:ring-blue"}`}
                          >
                            <span className="block text-base" style={{ fontFamily: fontFamily(f.key) }}>
                              {f.name}
                            </span>
                            <span className={`block text-[0.68rem] ${on ? "text-white/70" : "text-muted"}`}>{f.note}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </Panel>
              <Panel title="Text size and buttons">
                <div>
                  <Label>Text size</Label>
                  <Choice
                    label="Text size"
                    value={design.textScale}
                    onChange={(v) => setDesign((d) => ({ ...d, textScale: v }))}
                    options={[
                      { value: 90, label: "Smaller", preview: <span className="text-xs">Aa</span> },
                      { value: 100, label: "Normal", preview: <span className="text-sm">Aa</span> },
                      { value: 110, label: "Larger", preview: <span className="text-base">Aa</span> },
                      { value: 120, label: "Largest", preview: <span className="text-lg leading-5">Aa</span> },
                    ]}
                  />
                </div>
                <div>
                  <Label>Button shape</Label>
                  <Choice<ButtonShape>
                    label="Button shape"
                    value={design.buttons.shape}
                    onChange={(v) => setDesign((d) => ({ ...d, buttons: { shape: v } }))}
                    options={(
                      [
                        ["pill", "Round", 9999],
                        ["rounded", "Soft", 6],
                        ["square", "Square", 2],
                      ] as const
                    ).map(([value, label, r]) => ({ value, label, preview: <span className="h-4 w-10 bg-current opacity-70" style={{ borderRadius: r }} /> }))}
                  />
                </div>
              </Panel>
            </>
          )}

          {tab === "hero" && (
            <Panel title="Top of the page" text="The large photo with your main heading. The photo and words are on the Text & photos page.">
              <div>
                <Label>Heading size</Label>
                <Choice<HeroSize>
                  label="Heading size"
                  value={design.hero.size}
                  onChange={(v) => setHero({ size: v })}
                  options={[
                    { value: "small", label: "Smaller", preview: <span className="text-sm font-bold">Aa</span> },
                    { value: "normal", label: "Normal", preview: <span className="text-lg font-bold leading-5">Aa</span> },
                    { value: "large", label: "Larger", preview: <span className="text-2xl font-bold leading-6">Aa</span> },
                  ]}
                />
              </div>
              <div>
                <Label>Text position</Label>
                <Choice
                  label="Text position"
                  value={design.hero.align}
                  onChange={(v) => setHero({ align: v })}
                  options={(["left", "center"] as const).map((a) => ({
                    value: a,
                    label: a === "left" ? "Left" : "Centred",
                    preview: (
                      <span className={`flex w-10 flex-col gap-0.5 ${a === "center" ? "items-center" : "items-start"}`}>
                        <span className="h-1 w-8 rounded bg-current" />
                        <span className="h-1 w-5 rounded bg-current opacity-60" />
                      </span>
                    ),
                  }))}
                />
              </div>
              <Slider label="Darken the photo" value={design.hero.shade} min={0} max={80} left="Original" right="Darker" onChange={(v) => setHero({ shade: v })} format={(v) => (v ? `${v}%` : "Off")} />
            </Panel>
          )}

          {tab === "sections" && (
            <Panel title="Home page sections" text="Drag to reorder, switch off to hide, open a section to change its look. The top of the page always comes first.">
              <ol className="space-y-2">
                {design.sections.map((s, i) => {
                  const st = design.style[s.key];
                  const bg = backgrounds[s.key];
                  const open = openStyle === s.key;
                  return (
                    <li
                      key={s.key}
                      {...drag.item(i)}
                      className={`overflow-hidden rounded-xl bg-white ring-1 transition ${drag.dragging === i ? "opacity-60 ring-2 ring-blue" : open ? "ring-blue/60" : "ring-mist/70"}`}
                    >
                      <div className="flex items-center gap-2.5 p-2.5">
                        <DragHandle {...drag.handle(i)} />
                        <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-mist/70">
                          {bg && (
                            // eslint-disable-next-line @next/next/no-img-element -- tiny preview
                            <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
                          )}
                          <span className="absolute inset-0" style={{ background: st.overlay, opacity: st.strength / 100 }} />
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenStyle(open ? null : s.key);
                            setFocus(anchors[s.key]);
                          }}
                          aria-expanded={open}
                          className={`min-w-0 flex-1 text-left text-sm font-semibold ${s.visible ? "text-navy" : "text-muted line-through"}`}
                        >
                          {designSectionNames[s.key]}
                          <span className="block text-xs font-normal text-muted">{open ? "Close" : "Change look"}</span>
                        </button>
                        <Toggle
                          on={s.visible}
                          label={`Show the ${designSectionNames[s.key]} section`}
                          onChange={() => setDesign((d) => ({ ...d, sections: d.sections.map((x) => (x.key === s.key ? { ...x, visible: !x.visible } : x)) }))}
                        />
                      </div>
                      {open && (
                        <div className="space-y-4 border-t border-mist/60 bg-surface/60 p-4">
                          <div>
                            <Label>Layout on computers</Label>
                            {layoutControl(s.key)}
                          </div>
                          <div>
                            <Label>Height</Label>
                            <Choice<Spacing>
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
                          <div className="flex items-end gap-4">
                            <label className="shrink-0">
                              <Label>Colour wash</Label>
                              <span className="relative block h-10 w-10 overflow-hidden rounded-lg ring-1 ring-black/10" style={{ background: st.overlay }}>
                                <input type="color" value={st.overlay} onChange={(e) => setStyle(s.key, { overlay: e.target.value })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                              </span>
                            </label>
                            <div className="flex-1">
                              <Slider label="Strength" value={st.strength} min={0} max={90} left="None" right="Strong" onChange={(v) => setStyle(s.key, { strength: v })} format={(v) => (v ? `${v}%` : "Off")} />
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </Panel>
          )}

          {tab === "forms" && (
            <>
              <Panel title="Form questions" text="Switch off what you don't need. Name and phone are always asked; booking always asks for an email for the confirmation.">
                {(
                  [
                    ["Contact form", [["contactEmail", "Email"], ["contactMessage", "Message"], ["contactReceipt", "Insurance receipt"]]],
                    ["Booking form", [["bookingHomeVisits", "Home and workplace visits"], ["bookingNotes", "Notes for Ziad"], ["bookingReceipt", "Insurance receipt"]]],
                  ] as [string, [keyof FormFields, string][]][]
                ).map(([title, fields]) => (
                  <div key={title}>
                    <Label>{title}</Label>
                    <ul className="divide-y divide-mist/60 rounded-xl ring-1 ring-mist/70">
                      {fields.map(([k, label]) => (
                        <li key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
                          <span className={design.forms[k] ? "text-ink" : "text-muted line-through"}>{label}</span>
                          <Toggle on={design.forms[k]} label={`Ask for ${label}`} onChange={() => setForms({ [k]: !design.forms[k] })} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Panel>
              <Panel title="Top menu" text="Links to hidden sections are hidden automatically. Rename links under Text & photos → All other text.">
                <ul className="divide-y divide-mist/60 rounded-xl ring-1 ring-mist/70">
                  {menuKeys.map((k) => {
                    const sectionHidden = design.sections.some((s) => s.key === k && !s.visible);
                    const shown = !design.hiddenMenu.includes(k) && !sectionHidden;
                    return (
                      <li key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
                        <span className={shown ? "text-ink" : "text-muted"}>
                          {menuNames[k]}
                          {sectionHidden && <span className="ml-2 text-xs">(section hidden)</span>}
                        </span>
                        {!sectionHidden && (
                          <Toggle
                            on={shown}
                            label={`Show ${menuNames[k]} in the menu`}
                            onChange={() => setDesign((d) => ({ ...d, hiddenMenu: d.hiddenMenu.includes(k) ? d.hiddenMenu.filter((x) => x !== k) : [...d.hiddenMenu, k] }))}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            </>
          )}
        </div>

        {/* ---------- Live preview ---------- */}
        <div className="h-[70vh] xl:sticky xl:top-6 xl:h-[calc(100vh-9rem)]">
          <LivePreview kind="design" value={design} focus={focus} />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist/70 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="text-sm" role="status" aria-live="polite">
            {state.status === "error" ? (
              <span className="text-danger">{state.message}</span>
            ) : dirty ? (
              <span className="text-muted">Unsaved changes: visitors still see the published design.</span>
            ) : state.status === "saved" ? (
              <span className="font-medium text-[#007a43]">Published. Visitors now see this design.</span>
            ) : (
              <span className="text-muted">The preview shows what visitors see.</span>
            )}
          </p>
          <div className="flex shrink-0 gap-2">
            {dirty && (
              <button type="button" onClick={() => setDesign(saved)} className="rounded-full px-4 py-2.5 text-sm font-medium text-muted hover:text-navy">
                Undo changes
              </button>
            )}
            <button type="button" onClick={() => setDesign(defaultDesign)} className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-muted hover:text-navy sm:block">
              Original design
            </button>
            <button
              disabled={!dirty || pending}
              className="rounded-full bg-blue-dark px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 transition hover:bg-[#00649f] disabled:opacity-50 disabled:shadow-none"
            >
              {pending ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
