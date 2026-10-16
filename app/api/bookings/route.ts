import { createClient } from "@/utils/supabase/server";
import { getSessionCookieName, verifyAdminSessionToken } from "@/utils/auth/admin-session";
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
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ message: "Invalid date." }, { status: 400 });
  }
  const dateStart = date ? `${date}T00:00:00` : null;
  const dateEnd = date ? `${date}T23:59:59.999` : null;

  const courtsQuery = supabase.from("courts").select("id,name,is_active").eq("is_active", true).order("id");
  const bookingsQuery = supabase
    .from("bookings")
    .select("id,court_id,start_at,end_at,status")
    .in("status", ["pending", "confirmed", "booked", "cancelled"])
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
  let payload: CreateBookingInput;
  try {
    payload = (await request.json()) as CreateBookingInput;
  } catch {
    return NextResponse.json({ message: "Invalid booking request." }, { status: 400 });
  }

  if (!payload.courtId || !payload.date || !payload.playerName || !payload.playerEmail) {
    return NextResponse.json({ message: "Missing required booking fields." }, { status: 400 });
  }

  if (!Number.isInteger(payload.courtId) || payload.courtId < 1) {
    return NextResponse.json({ message: "Invalid court." }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    return NextResponse.json({ message: "Invalid booking date." }, { status: 400 });
  }

  const requestedDate = new Date(`${payload.date}T00:00:00`);
  if (Number.isNaN(requestedDate.getTime()) || requestedDate.toISOString().slice(0, 10) !== payload.date) {
    return NextResponse.json({ message: "Invalid booking date." }, { status: 400 });
  }

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxDate = new Date(todayDate);
  maxDate.setDate(maxDate.getDate() + 30);
  if (requestedDate < todayDate || requestedDate > maxDate) {
    return NextResponse.json({ message: "Bookings are available up to 30 days ahead." }, { status: 400 });
  }

  if (typeof payload.playerName !== "string" || payload.playerName.trim().length < 2 || payload.playerName.length > 120) {
    return NextResponse.json({ message: "Enter a valid name." }, { status: 400 });
  }

  if (typeof payload.playerEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.playerEmail) || payload.playerEmail.length > 254) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  if (payload.playerPhone !== undefined && (typeof payload.playerPhone !== "string" || payload.playerPhone.length > 30)) {
    return NextResponse.json({ message: "Enter a valid phone number." }, { status: 400 });
  }

  if (!Number.isInteger(payload.durationHours) || payload.durationHours < 1 || payload.durationHours > MAX_CONSECUTIVE_HOURS) {
    return NextResponse.json({ message: "Duration must be between 1 and 4 hours." }, { status: 400 });
  }

  if (!Number.isInteger(payload.startHour) || payload.startHour < OPENING_HOUR || payload.startHour >= CLOSING_HOUR) {
    return NextResponse.json({ message: "Start time is outside operating hours." }, { status: 400 });
  }

  if (payload.startHour + payload.durationHours > CLOSING_HOUR) {
    return NextResponse.json({ message: "Booking exceeds operating hours." }, { status: 400 });
  }

  const startDate = new Date(`${payload.date}T00:00:00`);
  startDate.setHours(payload.startHour, 0, 0, 0);
  const startAt = startDate.toISOString();

  const endDate = new Date(`${payload.date}T00:00:00`);
  endDate.setHours(payload.startHour + payload.durationHours, 0, 0, 0);
  const endAt = endDate.toISOString();

  const now = new Date();
  if (new Date(startAt) < now) {
    return NextResponse.json({ message: "Cannot create booking in the past." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const courtResult = await supabase
    .from("courts")
    .select("id")
    .eq("id", payload.courtId)
    .eq("is_active", true)
    .maybeSingle();

  if (courtResult.error) {
    return NextResponse.json({ message: "Unable to validate the selected court." }, { status: 500 });
  }
  if (!courtResult.data) {
    return NextResponse.json({ message: "Selected court is not available." }, { status: 409 });
  }

  const overlapQuery = supabase
    .from("bookings")
    .select("id")
    .eq("court_id", payload.courtId)
    .in("status", ["pending", "confirmed", "booked"])
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
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: insertResult.data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (!(await verifyAdminSessionToken(cookieStore.get(getSessionCookieName())?.value))) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const payload = (await request.json()) as { id?: string; status?: string; payment_receipt_url?: string };

  if (!payload.id) {
    return NextResponse.json({ message: "Booking ID is required." }, { status: 400 });
  }

  const validStatuses = ["pending", "confirmed", "booked", "cancelled"];
  if (payload.status && !validStatuses.includes(payload.status)) {
    return NextResponse.json({ message: "Invalid booking status." }, { status: 400 });
  }
  if (payload.payment_receipt_url !== undefined && !payload.payment_receipt_url.startsWith("receipts/")) {
    return NextResponse.json({ message: "Invalid receipt reference." }, { status: 400 });
  }

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
