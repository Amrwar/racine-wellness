import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { Wordmark } from "@/components/admin/Wordmark";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-navy px-5 py-12">
      <div aria-hidden className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-blue/25 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 -left-24 -z-10 h-96 w-96 rounded-full bg-green/15 blur-3xl" />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark className="text-3xl" />
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Admin</p>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-black/30">
          <h1 className="text-xl font-semibold text-navy">Welcome back</h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">Sign in to manage your website.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
