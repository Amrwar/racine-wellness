import type { ReactNode } from "react";

export function PageHeader({ title, lead, action }: { title: string; lead?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{title}</h1>
        {lead && <p className="mt-1.5 text-muted">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-2xl bg-white shadow-card ring-1 ring-mist/60 ${className}`}>{children}</div>;
}

export function Badge({ tone = "grey", children }: { tone?: "green" | "blue" | "grey"; children: ReactNode }) {
  const tones = {
    green: "bg-green/15 text-[#007a43]",
    blue: "bg-blue/12 text-blue-dark",
    grey: "bg-surface text-muted ring-1 ring-mist/70",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <Card className="px-6 py-14 text-center">
      <p className="font-semibold text-navy">{title}</p>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </Card>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Montreal",
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(d: Date | string) {
  return dateFormat.format(new Date(d));
}
