import { NextRequest, NextResponse } from 'next/server';
import { getUsers, saveUser } from '@/lib/db';

function isSuperAdmin(request: NextRequest): boolean {
  const auth = request.cookies.get('hb_admin_auth')?.value;
  const role = request.cookies.get('hb_user_role')?.value;
  return auth === 'authenticated' && role === 'SUPERADMIN';
}

export async function GET(request: NextRequest) {
  try {
    if (!isSuperAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requiere rol SUPERADMIN.' },
        { status: 403 }
      );
    }

    const users = await getUsers();
    // Return users with passwords masked for security
    const sanitized = users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role,
      isActive: u.isActive !== false,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }));

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSuperAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requiere rol SUPERADMIN.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, username, password, role } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'Nombre, usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const existingUsers = await getUsers();
    if (existingUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return NextResponse.json(
        { success: false, error: 'El nombre de usuario ya está registrado' },
        { status: 400 }
      );
    }

    // Role can only be ADMIN for newly created users
    const userRole = role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN';

    const newUser = await saveUser({
      name: name.trim(),
      username: cleanUsername,
      password: password.trim(),
      role: userRole,
      isActive: true
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
