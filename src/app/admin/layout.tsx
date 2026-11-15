import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Admin · HealthyZone", template: "%s · HealthyZone Admin" },
  robots: { index: false, follow: false },
};

/** Root layout for the private admin area (separate from the public, localized site). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${poppins.variable} h-full`}>
      <body className="min-h-full bg-surface">{children}</body>
    </html>
  );
}
