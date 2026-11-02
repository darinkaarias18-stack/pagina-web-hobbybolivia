import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, clearAuthSessionCookies } from '@/lib/auth';

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

  // Token de sesión verificado criptográficamente por HMAC-SHA256 (retorno instantáneo sin bloqueo)
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
