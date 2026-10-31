import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserRecord, deleteUserRecord } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "ID de usuario inválido" }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        countryCode: user.countryCode || '+591',
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: any) {
    console.error("Error in GET /api/users/[id]:", error);
    return NextResponse.json({ success: false, error: "Error al consultar el usuario" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "ID de usuario inválido" }, { status: 400 });
    }

    const body = await request.json();
    const updated = await updateUserRecord(userId, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado para actualizar" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        email: updated.email,
        phone: updated.phone || '',
        countryCode: updated.countryCode || '+591',
        role: updated.role,
        isActive: updated.isActive,
        updatedAt: updated.updatedAt
      }
    });
  } catch (error: any) {
    console.error("Error in PUT /api/users/[id]:", error);
    return NextResponse.json({ success: false, error: error.message || "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "ID de usuario inválido" }, { status: 400 });
    }

    try {
      const deleted = await deleteUserRecord(userId);
      if (!deleted) {
        return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Usuario eliminado correctamente"
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || "No fue posible eliminar el usuario" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error in DELETE /api/users/[id]:", error);
    return NextResponse.json({ success: false, error: "Error al eliminar usuario" }, { status: 500 });
  }
}
