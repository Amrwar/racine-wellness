"use client";

import { usePathname, useSearchParams } from "next/navigation";

/** Shown only in preview: unsaved admin changes are visible, to Ziad alone. Hidden inside the admin's preview frame. */
export function PreviewBanner() {
  const pathname = usePathname();
  const params = useSearchParams();
  // Not inside the admin's preview frame, and not in edit mode (which has its own toolbar).
  if (params.get("embed") || params.get("edit")) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t bg-foreground px-4 py-3 text-sm text-background shadow-2xl">
      <span>
        <strong className="font-semibold">Preview.</strong> You&apos;re seeing unsaved changes from the admin. Visitors still see the published site.
      </span>
      <a href={`/admin/preview/exit?to=${encodeURIComponent(pathname)}`} className="inline-flex h-8 items-center rounded-md bg-background px-3 font-medium text-foreground hover:bg-muted">
        Exit preview
      </a>
    </div>
  );
}
