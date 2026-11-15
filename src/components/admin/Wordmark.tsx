import { site } from "@/lib/site";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline text-2xl font-bold tracking-[-0.03em] ${className}`}>
      <span className="text-blue">{site.brand.first}</span>
      <span className="text-green">{site.brand.second}</span>
    </span>
  );
}
