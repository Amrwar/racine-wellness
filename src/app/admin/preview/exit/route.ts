import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/** Leaves preview and goes back to the published site (the drafts stay for the editor). */
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  const to = request.nextUrl.searchParams.get("to") ?? "/";
  const path = /^\/(?!\/)[\w\-/]*$/.test(to) ? to : "/";
  return NextResponse.redirect(`${request.nextUrl.origin}${path}`);
}
