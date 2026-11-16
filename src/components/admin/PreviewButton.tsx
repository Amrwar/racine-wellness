"use client";

import { useTransition } from "react";
import { savePreviewDraft } from "@/app/admin/actions";
import type { PreviewableKey } from "@/lib/settings";

/** Opens the website in a new tab showing these unsaved changes (only in this browser). */
export function PreviewButton({ kind, value, path = "/" }: { kind: PreviewableKey; value: unknown; path?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        // Open the tab right away (pop-up blockers allow it during the click), then point it at the preview.
        const tab = window.open("about:blank", "_blank");
        start(async () => {
          await savePreviewDraft(kind, JSON.stringify(value));
          const url = `/admin/preview/start?to=${encodeURIComponent(path)}`;
          if (tab) tab.location.href = url;
          else window.location.href = url;
        });
      }}
      className="rounded-full px-4 py-2.5 text-sm font-semibold text-navy ring-1 ring-mist hover:ring-blue disabled:opacity-50"
    >
      {pending ? "Opening…" : "Preview"}
    </button>
  );
}
