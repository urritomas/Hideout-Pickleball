import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: [
      { id: "USR-1", name: "Rhea Cruz", email: "rhea@hideout.club", role: "USER" },
      { id: "USR-2", name: "Kai Mendoza", email: "kai@hideout.club", role: "ADMIN" },
    ],
  });
}
