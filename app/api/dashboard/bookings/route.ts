import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const date = request.nextUrl.searchParams.get("date");
    const status = request.nextUrl.searchParams.get("status");
    const dateStart = date ? `${date}T00:00:00` : null;
    const dateEnd = date ? `${date}T23:59:59.999` : null;

    const bookingsQuery = supabase
      .from("bookings")
      .select("id,court_id,start_at,end_at,status,total_price,player_name,player_email,player_phone,payment_receipt_url,courts!inner(name)")
      .order("created_at", { ascending: false });

    let query = dateStart && dateEnd
      ? bookingsQuery.gte("start_at", dateStart).lte("start_at", dateEnd)
      : bookingsQuery;

    if (status) {
      query = query.eq("status", status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      return NextResponse.json(
        { message: "Failed to fetch bookings.", details: error.message },
        { status: 500 },
      );
    }

    const formattedBookings = bookings?.map((b) => ({
      id: b.id,
      court_id: b.court_id,
      court_name: (b.courts as unknown as { name: string })?.name || "Unknown",
      player_name: b.player_name,
      player_email: b.player_email,
      player_phone: b.player_phone,
      start_at: b.start_at,
      end_at: b.end_at,
      total_price: b.total_price,
      status: b.status,
      payment_receipt_url: b.payment_receipt_url,
    })) || [];

    return NextResponse.json({ data: formattedBookings });
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

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as { id?: string; status?: string };

    if (!payload.id) {
      return NextResponse.json({ message: "Booking ID is required." }, { status: 400 });
    }

    const validStatuses = ["pending", "confirmed", "booked", "cancelled"];
    if (payload.status && !validStatuses.includes(payload.status)) {
      return NextResponse.json(
        { message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: payload.status })
      .eq("id", payload.id)
      .select("id,court_id,start_at,end_at,status,total_price,player_name,player_email,player_phone,payment_receipt_url,courts!inner(name)")
      .single();

    if (error) {
      return NextResponse.json(
        { message: "Failed to update booking.", details: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ message: "Booking not found." }, { status: 404 });
    }

    const formattedBooking = {
      id: data.id,
      court_id: data.court_id,
      court_name: (data.courts as unknown as { name: string })?.name || "Unknown",
      player_name: data.player_name,
      player_email: data.player_email,
      player_phone: data.player_phone,
      start_at: data.start_at,
      end_at: data.end_at,
      total_price: data.total_price,
      status: data.status,
      payment_receipt_url: data.payment_receipt_url,
    };

    return NextResponse.json({ data: formattedBooking });
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