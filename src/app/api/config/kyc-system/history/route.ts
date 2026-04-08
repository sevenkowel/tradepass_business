/**
 * 配置历史版本 API
 * GET /api/config/kyc-system/history - 获取历史版本列表
 * POST /api/config/kyc-system/history - 回滚到指定版本
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getHistoryVersions,
  rollbackToVersion,
} from '@/lib/kyc/unified-config-service';

// ============================================================
// GET /api/config/kyc-system/history
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const versions = await getHistoryVersions();

    return NextResponse.json({
      versions: versions.slice(0, limit),
      total: versions.length,
    });
  } catch (error) {
    console.error('Error reading config history:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration history' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/config/kyc-system/history (回滚)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { version, updatedBy = 'system', reason } = body;

    if (!version) {
      return NextResponse.json(
        { error: 'Missing version in request body' },
        { status: 400 }
      );
    }

    const result = await rollbackToVersion(version, updatedBy, reason);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to rollback configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      version: result.version,
      rolledBackTo: version,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error rolling back config:', error);
    return NextResponse.json(
      { error: 'Failed to rollback configuration' },
      { status: 500 }
    );
  }
}
