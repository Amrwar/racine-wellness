"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "./Wordmark";

const links = [
  { href: "/admin", label: "Overview", icon: "M3 12 12 4l9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/admin/bookings", label: "Bookings", icon: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4" },
  { href: "/admin/messages", label: "Messages", icon: "M4 6h16v12H4zM4 7l8 6 8-6" },
  { href: "/admin/blog", label: "Blog", icon: "M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 17h5" },
  { href: "/admin/pricing", label: "Pricing", icon: "M20 12 12 20l-8-8V4h8zM8.5 8.5h.01" },
];

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export function AdminNav({
  newCount,
  pendingCount,
  logout,
}: {
  newCount: number;
  pendingCount: number;
  logout: () => Promise<void>;
}) {
  const counts: Record<string, number> = { "/admin/messages": newCount, "/admin/bookings": pendingCount };
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const item = "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition";

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          aria-current={active(l.href) ? "page" : undefined}
          className={`${item} ${active(l.href) ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6 hover:text-white"}`}
        >
          <Icon d={l.icon} className={active(l.href) ? "text-green" : ""} />
          <span className="flex-1">{l.label}</span>
          {(counts[l.href] ?? 0) > 0 && (
            <span className="rounded-full bg-green px-2 py-0.5 text-xs font-semibold text-navy-deep">{counts[l.href]}</span>
          )}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-white/10 pt-4">
      <a href="/" target="_blank" rel="noopener" className={`${item} text-white/70 hover:bg-white/6 hover:text-white`}>
        <Icon d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />
        View website
      </a>
      <form action={logout}>
        <button className={`${item} text-white/70 hover:bg-white/6 hover:text-white`}>
          <Icon d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col justify-between bg-navy p-5 lg:flex">
        <div>
          <Link href="/admin" className="block px-4 pb-8 pt-2">
            <Wordmark />
            <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Admin</span>
          </Link>
          {nav}
        </div>
        {footer}
      </aside>

      {/* Phone and tablet top bar */}
      <header className="sticky top-0 z-40 bg-navy lg:hidden">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/admin" className="flex items-baseline gap-2">
            <Wordmark className="text-xl" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/50">Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10"
          >
            <Icon d={open ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} className="h-6 w-6" />
            {!open && newCount + pendingCount > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-green" />}
          </button>
        </div>
        {open && (
          <div className="space-y-4 border-t border-white/10 px-5 pb-5 pt-3">
            {nav}
            {footer}
          </div>
        )}
      </header>
    </>
  );
}
