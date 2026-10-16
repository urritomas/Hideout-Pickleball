import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  getSessionCookieName,
  hasAdminConfiguration,
} from "@/utils/auth/admin-session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!hasAdminConfiguration()) {
      return NextResponse.json(
        { success: false, message: "Admin login is not configured." },
        { status: 503 },
      );
    }

    if (username === process.env.LORICO_ADMIN_USERNAME && password === process.env.LORICO_ADMIN_PASSWORD) {
      const token = await createAdminSessionToken();
      if (!token) {
        return NextResponse.json({ success: false, message: "Admin login is not configured." }, { status: 503 });
      }

      const response = NextResponse.json({ success: true });
      response.cookies.set(getSessionCookieName(), token, {
        httpOnly: true,
        maxAge: ADMIN_SESSION_TTL_SECONDS,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    return NextResponse.json(
      { success: false, message: "Invalid username or password" },
      { status: 401 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}