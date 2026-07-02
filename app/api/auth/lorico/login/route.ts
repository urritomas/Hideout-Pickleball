import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === "jjthecoffeemaker" && password === "honoluluj2cr") {
      // Set a cookie in the response
      const response = NextResponse.json({ success: true });
      response.cookies.set("isLoggedIn", "true", {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
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