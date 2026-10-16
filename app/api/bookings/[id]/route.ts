import { createClient } from "@/utils/supabase/server";
import { getSessionCookieName, verifyAdminSessionToken } from "@/utils/auth/admin-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (!(await verifyAdminSessionToken(cookieStore.get(getSessionCookieName())?.value))) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createClient(cookieStore);

  const result = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select("id,status")
    .single();

  if (result.error) {
    return NextResponse.json(
      {
        message: "Failed to cancel booking.",
        details: result.error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: result.data,
  });
}
