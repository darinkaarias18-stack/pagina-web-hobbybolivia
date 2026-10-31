import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

/**
 * Next.js 16 Server-Side Interceptor (Proxy / Defense-in-Depth Capa 1)
 * Intercepta peticiones del servidor antes del renderizado de componentes
 * para proteger rutas administrativas y aplicar cabeceras de seguridad HTTP.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Proteger panel de administración en servidor
  if (pathname.startsWith('/admin')) {
    // Permitir acceso a pantalla de login
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('hb_session')?.value;

    let authenticatedUser: { role: string } | null = null;

    if (sessionCookie) {
      const user = await verifySessionToken(sessionCookie);
      if (user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN')) {
        authenticatedUser = user;
      }
    }

    if (!authenticatedUser) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      // Limpiar cookies corruptas o inválidas
      response.cookies.delete('hb_session');
      response.cookies.delete('hb_user_role');
      return response;
    }

    // Regla de mínimo privilegio (RBAC): /admin/users es exclusivo de SUPERADMIN
    if (pathname.startsWith('/admin/users') && authenticatedUser.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 2. Inyección de Cabeceras HTTP de Seguridad
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto archivos estáticos internos de Next.js y uploads
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads/).*)',
  ],
};
