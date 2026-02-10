/**
 * GET: Check if OPENAI_API_KEY is configured (for UI warning).
 * Returns { configured: boolean } — never exposes the key.
 */
import { NextResponse } from "next/server";

export async function GET() {
  const configured = Boolean(
    process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0
  );
  return NextResponse.json({ configured });
}
