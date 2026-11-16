import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";

/** Turns on preview (Draft Mode) in Ziad's browser, then opens a page of the site. Admin only. */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  if (!(await isAdmin())) return NextResponse.redirect(`${origin}/admin/login`);
  (await draftMode()).enable();
  // Only paths on this site (no open redirects).
  const to = searchParams.get("to") ?? "/";
  const path = /^\/(?!\/)[\w\-/]*$/.test(to) ? to : "/";
  return NextResponse.redirect(`${origin}${path}${searchParams.get("embed") ? "?embed=1" : ""}`);
}
