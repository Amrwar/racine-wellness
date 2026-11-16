import Link from "next/link";

/** Switches between the home-page editor and the "all other text" editor. */
export function WebsiteTabs({ active }: { active: "home" | "text" }) {
  const tabs = [
    { key: "home", href: "/admin/website", label: "Home page" },
    { key: "text", href: "/admin/website/text", label: "All other text" },
  ] as const;
  return (
    <nav aria-label="Website sections" className="mb-6 inline-flex rounded-full bg-white p-1 shadow-card ring-1 ring-mist/60">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? "page" : undefined}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active === t.key ? "bg-navy text-white" : "text-navy hover:bg-surface"}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
