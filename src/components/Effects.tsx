"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide motion, added after hydration so the server HTML is always fully visible:
 * - Scroll reveal: section headings, blocks and grid items fade, rise and unblur as they enter
 *   the viewport, with a short stagger inside grids.
 * - Spotlight: a soft light follows the cursor over cards (styles in globals.css).
 * Uses the Web Animations API instead of attributes or classes, so React-rendered markup is
 * never changed (no hydration mismatches with late-loading parts such as the blog list).
 * Anything on screen when the page loads (the hero) is left alone, as is anything inside
 * [data-no-reveal] (the booking flow), and everything when the visitor prefers reduced motion.
 */
const REVEAL = [
  "main section h2",
  "main section > div > :is(p, a, blockquote, div:not(.grid), ul:not(.grid), ol:not(.grid))",
  "main section .grid > :is(li, div, article)",
].join(",");

const KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "translateY(22px)", filter: "blur(6px)" },
  { opacity: 1, transform: "none", filter: "none" },
];

export function Effects() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pending = new Map<Element, Animation>();
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          pending.get(e.target)?.play();
          pending.delete(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const tag = () => {
      const vh = window.innerHeight;
      main.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.closest("[data-no-reveal], form")) return;
        // Don't nest reveals: an item inside a revealing block animates with it.
        for (let p = el.parentElement; p && p !== main; p = p.parentElement) if (pending.has(p)) return;
        if (el.getBoundingClientRect().top < vh * 0.92) return; // already on screen
        const parent = el.parentElement;
        const index = parent?.classList.contains("grid") ? Array.prototype.indexOf.call(parent.children, el) : 0;
        const anim = el.animate(KEYFRAMES, {
          duration: 900,
          delay: Math.min(index, 6) * 70,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "backwards",
        });
        anim.pause(); // holds the first (hidden) frame until the element scrolls into view
        pending.set(el, anim);
        io.observe(el);
      });
    };

    tag();
    // Lists that change after load (search and filters, late-loading sections) get the same treatment.
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        tag();
      });
    });
    mo.observe(main, { childList: true, subtree: true });

    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".bg-card.border, article.border");
      if (!card || !main.contains(card)) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    main.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      main.removeEventListener("pointermove", onMove);
      // Anything still waiting is shown as is.
      pending.forEach((anim) => anim.cancel());
      pending.clear();
    };
  }, [pathname]);

  return null;
}
