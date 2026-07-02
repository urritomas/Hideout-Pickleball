import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type UserWithBookingCount = {
  player_name: string;
  player_email: string;
  total_bookings: number;
  last_booking_date: string;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: users, error } = await supabase
      .from("bookings")
      .select("player_name,player_email,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { message: "Failed to fetch users.", details: error.message },
        { status: 500 },
      );
    }

    const userMap = new Map<string, UserWithBookingCount>();

    for (const booking of users || []) {
      const key = booking.player_email;
      const existing = userMap.get(key);

      if (existing) {
        existing.total_bookings += 1;
        if (new Date(booking.created_at) > new Date(existing.last_booking_date)) {
          existing.last_booking_date = booking.created_at;
        }
      } else {
        userMap.set(key, {
          player_name: booking.player_name,
          player_email: booking.player_email,
          total_bookings: 1,
          last_booking_date: booking.created_at,
        });
      }
    }

    const usersList = Array.from(userMap.values()).sort((a, b) =>
      b.last_booking_date.localeCompare(a.last_booking_date),
    );

    return NextResponse.json({ data: usersList });
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