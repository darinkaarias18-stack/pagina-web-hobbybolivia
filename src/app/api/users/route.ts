import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUserRecord } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const users = await getAllUsers();
    // No exponer contraseñas en la respuesta
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: safeUsers
    });
  } catch (error: any) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar los usuarios del sistema" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();

    if (!body.name || !body.username || !body.password) {
      return NextResponse.json(
        { success: false, error: "El nombre, nombre de usuario y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    // Comprobar si ya existe un usuario con ese username
    const existingUsers = await getAllUsers();
    const cleanUsername = body.username.trim().toLowerCase();
    const cleanEmail = (body.email || '').trim().toLowerCase();

    const usernameExists = existingUsers.some(u => u.username?.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return NextResponse.json(
        { success: false, error: "El nombre de usuario ya está registrado en el sistema." },
        { status: 400 }
      );
    }

    if (cleanEmail) {
      const emailExists = existingUsers.some(u => u.email?.toLowerCase() === cleanEmail);
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: "El correo electrónico ya está registrado en el sistema." },
          { status: 400 }
        );
      }
    }

    const newUser = await createUserRecord({
      name: body.name.trim(),
      username: cleanUsername,
      email: cleanEmail || `${cleanUsername}@hobbybolivia.com`,
      password: body.password.trim(),
      role: body.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN',
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
    });

    return NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
      data: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
