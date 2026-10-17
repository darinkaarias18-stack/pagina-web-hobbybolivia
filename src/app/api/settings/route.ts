import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig, updateSiteConfig } from '@/lib/db';

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
    const body = await request.json();
    const updated = await updateSiteConfig(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in PUT /api/settings:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
