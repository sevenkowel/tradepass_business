import { NextRequest, NextResponse } from "next/server";
import { revokeToken } from "@/lib/security";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (token) {
    revokeToken(token);
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  res.cookies.set("csrf_token", "", { maxAge: 0, path: "/" });
  return res;
}
