/**
 * 统一 KYC 配置 API
 * GET /api/config/kyc-system - 获取完整配置
 * PUT /api/config/kyc-system - 更新配置
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getConfig,
  saveConfig,
  validateConfig,
  invalidateCache,
} from '@/lib/kyc/unified-config-service';
import type { UnifiedKYCConfig } from '@/lib/kyc/unified-config-types';
import type { RegionCode } from '@/lib/kyc/region-config';

// ============================================================
// GET /api/config/kyc-system
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const section = searchParams.get('section');

    const config = await getConfig();

    // 如果指定了 region，只返回该地区配置
    if (region) {
      const regionConfig = config.regions[region as RegionCode];
      if (!regionConfig) {
        return NextResponse.json(
          { error: `Region ${region} not found` },
          { status: 404 }
        );
      }

      // 如果指定了 section，只返回该部分
      if (section === 'opening') {
        return NextResponse.json({
          region,
          opening: regionConfig.opening,
        });
      }

      if (section === 'kyc') {
        return NextResponse.json({
          region,
          kyc: regionConfig.kyc,
        });
      }

      return NextResponse.json({
        region,
        config: regionConfig,
      });
    }

    // 如果指定了 section，只返回该部分
    if (section === 'tiers') {
      return NextResponse.json({ tiers: config.tiers });
    }

    if (section === 'stages') {
      return NextResponse.json({ stageDefinitions: config.stageDefinitions });
    }

    if (section === 'permissions') {
      return NextResponse.json({ tierPermissions: config.tierPermissions });
    }

    if (section === 'global') {
      return NextResponse.json({ global: config.global });
    }

    // 返回完整配置
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading KYC config:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT /api/config/kyc-system
// ============================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, reason, updatedBy = 'system' } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Missing config in request body' },
        { status: 400 }
      );
    }

    // 验证配置
    const validation = validateConfig(config);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Configuration validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // 保存配置
    const result = await saveConfig(config, updatedBy, reason);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to save configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      version: result.version,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving KYC config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/config/kyc-system/refresh (强制刷新缓存)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'refresh') {
      invalidateCache();
      const config = await getConfig();
      return NextResponse.json({
        success: true,
        version: config.version,
        updatedAt: config.updatedAt,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error refreshing KYC config:', error);
    return NextResponse.json(
      { error: 'Failed to refresh configuration' },
      { status: 500 }
    );
  }
}
