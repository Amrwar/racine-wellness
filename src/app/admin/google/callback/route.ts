import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { verifyState } from "@/lib/crypto";
import { completeConnection } from "@/lib/google";

/** Google sends Ziad back here after sign-in. */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const back = (result: string) => NextResponse.redirect(`${origin}/admin/bookings/availability?google=${result}#google`);
  if (!(await isAdmin())) return NextResponse.redirect(`${origin}/admin/login`);

  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "";
  if (searchParams.get("error") || !code) return back("cancelled");
  if (!verifyState(state)) return back("expired");

  try {
    await completeConnection(code, `${origin}/admin/google/callback`);
  } catch (err) {
    console.error("[google] connect failed:", err);
    return back("failed");
  }
  revalidatePath("/admin", "layout");
  return back("connected");
}
