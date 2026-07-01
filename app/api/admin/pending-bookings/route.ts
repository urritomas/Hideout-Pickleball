import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [bookingsResult, courtsResult] = await Promise.all([
    supabase
      .from("bookings")
      .select("id,court_id,player_name,player_email,player_phone,start_at,end_at,total_price,status,payment_receipt_url,notes,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase.from("courts").select("id,name,is_active").eq("is_active", true).order("id"),
  ]);

  if (bookingsResult.error || courtsResult.error) {
    return NextResponse.json(
      {
        message: "Failed to load pending bookings.",
        details: bookingsResult.error?.message || courtsResult.error?.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: {
      bookings: bookingsResult.data || [],
      courts: courtsResult.data || [],
    },
  });
}
