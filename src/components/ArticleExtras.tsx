"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Facebook, Linkedin } from "./icons";

/** Thin bar at the top of the page showing how far the reader is through the article. */
export function ReadingProgress({ label }: { label: string }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const article = document.getElementById("article-body");
    if (!article) return;
    const update = () => {
      const r = article.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setPct(Math.max(0, Math.min(100, ((window.innerHeight * 0.4 - r.top) / Math.max(total, 1)) * 100)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="fixed inset-x-0 top-18 z-40 h-1 bg-transparent"
    >
      <div className="h-full origin-left bg-gradient-to-r from-blue to-green transition-[width] duration-150 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Share buttons: the device's share sheet when available, plus Facebook, LinkedIn and copy link. */
export function ShareArticle({ url, title, t }: { url: string; title: string; t: { share: string; copyLink: string; copied: string } }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    // Only known after hydration; the server renders the plain links.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);
  const btn =
    "grid h-10 w-10 place-items-center rounded-full bg-white text-navy ring-1 ring-navy/15 transition hover:bg-blue-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue";
  const enc = encodeURIComponent(url);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm font-semibold text-navy">{t.share}</p>
      {canShare && (
        <button type="button" className={btn} aria-label={t.share} onClick={() => navigator.share({ title, url }).catch(() => {})}>
          <Share2 aria-hidden className="h-4 w-4" />
        </button>
      )}
      <a className={btn} href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noreferrer" aria-label="Facebook">
        <Facebook className="h-4 w-4" />
      </a>
      <a className={btn} href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`} target="_blank" rel="noreferrer" aria-label="LinkedIn">
        <Linkedin className="h-4 w-4" />
      </a>
      <button
        type="button"
        className={btn}
        aria-label={copied ? t.copied : t.copyLink}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {}
        }}
      >
        {copied ? <Check aria-hidden className="h-4 w-4 text-green" /> : <Link2 aria-hidden className="h-4 w-4" />}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? t.copied : ""}
      </span>
    </div>
  );
}
