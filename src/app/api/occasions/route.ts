import { NextRequest, NextResponse } from 'next/server';
import { getOccasions, saveOccasion, deleteOccasion } from '@/lib/db';

export async function GET() {
  try {
    const occasions = await getOccasions();
    return NextResponse.json({ success: true, data: occasions });
  } catch (error) {
    console.error("Error in GET /api/occasions:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch occasions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const saved = await saveOccasion(body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/occasions:", error);
    return NextResponse.json({ success: false, error: "Failed to create occasion" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Occasion ID is required" }, { status: 400 });
    }

    const updated = await saveOccasion(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in PUT /api/occasions:", error);
    return NextResponse.json({ success: false, error: "Failed to update occasion" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: "Occasion ID is required" }, { status: 400 });
    }

    await deleteOccasion(parseInt(id, 10));
    return NextResponse.json({ success: true, message: "Occasion deleted" });
  } catch (error) {
    console.error("Error in DELETE /api/occasions:", error);
    return NextResponse.json({ success: false, error: "Failed to delete occasion" }, { status: 500 });
  }
}
