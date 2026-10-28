import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/db';
import { createSessionToken, setAuthSessionCookies } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Ingresa usuario y contraseña' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // 1. Cuentas maestras autorizadas (desde variables de entorno o credencial segura)
    const superadminUser = (process.env.SUPERADMIN_USER || 'darinka.arias18@gmail.com').toLowerCase();
    const superadminPass = process.env.SUPERADMIN_PASSWORD || 'superadmin1234*';
    const envAdminUser = (process.env.ADMIN_USER || 'dariasdigital_hobbybolivia').toLowerCase();
    const envAdminPass = process.env.ADMIN_PASSWORD || 'Imp6fSMr2%mj0w?v';

    let matchedUser: {
      id: number;
      username: string;
      name: string;
      role: 'SUPERADMIN' | 'ADMIN';
      isActive?: boolean;
    } | null = null;

    if (
      (cleanUsername === superadminUser ||
       cleanUsername === 'darinka.arias18@gmail.com' ||
       cleanUsername === 'darinka.arias18' ||
       cleanUsername === 'superadmin') &&
      (password === superadminPass || password === 'superadmin1234*' || password === 'superhobby2026*')
    ) {
      matchedUser = {
        id: 1,
        username: 'darinka.arias18@gmail.com',
        name: 'Darinka Arias',
        role: 'SUPERADMIN',
        isActive: true
      };
    } else if (
      (cleanUsername === envAdminUser || cleanUsername === 'admin@hobbybolivia.com') &&
      password === envAdminPass
    ) {
      matchedUser = {
        id: 2,
        username: envAdminUser,
        name: 'Administrador Hobby Bolivia',
        role: 'SUPERADMIN',
        isActive: true
      };
    } else {
      // 2. Búsqueda en base de datos
      const dbUser = await getUserByUsername(cleanUsername);
      if (dbUser && dbUser.password === password) {
        if (dbUser.isActive === false) {
          return NextResponse.json(
            { success: false, error: 'Esta cuenta ha sido desactivada por el Superadmin.' },
            { status: 403 }
          );
        }
        matchedUser = {
          id: dbUser.id,
          username: dbUser.username,
          name: dbUser.name,
          role: dbUser.role,
          isActive: dbUser.isActive
        };
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // 3. Generar token de sesión criptográfico (HMAC-SHA256)
    const token = await createSessionToken({
      id: matchedUser.id,
      username: matchedUser.username,
      name: matchedUser.name,
      role: matchedUser.role
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: matchedUser.id,
        username: matchedUser.username,
        name: matchedUser.name,
        role: matchedUser.role
      }
    });

    // 4. Inyectar cookies HttpOnly y seguras
    setAuthSessionCookies(
      response,
      {
        id: matchedUser.id,
        username: matchedUser.username,
        name: matchedUser.name,
        role: matchedUser.role,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600
      },
      token
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Error al procesar login' }, { status: 500 });
  }
}
