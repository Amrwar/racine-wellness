"use client";

import { useEffect } from "react";

/**
 * Makes links to a section of the current page (e.g. "/#contact") always scroll there.
 * Next.js skips navigation when the URL already ends in that hash, so a second tap on
 * "Contact" or "Book a session" did nothing. Scrolling waits two frames so the mobile
 * menu has closed and the page has settled before measuring.
 */
export function SectionLinks() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;

      e.preventDefault();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          el.scrollIntoView({ block: "start" });
          if (url.hash !== location.hash) history.replaceState(history.state, "", url.hash);
        }),
      );
    }
    // Capture phase, so this runs before next/link and stops its no-op navigation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
