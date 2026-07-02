import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const year = request.nextUrl.searchParams.get("year");
    const month = request.nextUrl.searchParams.get("month");

    if (!year || !month) {
      return NextResponse.json(
        { message: "Both 'year' and 'month' query parameters are required." },
        { status: 400 },
      );
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01T00:00:00`;
    const nextMonth = Number(month) === 12 ? `${Number(year) + 1}-01-01` : `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`;
    const endDate = `${nextMonth}T00:00:00`;

    const [bookingsResult, blockedResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("court_id,start_at,end_at,status,player_name")
        .gte("start_at", startDate)
        .lt("start_at", endDate)
        .in("status", ["pending", "confirmed", "cancelled"]),
      supabase
        .from("blocked_schedules")
        .select("court_id,start_at,end_at,reason"),
    ]);

    if (bookingsResult.error) {
      return NextResponse.json(
        { message: "Failed to fetch bookings.", details: bookingsResult.error.message },
        { status: 500 },
      );
    }

    if (blockedResult.error) {
      return NextResponse.json(
        { message: "Failed to fetch blocked schedules.", details: blockedResult.error.message },
        { status: 500 },
      );
    }

    const calendarData = bookingsResult.data?.map((b) => ({
      court_id: b.court_id,
      date: b.start_at.split("T")[0],
      start_at: b.start_at,
      end_at: b.end_at,
      status: b.status === "confirmed" ? "booked" : b.status,
      player_name: b.player_name,
    })) || [];

    const blockedData = blockedResult.data?.map((b) => ({
      court_id: b.court_id,
      date: b.start_at.split("T")[0],
      start_at: b.start_at,
      end_at: b.end_at,
      status: "blocked",
      reason: b.reason,
    })) || [];

    return NextResponse.json({
      data: {
        bookings: calendarData,
        blockedSchedules: blockedData,
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