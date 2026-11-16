import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { isAdmin, startSession } from "@/lib/auth";
import { discardDrafts } from "@/lib/settings";

/** Opens the home page in on-site edit mode (admin only). Starts from the published version. */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  if (!(await isAdmin())) return NextResponse.redirect(`${origin}/admin/login`);
  // Renew the session for the whole site (older sessions only covered /admin).
  await startSession();
  await discardDrafts();
  (await draftMode()).enable();
  return NextResponse.redirect(`${origin}${searchParams.get("lang") === "fr" ? "/fr" : "/"}?edit=1`);
}
