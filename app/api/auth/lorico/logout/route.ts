import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/utils/auth/admin-session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(getSessionCookieName(), "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}