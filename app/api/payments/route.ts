import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const date = request.nextUrl.searchParams.get("date");
    const dateStart = date ? `${date}T00:00:00` : null;
    const dateEnd = date ? `${date}T23:59:59.999` : null;

    let query = supabase
      .from("bookings")
      .select("id,court_id,start_at,end_at,status,total_price,player_name,player_email,player_phone,payment_receipt_url,courts!inner(name)")
      .order("created_at", { ascending: false });

    if (dateStart && dateEnd) {
      query = query.gte("start_at", dateStart).lte("start_at", dateEnd);
    }

    const { data: bookings, error } = await query;

    if (error) {
      return NextResponse.json(
        { message: "Failed to load payments.", details: error.message },
        { status: 500 },
      );
    }

    const payments = (bookings || []).map((b) => ({
      id: b.id,
      bookingId: b.id,
      amount: b.total_price,
      status: b.payment_receipt_url ? "paid" : b.status === "cancelled" ? "cancelled" : "pending",
      method: "gcash",
    }));

    return NextResponse.json({ data: payments });
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