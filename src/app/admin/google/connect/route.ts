import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";
import { signState } from "@/lib/crypto";
import { authUrl, googleConfigured } from "@/lib/google";

/** Starts the Google sign-in (admin only). */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  if (!(await isAdmin())) return NextResponse.redirect(`${origin}/admin/login`);
  if (!googleConfigured()) return NextResponse.redirect(`${origin}/admin/bookings/availability?google=not-configured`);
  return NextResponse.redirect(authUrl(`${origin}/admin/google/callback`, signState()));
}
