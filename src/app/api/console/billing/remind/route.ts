import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { sendTrialReminders } from "@/lib/tenant/lifecycle";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await sendTrialReminders();
    return NextResponse.json({
      success: true,
      results,
      message: `通知发送完成：7天提醒 ${results.sent7d} 条，3天提醒 ${results.sent3d} 条，1天提醒 ${results.sent1d} 条，已降级 ${results.expired} 个，宽限期提醒 ${results.graceEnding} 条`,
    });
  } catch (err) {
    console.error("Send reminders error:", err);
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 });
  }
}
