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

    const startDate = `${year}-${String(month).padStart(2, "0")}-01T00:00:00+08:00`;
    const nextMonth = Number(month) === 12 ? `${Number(year) + 1}-01-01` : `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`;
    const endDate = `${nextMonth}T00:00:00+08:00`;

    const [bookingsResult, blockedResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("court_id,start_at,end_at,status,player_name")
        .gte("start_at", startDate)
        .lt("start_at", endDate)
        .in("status", ["pending", "confirmed", "booked"]),
      supabase
        .from("blocked_schedules")
        .select("court_id,start_at,end_at,reason")
        .gte("start_at", startDate)
        .lt("start_at", endDate),
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

    const blockedData = blockedResult.data?.map((b) => {
      const reason = (b.reason || "").toLowerCase();
      let status = "unavailable";
      if (reason === "open play") status = "open play";

      return {
        court_id: b.court_id,
        date: b.start_at.split("T")[0],
        start_at: b.start_at,
        end_at: b.end_at,
        status,
        reason: b.reason,
      };
    }) || [];

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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const payload = (await request.json()) as {
      courtId: number;
      date: string;
      startHour: number;
      endHour: number;
      status: string;
      reason?: string;
    };

    const startAt = `${payload.date}T${String(payload.startHour).padStart(2, "0")}:00:00+08:00`;
    const endAt = `${payload.date}T${String(payload.endHour).padStart(2, "0")}:00:00+08:00`;

    if (payload.status === "unavailable" || payload.status === "open play") {
      const reasonMap: Record<string, string> = {
        unavailable: "Unavailable",
        "open play": "Open Play",
      };

      const { data, error } = await supabase
        .from("blocked_schedules")
        .insert({
          court_id: payload.courtId,
          start_at: startAt,
          end_at: endAt,
          reason: reasonMap[payload.status] || payload.status,
        })
        .select("id,court_id,start_at,end_at,reason")
        .single();

      if (error) {
        return NextResponse.json(
          { message: "Failed to create blocked schedule.", details: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        data: {
          type: "blocked",
          ...data,
          status: payload.status,
        },
      }, { status: 201 });
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        court_id: payload.courtId,
        player_name: "Admin",
        player_email: "admin@hideout.club",
        start_at: startAt,
        end_at: endAt,
        total_price: 0,
        status: "confirmed",
        notes: payload.reason || `Admin schedule: ${payload.status}`,
      })
      .select("id,court_id,start_at,end_at,status,player_name")
      .single();

    if (error) {
      return NextResponse.json(
        { message: "Failed to create booking.", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { type: "booking", ...data } }, { status: 201 });
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

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const payload = (await request.json()) as {
      courtId: number;
      date: string;
      startHour: number;
      endHour: number;
      type?: "booking" | "blocked";
    };

    const startAt = `${payload.date}T${String(payload.startHour).padStart(2, "0")}:00:00+08:00`;
    const endAt = `${payload.date}T${String(payload.endHour).padStart(2, "0")}:00:00+08:00`;

    if (payload.type === "blocked") {
      const { error } = await supabase
        .from("blocked_schedules")
        .delete()
        .eq("court_id", payload.courtId)
        .lt("start_at", endAt)
        .gt("end_at", startAt);

      if (error) {
        return NextResponse.json(
          { message: "Failed to delete blocked schedule.", details: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ data: { deleted: true } });
    }

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("court_id", payload.courtId)
      .lt("start_at", endAt)
      .gt("end_at", startAt)
      .in("status", ["confirmed", "pending"]);

    if (error) {
      return NextResponse.json(
        { message: "Failed to delete booking.", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { deleted: true } });
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