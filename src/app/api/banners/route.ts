import { NextRequest, NextResponse } from 'next/server';
import { getBanners, saveBanner, deleteBanner } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { revalidateCatalog } from '@/lib/revalidate';

export async function GET() {
  try {
    const banners = await getBanners();
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error("Error in GET /api/banners:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    if (!body.title || !body.imageUrl) {
      return NextResponse.json({ success: false, error: "Title and imageUrl are required" }, { status: 400 });
    }

    const saved = await saveBanner(body);
    revalidateCatalog();
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/banners:", error);
    return NextResponse.json({ success: false, error: "Failed to create banner" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Banner ID is required" }, { status: 400 });
    }

    const updated = await saveBanner(body);
    revalidateCatalog();
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in PUT /api/banners:", error);
    return NextResponse.json({ success: false, error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: "Banner ID is required" }, { status: 400 });
    }

    await deleteBanner(parseInt(id, 10));
    revalidateCatalog();
    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    console.error("Error in DELETE /api/banners:", error);
    return NextResponse.json({ success: false, error: "Failed to delete banner" }, { status: 500 });
  }
}
