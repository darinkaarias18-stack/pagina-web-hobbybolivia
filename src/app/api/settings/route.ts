import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSiteConfig, updateSiteConfig } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const config = await getSiteConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("Error in GET /api/settings:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const updated = await updateSiteConfig(body);
    try {
      revalidatePath('/', 'layout');
    } catch {
      // safe fallback
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in PUT /api/settings:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
