import { NextRequest, NextResponse } from "next/server";
import { checkBasicAuth } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) {
    return new NextResponse("Server misconfigured: DASHBOARD_PASSWORD not set", { status: 500 });
  }
  if (checkBasicAuth(req.headers.get("authorization"), password)) {
    return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Fitness Dashboard"' },
  });
}

export const config = {
  // Protect everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
