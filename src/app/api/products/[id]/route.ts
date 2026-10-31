import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: "ID de producto inválido" }, { status: 400 });
    }

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error in GET /api/products/[id]:", error);
    return NextResponse.json({ success: false, error: "Error al consultar producto" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: "ID de producto inválido" }, { status: 400 });
    }

    const body = await request.json();
    const updated = await updateProduct(productId, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Producto no encontrado para actualizar" }, { status: 404 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      success: true,
      message: "Producto actualizado correctamente",
      data: updated
    });
  } catch (error: any) {
    console.error("Error in PUT /api/products/[id]:", error);
    const isSizeError = error?.message?.includes('1 MB');
    return NextResponse.json(
      { success: false, error: error?.message || "Error al actualizar el producto" },
      { status: isSizeError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: "ID de producto inválido" }, { status: 400 });
    }

    const deleted = await deleteProduct(productId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Producto eliminado correctamente del catálogo"
    });
  } catch (error) {
    console.error("Error in DELETE /api/products/[id]:", error);
    return NextResponse.json({ success: false, error: "Error al eliminar producto" }, { status: 500 });
  }
}
