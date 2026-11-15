"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        aria-label="Calendar subscription link"
        className="min-w-0 flex-1 rounded-xl border border-mist bg-surface px-3.5 py-2.5 font-mono text-xs text-ink"
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {}
        }}
        className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
