import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const today = new Date();
    const todayStart = today.toISOString().split("T")[0] + "T00:00:00";
    const todayEnd = today.toISOString().split("T")[0] + "T23:59:59.999";

    const [
      totalBookingsToday,
      usersResult,
      revenueResult,
      courtsResult,
      recentBookingsResult,
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("start_at", todayStart)
        .lte("start_at", todayEnd),
      supabase
        .from("bookings")
        .select("player_name", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("total_price")
        .gte("start_at", todayStart)
        .lte("start_at", todayEnd)
        .eq("status", "confirmed"),
      supabase.from("courts").select("id,name,is_active"),
      supabase
        .from("bookings")
        .select("id,court_id,player_name,start_at,end_at,total_price,status,payment_receipt_url,courts!inner(name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (typeof totalBookingsToday.error === "object" && totalBookingsToday.error !== null) {
      return NextResponse.json(
        { message: "Failed to fetch bookings count.", details: totalBookingsToday.error.message },
        { status: 500 },
      );
    }

    if (typeof usersResult.error === "object" && usersResult.error !== null) {
      return NextResponse.json(
        { message: "Failed to fetch users count.", details: usersResult.error.message },
        { status: 500 },
      );
    }

    if (typeof revenueResult.error === "object" && revenueResult.error !== null) {
      return NextResponse.json(
        { message: "Failed to fetch revenue.", details: revenueResult.error.message },
        { status: 500 },
      );
    }

    if (typeof courtsResult.error === "object" && courtsResult.error !== null) {
      return NextResponse.json(
        { message: "Failed to fetch courts.", details: courtsResult.error.message },
        { status: 500 },
      );
    }

    if (typeof recentBookingsResult.error === "object" && recentBookingsResult.error !== null) {
      return NextResponse.json(
        { message: "Failed to fetch recent bookings.", details: recentBookingsResult.error.message },
        { status: 500 },
      );
    }

    const totalRevenue = revenueResult.data?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0;

    const totalCourts = courtsResult.data?.length || 0;
    const activeCourts = courtsResult.data?.filter((c) => c.is_active).length || 0;
    const courtUtilization = totalCourts > 0 ? (activeCourts / totalCourts) * 100 : 0;

    const paidCount = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed")
      .not("payment_receipt_url", "is", null);

    const pendingCount = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    const failedCount = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "cancelled");

    const recentBookings = recentBookingsResult.data?.map((b) => ({
      id: b.id,
      court_id: b.court_id,
      court_name: (b.courts as unknown as { name: string })?.name || "Unknown",
      player_name: b.player_name,
      start_at: b.start_at,
      end_at: b.end_at,
      total_price: b.total_price,
      status: b.status,
      payment_receipt_url: b.payment_receipt_url,
    }));

    return NextResponse.json({
      data: {
        totalBookingsToday: totalBookingsToday.count || 0,
        activeUsers: usersResult.count || 0,
        todaysRevenue: totalRevenue,
        courtUtilization: Math.round(courtUtilization * 100) / 100,
        recentBookings: recentBookings || [],
        paymentStatusCounts: {
          paid: paidCount.count || 0,
          pending: pendingCount.count || 0,
          failed: failedCount.count || 0,
        },
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