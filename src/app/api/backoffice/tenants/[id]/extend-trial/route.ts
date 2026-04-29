import { NextRequest, NextResponse } from "next/server";
import { extendTrial } from "@/lib/tenant/lifecycle";
import { z } from "zod";

const extendSchema = z.object({
  days: z.number().min(1).max(90).default(14),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = extendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await extendTrial(id, parsed.data.days);

    return NextResponse.json({
      success: true,
      message: `试用已延长 ${parsed.data.days} 天`,
    });
  } catch (err: any) {
    console.error("Extend trial error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to extend trial" },
      { status: 500 }
    );
  }
}
