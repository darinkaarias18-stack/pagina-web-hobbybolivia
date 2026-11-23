import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getAllProductsAdmin, createProduct } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { revalidateCatalog } from '@/lib/revalidate';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const q = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const scale = searchParams.get('scale') || undefined;
    const material = searchParams.get('material') || undefined;
    const inStock = searchParams.get('inStock') === 'true';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const sort = searchParams.get('sort') || undefined;

    // 1. Consulta optimizada en Prisma usando select específico (catálogo público y admin)
    try {
      const prismaPkg = '@prisma/client';
      const { PrismaClient } = eval('require')(prismaPkg);
      const prisma = new PrismaClient();
      const whereClause: any = {};
      if (!includeInactive) {
        whereClause.isActive = true;
      }
      if (inStock) {
        whereClause.stock = { gt: 0 };
      }
      if (category && category !== 'all') {
        whereClause.category = {
          name: category,
        };
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        whereClause.price = {};
        if (minPrice !== undefined) whereClause.price.gte = minPrice;
        if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
      }

      const prismaProducts = await prisma.product.findMany({
        where: whereClause,
        select: {
          id: true,
          sku: true,
          name: true,
          slug: true,
          categoryId: true,
          scale: true,
          material: true,
          specsLine: true,
          compatibleModels: true,
          price: true,
          priceUsd: true,
          oldPrice: true,
          stock: true,
          badge: true,
          imageUrl: true,
          imageSizeBytes: true,
          isActive: true,
          brand: true,
          description: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      });
      await prisma.$disconnect();

      if (prismaProducts && prismaProducts.length > 0) {
        let mapped = prismaProducts.map((p: any) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          title: p.name,
          slug: p.slug,
          category_id: p.categoryId,
          categoryId: p.categoryId,
          category: p.category,
          category_name: p.category?.name,
          category_slug: p.category?.slug,
          scale: p.scale || 'RC Estándar',
          material: p.material || 'Compuesto',
          specs_line: p.specsLine,
          specsLine: p.specsLine,
          compatible_models: p.compatibleModels,
          compatibleModels: p.compatibleModels,
          price: Number(p.price),
          price_usd: p.priceUsd ? Number(p.priceUsd) : undefined,
          priceUsd: p.priceUsd ? Number(p.priceUsd) : undefined,
          old_price: p.oldPrice ? Number(p.oldPrice) : undefined,
          oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
          stock: p.stock,
          stockQuantity: p.stock,
          badge: p.badge,
          imageUrl: p.imageUrl,
          image_url: p.imageUrl,
          image: p.imageUrl,
          images: p.imageUrl ? [p.imageUrl] : [],
          is_active: p.isActive,
          isActive: p.isActive,
          brand: p.brand || 'Hobby Bolivia',
          description: p.description,
        }));

        if (q && q.trim()) {
          const lowerQ = q.trim().toLowerCase();
          mapped = mapped.filter(
            (p: any) =>
              p.name.toLowerCase().includes(lowerQ) ||
              p.sku.toLowerCase().includes(lowerQ) ||
              (p.brand && p.brand.toLowerCase().includes(lowerQ))
          );
        }

        return NextResponse.json({
          success: true,
          total: mapped.length,
          data: mapped,
        });
      }
    } catch {
      // Fallback transparente a lib/db
    }

    if (includeInactive) {
      const allProducts = await getAllProductsAdmin();
      return NextResponse.json({
        success: true,
        total: allProducts.length,
        data: allProducts,
      });
    }

    const products = await getProducts({
      q,
      category,
      scale,
      material,
      inStock,
      minPrice,
      maxPrice,
      sort,
    });

    return NextResponse.json({
      success: true,
      total: products.length,
      data: products,
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
