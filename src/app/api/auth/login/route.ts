import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/db';
import { createSessionToken, setAuthSessionCookies } from '@/lib/auth';

async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Debes ingresar usuario y contraseña válidos.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const inputPasswordHash = await sha256Hex(password);

    let matchedUser: {
      id: number;
      username: string;
      name: string;
      role: 'SUPERADMIN' | 'ADMIN';
      isActive?: boolean;
    } | null = null;

    // 1. Validación prioritaria y estricta contra la Base de Datos (MySQL admin_users / DB)
    const dbUser = await getUserByUsername(cleanUsername);
    if (dbUser && dbUser.password) {
      const storedPass = dbUser.password;
      const isPasswordValid =
        storedPass === password ||
        storedPass.toLowerCase() === inputPasswordHash.toLowerCase();

      if (isPasswordValid) {
        if (dbUser.isActive === false) {
          return NextResponse.json(
            { success: false, error: 'Esta cuenta ha sido desactivada en la base de datos por el Superadmin.' },
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

    // 2. Respaldo estricto de variables de entorno (solo coincidencia exacta de usuario y contraseña)
    if (!matchedUser) {
      const superadminUser = (process.env.SUPERADMIN_USER || 'darinka.arias18@gmail.com').trim().toLowerCase();
      const superadminPass = process.env.SUPERADMIN_PASSWORD || 'superadmin1234*';
      const envAdminUser = (process.env.ADMIN_USER || 'dariasdigital_hobbybolivia').trim().toLowerCase();
      const envAdminPass = process.env.ADMIN_PASSWORD || 'Imp6fSMr2%mj0w?v';

      if (cleanUsername === superadminUser && password === superadminPass) {
        matchedUser = {
          id: 1,
          username: superadminUser,
          name: 'Darinka Arias',
          role: 'SUPERADMIN',
          isActive: true
        };
      } else if (cleanUsername === envAdminUser && password === envAdminPass) {
        matchedUser = {
          id: 2,
          username: envAdminUser,
          name: 'Administrador Hobby Bolivia',
          role: 'SUPERADMIN',
          isActive: true
        };
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: Usuario o contraseña incorrectos.' },
        { status: 401 }
      );
    }

    // 3. Generar token de sesión criptográfico (HMAC-SHA256, validez de 2 horas)
    const token = await createSessionToken(
      {
        id: matchedUser.id,
        username: matchedUser.username,
        name: matchedUser.name,
        role: matchedUser.role
      },
      1 // 1 día máximo en firma, 2h en cookie
    );

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
        exp: Math.floor(Date.now() / 1000) + 2 * 3600
      },
      token
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Error al procesar login' }, { status: 500 });
  }
}
