import { requireAdmin } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  let newCount = 0;
  let pendingCount = 0;
  if (hasDatabase()) {
    const sql = await db();
    const [row] = await sql`SELECT
      (SELECT count(*)::int FROM messages WHERE status = 'new') AS messages,
      (SELECT count(*)::int FROM bookings WHERE status = 'pending' AND end_at > now()) AS bookings`;
    newCount = row.messages;
    pendingCount = row.bookings;
  }
  return (
    <div className="min-h-screen lg:pl-64">
      <AdminNav newCount={newCount} pendingCount={pendingCount} logout={logout} />
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:py-12">{children}</main>
    </div>
  );
}
