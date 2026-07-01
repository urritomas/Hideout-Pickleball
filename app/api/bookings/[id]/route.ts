import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
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
