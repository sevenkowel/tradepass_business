import { NextRequest, NextResponse } from "next/server";
import { getRegionConfig, isValidRegion, getSupportedRegions } from "@/lib/kyc/region-config";

/**
 * GET /api/kyc/config?region=VN
 * 获取指定地区的 KYC 配置
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region");

    if (!region) {
      return NextResponse.json(
        { error: "Region parameter is required" },
        { status: 400 }
      );
    }

    if (!isValidRegion(region)) {
      return NextResponse.json(
        { error: "Invalid region code", supportedRegions: getSupportedRegions() },
        { status: 400 }
      );
    }

    const config = getRegionConfig(region);

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching KYC config:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC configuration" },
      { status: 500 }
    );
  }
}
