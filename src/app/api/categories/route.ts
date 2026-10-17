import { NextRequest, NextResponse } from 'next/server';
import { getCategories, saveCategory, deleteCategory } from '@/lib/db';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const saved = await saveCategory(body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/categories:", error);
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 });
    }

    const updated = await saveCategory(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in PUT /api/categories:", error);
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 });
    }

    await deleteCategory(parseInt(id, 10));
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error in DELETE /api/categories:", error);
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 });
  }
}
