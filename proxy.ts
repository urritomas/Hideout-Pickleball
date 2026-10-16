import { updateSession } from "@/utils/supabase/middleware";
import { getSessionCookieName, verifyAdminSessionToken } from "@/utils/auth/admin-session";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname.startsWith("/dashboard")
    || pathname.startsWith("/api/dashboard")
    || pathname.startsWith("/api/admin")
    || pathname.startsWith("/api/settings")
    || pathname.startsWith("/api/payments")
    || pathname === "/api/users"
    || pathname === "/api/courts";

  if (isAdminArea && !(await verifyAdminSessionToken(request.cookies.get(getSessionCookieName())?.value))) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

      const loginUrl = new URL("/loricoLogin", request.url);
      return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from login page
  if (pathname === "/loricoLogin") {
    if (await verifyAdminSessionToken(request.cookies.get(getSessionCookieName())?.value)) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};