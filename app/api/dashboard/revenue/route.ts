import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type DailyRevenue = {
  date: string;
  revenue: number;
  bookings_count: number;
};

type PaymentMethodBreakdown = {
  method: string;
  count: number;
  total_amount: number;
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");

    const today = new Date();
    const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const dateStart = startDate ? `${startDate}T00:00:00` : defaultStart.toISOString().split("T")[0] + "T00:00:00";
    const dateEnd = endDate ? `${endDate}T23:59:59.999` : defaultEnd.toISOString().split("T")[0] + "T23:59:59.999";

    const [bookingsResult, paymentsResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("total_price,start_at,end_at,created_at,payment_receipt_url")
        .eq("status", "confirmed")
        .gte("start_at", dateStart)
        .lte("start_at", dateEnd),
      supabase
        .from("payments")
        .select("method,amount")
        .gte("created_at", dateStart)
        .lte("created_at", dateEnd),
    ]);

    if (bookingsResult.error) {
      return NextResponse.json(
        { message: "Failed to fetch bookings.", details: bookingsResult.error.message },
        { status: 500 },
      );
    }

    if (paymentsResult.error) {
      return NextResponse.json(
        { message: "Failed to fetch payments.", details: paymentsResult.error.message },
        { status: 500 },
      );
    }

    const dailyRevenueMap = new Map<string, DailyRevenue>();
    let serviceFeeTotal = 0;

    for (const booking of bookingsResult.data || []) {
      const date = booking.created_at.split("T")[0];
      const existing = dailyRevenueMap.get(date);
      // Calculate duration in hours from start_at and end_at
      const startHour = new Date(booking.start_at || booking.created_at).getHours();
      const endHour = new Date(booking.end_at || booking.created_at).getHours();
      const duration = Math.max(1, endHour - startHour);
      const serviceFee = duration * 20;
      if (existing) {
        existing.revenue += Number(booking.total_price || 0);
        existing.bookings_count += 1;
      } else {
        dailyRevenueMap.set(date, {
          date,
          revenue: Number(booking.total_price || 0),
          bookings_count: 1,
        });
      }
      serviceFeeTotal += serviceFee;
    }

    const dailyRevenue = Array.from(dailyRevenueMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const totalRevenue = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0);
    const totalBookings = dailyRevenue.reduce((sum, d) => sum + d.bookings_count, 0);
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const paymentMethodMap = new Map<string, PaymentMethodBreakdown>();
    for (const payment of paymentsResult.data || []) {
      const method = payment.method || "unknown";
      const existing = paymentMethodMap.get(method);
      if (existing) {
        existing.count += 1;
        existing.total_amount += Number(payment.amount);
      } else {
        paymentMethodMap.set(method, {
          method,
          count: 1,
          total_amount: Number(payment.amount),
        });
      }
    }

    const paymentMethodBreakdown = Array.from(paymentMethodMap.values()).sort((a, b) =>
      a.method.localeCompare(b.method),
    );

    return NextResponse.json({
      data: {
        dailyRevenue,
        totalRevenue,
        totalBookings,
        averageBookingValue: Math.round(averageBookingValue * 100) / 100,
        serviceFeeTotal: Math.round(serviceFeeTotal * 100) / 100,
        paymentMethodBreakdown,
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