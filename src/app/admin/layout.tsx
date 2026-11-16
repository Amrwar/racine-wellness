import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";



export const metadata: Metadata = {
  title: { default: "Admin · HealthyZone", template: "%s · HealthyZone Admin" },
  robots: { index: false, follow: false },
};

/** Root layout for the private admin area (separate from the public, localized site). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${fontVariables} h-full`}>
      <body className="min-h-full bg-surface">{children}</body>
    </html>
  );
}
