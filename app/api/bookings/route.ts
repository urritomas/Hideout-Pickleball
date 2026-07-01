import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const OPENING_HOUR = 8;
const CLOSING_HOUR = 24;
const MAX_CONSECUTIVE_HOURS = 4;

type CreateBookingInput = {
  courtId: number;
  date: string;
  startHour: number;
  durationHours: number;
  playerName: string;
  playerEmail: string;
  playerPhone?: string;
};

function hourRate(hour24: number): number {
  return hour24 < 17 ? 200 : 300;
}

function calculatePrice(startHour: number, durationHours: number): number {
  let total = 0;
  for (let offset = 0; offset < durationHours; offset += 1) {
    total += hourRate(startHour + offset);
  }
  return total + 20;
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const date = request.nextUrl.searchParams.get("date");
  const dateStart = date ? `${date}T00:00:00` : null;
  const dateEnd = date ? `${date}T23:59:59.999` : null;

  const courtsQuery = supabase.from("courts").select("id,name,is_active").eq("is_active", true).order("id");
  const bookingsQuery = supabase
    .from("bookings")
    .select("id,court_id,start_at,end_at,status,player_name,total_price,player_email,player_phone")
    .in("status", ["pending", "confirmed", "cancelled"])
    .order("start_at");
  const blockedQuery = supabase.from("blocked_schedules").select("id,court_id,start_at,end_at,reason").order("start_at");

  const [courtsResult, bookingsResult, blockedResult] = await Promise.all([
    courtsQuery,
    dateStart && dateEnd ? bookingsQuery.gte("start_at", dateStart).lte("start_at", dateEnd) : bookingsQuery,
    dateStart && dateEnd ? blockedQuery.gte("start_at", dateStart).lte("start_at", dateEnd) : blockedQuery,
  ]);

  if (courtsResult.error || bookingsResult.error || blockedResult.error) {
    return NextResponse.json(
      {
        message: "Failed to load booking availability.",
        details: courtsResult.error?.message || bookingsResult.error?.message || blockedResult.error?.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: {
      courts: courtsResult.data,
      bookings: bookingsResult.data,
      blockedSchedules: blockedResult.data,
    },
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CreateBookingInput;

  if (!payload.courtId || !payload.date || !payload.playerName || !payload.playerEmail) {
    return NextResponse.json({ message: "Missing required booking fields." }, { status: 400 });
  }

  if (payload.durationHours < 1 || payload.durationHours > MAX_CONSECUTIVE_HOURS) {
    return NextResponse.json({ message: "Duration must be between 1 and 4 hours." }, { status: 400 });
  }

  if (payload.startHour < OPENING_HOUR || payload.startHour >= CLOSING_HOUR) {
    return NextResponse.json({ message: "Start time is outside operating hours." }, { status: 400 });
  }

  if (payload.startHour + payload.durationHours > CLOSING_HOUR) {
    return NextResponse.json({ message: "Booking exceeds operating hours." }, { status: 400 });
  }

  const startAt = `${payload.date}T${String(payload.startHour).padStart(2, "0")}:00:00`;
  const endAt = `${payload.date}T${String(payload.startHour + payload.durationHours).padStart(2, "0")}:00:00`;

  const now = new Date();
  if (new Date(startAt) < now) {
    return NextResponse.json({ message: "Cannot create booking in the past." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const overlapQuery = supabase
    .from("bookings")
    .select("id")
    .eq("court_id", payload.courtId)
    .in("status", ["pending", "confirmed"])
    .lt("start_at", endAt)
    .gt("end_at", startAt)
    .limit(1)
    .maybeSingle();

  const blockedQuery = supabase
    .from("blocked_schedules")
    .select("id")
    .eq("court_id", payload.courtId)
    .lt("start_at", endAt)
    .gt("end_at", startAt)
    .limit(1)
    .maybeSingle();

  const [overlapResult, blockedResult] = await Promise.all([overlapQuery, blockedQuery]);

  if (overlapResult.error || blockedResult.error) {
    return NextResponse.json(
      {
        message: "Failed to validate booking availability.",
        details: overlapResult.error?.message || blockedResult.error?.message,
      },
      { status: 500 },
    );
  }

  if (overlapResult.data || blockedResult.data) {
    return NextResponse.json(
      {
        message: "This slot is not available due to overlap or a blocked schedule.",
      },
      { status: 409 },
    );
  }

  const totalPrice = calculatePrice(payload.startHour, payload.durationHours);

  const insertResult = await supabase
    .from("bookings")
    .insert({
      court_id: payload.courtId,
      player_name: payload.playerName,
      player_email: payload.playerEmail,
      player_phone: payload.playerPhone || null,
      start_at: startAt,
      end_at: endAt,
      total_price: totalPrice,
      status: "pending",
    })
    .select("id,court_id,start_at,end_at,status,total_price,player_name,player_email")
    .single();

  if (insertResult.error) {
    return NextResponse.json(
      {
        message: "Failed to create booking.",
        details: insertResult.error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: insertResult.data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as { id?: string; status?: string; payment_receipt_url?: string };

  if (!payload.id) {
    return NextResponse.json({ message: "Booking ID is required." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const updateData: Record<string, string | null> = {};
  if (payload.status) {
    updateData.status = payload.status;
  }
  if (payload.payment_receipt_url !== undefined) {
    updateData.payment_receipt_url = payload.payment_receipt_url;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message: "No fields provided for update." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", payload.id)
    .select("id,court_id,start_at,end_at,status,total_price,player_name,player_email,payment_receipt_url")
    .single();

  if (error) {
    return NextResponse.json(
      {
        message: "Failed to update booking.",
        details: error.message || error.details || error.hint || JSON.stringify(error),
      },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ message: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({ data });
}
