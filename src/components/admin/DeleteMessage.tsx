"use client";

import { useState } from "react";
import { deleteMessage } from "@/app/admin/actions";

/** Two-step delete, so a message can't be removed by a single stray tap. */
export function DeleteMessage({ id }: { id: number }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-danger/8 hover:text-danger"
      >
        Delete
      </button>
    );
  }
  return (
    <form action={deleteMessage} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-sm text-muted-foreground">Delete for good?</span>
      <button className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-[#a33224]">Delete</button>
      <button type="button" onClick={() => setConfirming(false)} className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-navy">
        Cancel
      </button>
    </form>
  );
}
