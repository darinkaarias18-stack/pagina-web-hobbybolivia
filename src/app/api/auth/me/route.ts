import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, clearAuthSessionCookies } from '@/lib/auth';
import { getUserByUsername } from '@/lib/db';

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    const res = NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    );
    clearAuthSessionCookies(res);
    return res;
  }

  // Verificar en tiempo real contra la Base de Datos (MySQL admin_users / DB)
  const dbUser = await getUserByUsername(sessionUser.username);
  if (dbUser) {
    if (dbUser.isActive === false) {
      const res = NextResponse.json(
        { authenticated: false, user: null, error: 'Cuenta desactivada' },
        { status: 403 }
      );
      clearAuthSessionCookies(res);
      return res;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
        name: dbUser.name
      }
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: sessionUser.id,
      username: sessionUser.username,
      role: sessionUser.role,
      name: sessionUser.name
    }
  });
}
