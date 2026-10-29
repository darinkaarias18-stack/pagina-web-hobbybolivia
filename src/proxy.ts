import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Proteger panel de administración en servidor
  if (pathname.startsWith('/admin')) {
    // Permitir acceso a pantalla de login
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('hb_session')?.value;

    let isAuthenticated = false;

    if (sessionCookie) {
      const user = await verifySessionToken(sessionCookie);
      if (user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN')) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Inyección de Cabeceras HTTP de Seguridad
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto archivos estáticos internos de Next.js
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
