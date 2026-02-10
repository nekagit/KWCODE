/**
 * API auth middleware (ticket #4).
 * When API_SECRET is set, require Authorization: Bearer <API_SECRET> or X-API-Key: <API_SECRET>
 * for all /api/* requests. If not set, allow all (local dev).
 * Document: when deploying the Next dev server beyond localhost, set API_SECRET in env.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const secret = process.env.API_SECRET;
  if (!secret || secret.trim() === "") {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("x-api-key");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = bearer ?? apiKeyHeader;

  if (token === secret) {
    return NextResponse.next();
  }

  return NextResponse.json(
    {
      error: "API authentication required. Set API_SECRET and pass Authorization: Bearer <API_SECRET> or X-API-Key: <API_SECRET>.",
    },
    { status: 401 }
  );
}

export const config = {
  matcher: "/api/:path*",
};
