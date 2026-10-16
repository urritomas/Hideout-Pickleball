import { getSessionCookieName, verifyAdminSessionToken } from "@/utils/auth/admin-session";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  if (!(await verifyAdminSessionToken(cookieStore.get(getSessionCookieName())?.value))) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path");
  if (!path || !path.startsWith("receipts/")) {
    return NextResponse.json({ message: "Receipt not found." }, { status: 400 });
  }

  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 60 * 10);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ message: "Receipt is unavailable." }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}