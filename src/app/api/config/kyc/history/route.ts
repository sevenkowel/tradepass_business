import { NextResponse } from "next/server";
import { getHistory, rollbackToVersion } from "@/lib/config/service";
import { NextRequest } from "next/server";

/**
 * GET /api/config/kyc/history
 * 获取配置变更历史
 */
export async function GET() {
  try {
    const history = getHistory();
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("Error reading config history:", error);
    return NextResponse.json(
      { error: "Failed to read configuration history" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config/kyc/history/rollback
 * 回滚到指定版本
 */
export async function POST(request: NextRequest) {
  try {
    const { targetVersion, updatedBy } = await request.json();

    if (!targetVersion) {
      return NextResponse.json(
        { error: "targetVersion is required" },
        { status: 400 }
      );
    }

    const updated = rollbackToVersion(targetVersion, updatedBy || "admin");
    return NextResponse.json({
      success: true,
      version: updated.version,
      message: `Rolled back to v${targetVersion}`,
    });
  } catch (error) {
    console.error("Error rolling back config:", error);
    return NextResponse.json(
      { error: "Failed to rollback configuration" },
      { status: 500 }
    );
  }
}
