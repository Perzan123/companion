import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

const COOKIE_NAME = "companion_session";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export async function POST(request: NextRequest) {
  const expectedPassphrase = process.env.APP_PASSPHRASE;
  const sessionToken = process.env.SESSION_TOKEN;

  if (!expectedPassphrase || !sessionToken) {
    return NextResponse.json(
      { error: "Server is not configured. Missing passphrase or session secret." },
      { status: 500 }
    );
  }

  const { passphrase } = await request.json().catch(() => ({ passphrase: "" }));

  if (typeof passphrase !== "string" || !safeCompare(passphrase, expectedPassphrase)) {
    return NextResponse.json({ error: "That's not quite right." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });

  return response;
}
