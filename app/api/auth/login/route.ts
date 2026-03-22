import { NextRequest, NextResponse } from "next/server";

const DEMO_EMAIL = "vp@marsshot.vc";
const DEMO_PASSWORD = "marsshot2026";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("marsshot_session", "demo_authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
