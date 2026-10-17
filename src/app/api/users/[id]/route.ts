import { NextRequest, NextResponse } from 'next/server';
import { getUserById, saveUser, deleteUser } from '@/lib/db';

function isSuperAdmin(request: NextRequest): boolean {
  const auth = request.cookies.get('hb_admin_auth')?.value;
  const role = request.cookies.get('hb_user_role')?.value;
  return auth === 'authenticated' && role === 'SUPERADMIN';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSuperAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requiere rol SUPERADMIN.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: 'ID de usuario inválido' }, { status: 400 });
    }

    const existingUser = await getUserById(numId);
    if (!existingUser) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { name, password, isActive, role } = body;

    const isMaster = existingUser.username.toLowerCase() === 'superadmin';

    const updatePayload: Record<string, unknown> = {
      id: numId
    };

    if (name !== undefined) updatePayload.name = name.trim();
    if (password && password.trim().length > 0) updatePayload.password = password.trim();
    if (isActive !== undefined) updatePayload.isActive = isMaster ? true : Boolean(isActive);
    if (role && !isMaster) updatePayload.role = role;

    const updated = await saveUser(updatePayload);

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        role: updated.role,
        isActive: updated.isActive,
        updatedAt: updated.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSuperAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requiere rol SUPERADMIN.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: 'ID de usuario inválido' }, { status: 400 });
    }

    const existingUser = await getUserById(numId);
    if (!existingUser) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (existingUser.username.toLowerCase() === 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar la cuenta principal SUPERADMIN' },
        { status: 400 }
      );
    }

    const success = await deleteUser(numId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'No se pudo eliminar el usuario' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
