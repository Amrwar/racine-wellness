"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Facebook, Linkedin } from "./icons";
import { buttonVariants } from "./ui/button";

/** Share buttons: the device's share sheet when available, plus Facebook, LinkedIn and copy link. */
export function ShareArticle({ url, title, t }: { url: string; title: string; t: { share: string; copyLink: string; copied: string } }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    // Only known after hydration; the server renders the plain links.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);
  const btn = cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "rounded-[var(--btn-radius,0.625rem)] shadow-xs");
  const enc = encodeURIComponent(url);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="mr-1 text-sm font-medium text-foreground">{t.share}</p>
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
