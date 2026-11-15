import { requireAdmin } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  let newCount = 0;
  if (hasDatabase()) {
    const sql = await db();
    const [row] = await sql`SELECT count(*)::int AS n FROM messages WHERE status = 'new'`;
    newCount = row.n;
  }
  return (
    <div className="min-h-screen lg:pl-64">
      <AdminNav newCount={newCount} logout={logout} />
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:py-12">{children}</main>
    </div>
  );
}
