import { NextRequest, NextResponse } from 'next/server';
import { getCatalogItems, saveCatalogItem } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const occasion = searchParams.get('occasion') || undefined;
    const flowerType = searchParams.get('flowerType') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const availability = searchParams.get('availability') || undefined;
    const q = searchParams.get('q') || undefined;
    const sort = searchParams.get('sort') || undefined;

    const items = await getCatalogItems({
      category,
      brand,
      occasion,
      flowerType,
      minPrice,
      maxPrice,
      availability,
      q,
      sort
    });

    return NextResponse.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error("Error in GET /api/items:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.price) {
      return NextResponse.json({ success: false, error: "Title and price are required" }, { status: 400 });
    }

    const newItem = await saveCatalogItem(body);
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/items:", error);
    return NextResponse.json({ success: false, error: "Failed to create item" }, { status: 500 });
  }
}
