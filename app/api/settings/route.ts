import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Setting = {
  key: string;
  value: string | number;
};

type SettingsResponse = {
  dayRate: number;
  eveningRate: number;
  serviceFee: number;
  openingHour: number;
  closingHour: number;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("settings")
      .select("key,value");

    if (error) {
      const defaultSettings: SettingsResponse = {
        dayRate: 200,
        eveningRate: 300,
        serviceFee: 20,
        openingHour: 8,
        closingHour: 24,
      };

      return NextResponse.json({ data: defaultSettings });
    }

    const settingsMap = new Map<string, Setting>();
    for (const setting of data || []) {
      settingsMap.set(setting.key, setting);
    }

    const settings: SettingsResponse = {
      dayRate: Number(settingsMap.get("day_rate")?.value) || 200,
      eveningRate: Number(settingsMap.get("evening_rate")?.value) || 300,
      serviceFee: Number(settingsMap.get("service_fee")?.value) || 20,
      openingHour: Number(settingsMap.get("opening_hour")?.value) || 8,
      closingHour: Number(settingsMap.get("closing_hour")?.value) || 24,
    };

    return NextResponse.json({ data: settings });
  } catch (error) {
    const defaultSettings: SettingsResponse = {
      dayRate: 200,
      eveningRate: 300,
      serviceFee: 20,
      openingHour: 8,
      closingHour: 24,
    };

    return NextResponse.json({ data: defaultSettings });
  }
}

export async function PATCH(request: Request) {
  return updateSettings(request);
}

export async function POST(request: Request) {
  return updateSettings(request);
}

async function updateSettings(request: Request) {
  try {
    const payload = (await request.json()) as Partial<SettingsResponse>;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const updates: Setting[] = [];
    if (payload.dayRate !== undefined) {
      updates.push({ key: "day_rate", value: payload.dayRate });
    }
    if (payload.eveningRate !== undefined) {
      updates.push({ key: "evening_rate", value: payload.eveningRate });
    }
    if (payload.serviceFee !== undefined) {
      updates.push({ key: "service_fee", value: payload.serviceFee });
    }
    if (payload.openingHour !== undefined) {
      updates.push({ key: "opening_hour", value: payload.openingHour });
    }
    if (payload.closingHour !== undefined) {
      updates.push({ key: "closing_hour", value: payload.closingHour });
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: "No settings provided for update." }, { status: 400 });
    }

    for (const setting of updates) {
      const { data: existing } = await supabase
        .from("settings")
        .select("key")
        .eq("key", setting.key)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("settings")
          .update({ value: String(setting.value) })
          .eq("key", setting.key);
      } else {
        await supabase
          .from("settings")
          .insert({ key: setting.key, value: String(setting.value) });
      }
    }

    return NextResponse.json({
      data: {
        dayRate: payload.dayRate ?? 200,
        eveningRate: payload.eveningRate ?? 300,
        serviceFee: payload.serviceFee ?? 20,
        openingHour: payload.openingHour ?? 8,
        closingHour: payload.closingHour ?? 24,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update settings.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}