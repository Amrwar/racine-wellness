import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getClients } from "@/lib/clients";
import { localDay, localTime } from "@/lib/time";

/** Spreadsheet (CSV) downloads for the admin: bookings, clients and messages. */
const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Quote every cell; neutralise spreadsheet formulas (=, +, -, @) typed by clients.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};
const csv = (header: string[], rows: unknown[][]) => "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");

export async function GET(_req: Request, { params }: RouteContext<"/admin/export/[file]">) {
  if (!(await isAdmin())) return new Response("Not signed in", { status: 401 });
  const { file } = await params;
  const sql = await db();
  let body: string;

  if (file === "bookings.csv") {
    const rows = await sql`SELECT * FROM bookings ORDER BY start_at DESC`;
    body = csv(
      ["Date", "Start", "End", "Status", "Client", "Phone", "Email", "Treatment", "Minutes", "Price", "Location", "Address", "Receipt", "Language", "Notes", "Requested"],
      rows.map((b) => {
        const s = new Date(b.start_at);
        return [localDay(s), localTime(s), localTime(new Date(b.end_at)), b.status, b.name, b.phone, b.email, b.service_title, b.minutes, b.price, b.location, b.address, b.wants_receipt ? "yes" : "no", b.locale, b.notes, new Date(b.created_at).toISOString()];
      }),
    );
  } else if (file === "clients.csv") {
    const clients = await getClients();
    body = csv(
      ["Name", "Phone", "Email", "Visits", "Upcoming", "Total spent", "Last visit", "Next visit", "Notes"],
      clients.map((c) => [c.name, c.phone, c.email, c.visits, c.upcoming, c.spent, c.last_visit && localDay(new Date(c.last_visit)), c.next_visit && localDay(new Date(c.next_visit)), c.notes]),
    );
  } else if (file === "messages.csv") {
    const rows = await sql`SELECT * FROM messages ORDER BY created_at DESC`;
    body = csv(
      ["Received", "Name", "Phone", "Email", "Message", "Receipt", "Status", "Reply"],
      rows.map((m) => [new Date(m.created_at).toISOString(), m.name, m.phone, m.email, m.message, m.wants_receipt ? "yes" : "no", m.status, m.reply]),
    );
  } else {
    return new Response("Not found", { status: 404 });
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="healthyzone-${file.replace(".csv", "")}-${localDay(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
