import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message: "Auth route placeholder. NextAuth handler will be wired in lib/auth.ts.",
    },
    { status: 501 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      message: "Auth route placeholder. NextAuth handler will be wired in lib/auth.ts.",
    },
    { status: 501 },
  );
}
