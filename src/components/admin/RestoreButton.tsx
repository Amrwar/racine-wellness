"use client";

import { useState, useTransition } from "react";
import { restoreVersion } from "@/app/admin/actions";

/** Two-step restore so a version isn't brought back by a stray tap. */
export function RestoreButton({ id }: { id: number }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [done, setDone] = useState("");
  if (done) return <span className="text-xs font-semibold text-[#007a43]">{done}</span>;
  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-blue-dark ring-1 ring-mist hover:ring-blue">
        Restore
      </button>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setDone((await restoreVersion(id)).message ?? "Restored."))}
        className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-deep disabled:opacity-50"
      >
        {pending ? "Restoring…" : "Yes, restore"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="rounded-full px-2 py-1.5 text-xs text-muted hover:text-navy">
        Cancel
      </button>
    </span>
  );
}
