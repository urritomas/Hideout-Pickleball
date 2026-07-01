import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id,court_id,player_name,player_email,player_phone,start_at,end_at,total_price,status,payment_receipt_url,notes,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (bookingsError) {
      return NextResponse.json(
        {
          message: "Failed to load pending bookings.",
          details: bookingsError.message,
        },
        { status: 500 },
      );
    }

    const { data: courts, error: courtsError } = await supabase
      .from("courts")
      .select("id,name,is_active")
      .eq("is_active", true)
      .order("id");

    if (courtsError) {
      return NextResponse.json(
        {
          message: "Failed to load courts.",
          details: courtsError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        bookings: bookings || [],
        courts: courts || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unexpected server error.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
