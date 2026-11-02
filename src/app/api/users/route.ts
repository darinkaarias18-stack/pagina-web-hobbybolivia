import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUserRecord } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';
import { sendAdminCredentialsEmail } from '@/lib/email';

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
      phone: u.phone || '',
      countryCode: u.countryCode || '+591',
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

    const rawGmail = (body.username || body.email || '').trim().toLowerCase();
    const rawPassword = (body.password || '').trim();
    const rawName = (body.name || '').trim();
    const rawCountryCode = (body.countryCode || '+591').trim();
    const rawPhoneNumber = (body.phone || '').trim().replace(/[^\d]/g, '');
    const cleanFullPhone = rawPhoneNumber ? `${rawCountryCode} ${rawPhoneNumber}` : '';

    if (!rawName || !rawGmail || !rawPassword || !rawPhoneNumber) {
      return NextResponse.json(
        { success: false, error: "Nombre completo, correo Gmail, número de celular/teléfono y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    // Regla obligatoria: el usuario para un nuevo Admin debe ser un correo @gmail.com válido
    const gmailRegex = /^[a-z0-9._%+-]+@gmail\.com$/i;
    if (!gmailRegex.test(rawGmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Por regla del sistema, el usuario debe ser un correo válido de Gmail (ejemplo@gmail.com) para autenticarse en el sistema."
        },
        { status: 400 }
      );
    }

    // Comprobar si ya existe un usuario con ese correo Gmail
    const existingUsers = await getAllUsers();
    const userExists = existingUsers.some(
      u => u.username?.toLowerCase() === rawGmail || u.email?.toLowerCase() === rawGmail
    );
    if (userExists) {
      return NextResponse.json(
        { success: false, error: "Este correo Gmail ya está registrado como usuario en el sistema." },
        { status: 400 }
      );
    }

    if (body.role && body.role === 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: "Solo existe un único Superadmin Maestro (Darinka Arias) en el sistema. Los nuevos administradores se registran exclusivamente con rol ADMIN." },
        { status: 400 }
      );
    }

    // Al crear un nuevo usuario desde el panel, su rol es exclusivamente ADMIN
    const newUser = await createUserRecord({
      name: rawName,
      username: rawGmail,
      email: rawGmail,
      phone: cleanFullPhone,
      countryCode: rawCountryCode,
      password: rawPassword,
      role: 'ADMIN',
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
    });

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';
    const loginUrl = `${origin.replace(/\/$/, '')}/login`;

    const emailDispatch = await sendAdminCredentialsEmail({
      toEmail: rawGmail,
      adminName: newUser.name,
      username: rawGmail,
      password: rawPassword,
      loginUrl,
      phone: cleanFullPhone
    });

    return NextResponse.json({
      success: true,
      message: `Usuario Administrador creado exitosamente. Accesos listos para despachar por WhatsApp al número ${cleanFullPhone}.`,
      emailDispatch,
      data: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        countryCode: newUser.countryCode,
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
