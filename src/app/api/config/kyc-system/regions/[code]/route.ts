/**
 * 地区配置 API
 * GET /api/config/kyc-system/regions/:code - 获取地区配置
 * PUT /api/config/kyc-system/regions/:code - 更新地区配置
 * DELETE /api/config/kyc-system/regions/:code - 删除地区配置（标记为禁用）
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getConfig,
  updateRegionConfig,
  toggleRegion,
} from '@/lib/kyc/unified-config-service';
import type { RegionCode } from '@/lib/kyc/region-config';

interface RouteParams {
  params: Promise<{
    code: string;
  }>;
}

// ============================================================
// GET /api/config/kyc-system/regions/:code
// ============================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const config = await getConfig();
    const regionConfig = config.regions[code as RegionCode];

    if (!regionConfig) {
      return NextResponse.json(
        { error: `Region ${code} not found` },
        { status: 404 }
      );
    }

    // 如果指定了 section，只返回该部分
    if (section === 'opening') {
      return NextResponse.json({
        code,
        opening: regionConfig.opening,
      });
    }

    if (section === 'kyc') {
      return NextResponse.json({
        code,
        kyc: regionConfig.kyc,
      });
    }

    if (section === 'steps') {
      return NextResponse.json({
        code,
        steps: regionConfig.opening.steps,
      });
    }

    if (section === 'formFields') {
      return NextResponse.json({
        code,
        formFields: regionConfig.opening.formFields,
      });
    }

    if (section === 'features') {
      return NextResponse.json({
        code,
        features: regionConfig.opening.features,
      });
    }

    // 返回完整地区配置
    return NextResponse.json({
      code,
      config: regionConfig,
    });
  } catch (error) {
    console.error('Error reading region config:', error);
    return NextResponse.json(
      { error: 'Failed to read region configuration' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT /api/config/kyc-system/regions/:code
// ============================================================

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { config, reason, updatedBy = 'system' } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Missing config in request body' },
        { status: 400 }
      );
    }

    // 更新地区配置
    const result = await updateRegionConfig(
      code,
      config,
      updatedBy,
      reason
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update region configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      version: result.version,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating region config:', error);
    return NextResponse.json(
      { error: 'Failed to update region configuration' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH /api/config/kyc-system/regions/:code (切换启用状态)
// ============================================================

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { enabled, updatedBy = 'system' } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid enabled field' },
        { status: 400 }
      );
    }

    const result = await toggleRegion(code, enabled, updatedBy);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to toggle region' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      version: result.version,
      enabled,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error toggling region:', error);
    return NextResponse.json(
      { error: 'Failed to toggle region' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/config/kyc-system/regions/:code (禁用地区)
// ============================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const updatedBy = searchParams.get('updatedBy') || 'system';

    const result = await toggleRegion(code, false, updatedBy);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to disable region' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      version: result.version,
      enabled: false,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error disabling region:', error);
    return NextResponse.json(
      { error: 'Failed to disable region' },
      { status: 500 }
    );
  }
}
