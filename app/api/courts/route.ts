import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: [
      { id: "CRT-1", name: "Court 1", outdoor: true },
      { id: "CRT-2", name: "Court 2", outdoor: true },
    ],
  });
}
