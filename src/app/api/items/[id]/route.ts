import { NextRequest, NextResponse } from 'next/server';
import { getCatalogItemById, saveCatalogItem, deleteCatalogItem } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: "Invalid item ID" }, { status: 400 });
    }

    const item = await getCatalogItemById(numId);
    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Error in GET /api/items/[id]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: "Invalid item ID" }, { status: 400 });
    }

    const body = await request.json();
    const updated = await saveCatalogItem({ ...body, id: numId });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in PUT /api/items/[id]:", error);
    return NextResponse.json({ success: false, error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: "Invalid item ID" }, { status: 400 });
    }

    await deleteCatalogItem(numId);
    return NextResponse.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/items/[id]:", error);
    return NextResponse.json({ success: false, error: "Failed to delete item" }, { status: 500 });
  }
}
