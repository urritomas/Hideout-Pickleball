import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const [courtsResult, blockedResult] = await Promise.all([
      supabase.from("courts").select("id,name,is_active,status").order("id"),
      supabase.from("blocked_schedules").select("id,court_id,start_at,end_at,reason").order("start_at"),
    ]);

    if (courtsResult.error) {
      return NextResponse.json(
        { message: "Failed to fetch courts.", details: courtsResult.error.message },
        { status: 500 },
      );
    }

    if (blockedResult.error) {
      return NextResponse.json(
        { message: "Failed to fetch blocked schedules.", details: blockedResult.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        courts: courtsResult.data || [],
        blockedSchedules: blockedResult.data || [],
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

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as { id?: number; is_active?: boolean; status?: string };

    if (!payload.id) {
      return NextResponse.json({ message: "Court ID is required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const updateData: Record<string, unknown> = {};
    if (payload.is_active !== undefined) {
      updateData.is_active = payload.is_active;
    }
    if (payload.status) {
      updateData.status = payload.status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No fields provided for update." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("courts")
      .update(updateData)
      .eq("id", payload.id)
      .select("id,name,is_active,status")
      .single();

    if (error) {
      return NextResponse.json(
        { message: "Failed to update court.", details: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ message: "Court not found." }, { status: 404 });
    }

    return NextResponse.json({ data });
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