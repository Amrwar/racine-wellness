"use client";

import { useState, useTransition } from "react";
import { removePhoto } from "@/app/admin/actions";

/** Two-step delete for an unused photo. */
export function DeletePhoto({ url }: { url: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="text-xs font-semibold text-danger hover:underline">
        Delete
      </button>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await removePhoto(url);
            if (res.status === "error") setError(res.message ?? "Couldn't delete.");
          })
        }
        className="rounded-full bg-danger px-3 py-1 font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete for good"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-muted hover:text-navy">
        Cancel
      </button>
      {error && <span className="w-full text-danger">{error}</span>}
    </span>
  );
}
