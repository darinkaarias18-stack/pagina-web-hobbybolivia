import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getAllProductsAdmin, createProduct } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { revalidateCatalog } from '@/lib/revalidate';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    if (includeInactive) {
      const allProducts = await getAllProductsAdmin();
      return NextResponse.json({
        success: true,
        total: allProducts.length,
        data: allProducts
      });
    }

    const q = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const scale = searchParams.get('scale') || undefined;
    const material = searchParams.get('material') || undefined;
    const inStock = searchParams.get('inStock') === 'true';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const sort = searchParams.get('sort') || undefined;

    const products = await getProducts({
      q,
      category,
      scale,
      material,
      inStock,
      minPrice,
      maxPrice,
      sort
    });

    return NextResponse.json({
      success: true,
      total: products.length,
      data: products
    });
  } catch (error) {
    console.error("Error in GET /api/products:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener el catálogo de productos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();

    if (!body.name && !body.title) {
      return NextResponse.json(
        { success: false, error: "El nombre del producto es requerido" },
        { status: 400 }
      );
    }

    if (!body.sku || !body.sku.trim()) {
      const allProducts = await getProducts();
      const nextId = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id)) + 1 : 1;
      body.sku = `HB-${nextId.toString().padStart(4, '0')}`;
    }

    const newProduct = await createProduct(body);
    revalidateCatalog();

    return NextResponse.json(
      {
        success: true,
        message: "Producto creado exitosamente",
        data: newProduct
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/products:", error);
    const isSizeError = error?.message?.includes('250 KB') || error?.message?.includes('1 MB');
    return NextResponse.json(
      { success: false, error: error?.message || "Error al registrar el producto en el catálogo" },
      { status: isSizeError ? 400 : 500 }
    );
  }
}
