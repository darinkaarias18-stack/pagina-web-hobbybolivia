import { NextRequest, NextResponse } from 'next/server';

export interface SessionUser {
  id: number;
  username: string;
  name: string;
  role: 'SUPERADMIN' | 'ADMIN';
  exp: number;
}

const DEFAULT_AUTH_SECRET = 'hobbybolivia_auth_secret_secure_key_2026_98374981';

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || DEFAULT_AUTH_SECRET;
}

// ============================================================================
// 1. CRIPTOGRAFÍA DE SESIÓN (HMAC-SHA256 CON WEB CRYPTO API)
// ============================================================================

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Genera un token de sesión firmado criptográficamente (HMAC-SHA256).
 */
export async function createSessionToken(
  user: Omit<SessionUser, 'exp'>,
  expiresInDays: number = 7
): Promise<string> {
  const enc = new TextEncoder();
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const sessionData: SessionUser = { ...user, exp };

  const payloadStr = JSON.stringify(sessionData);
  const payloadB64 = base64UrlEncode(enc.encode(payloadStr));

  const key = await getHmacKey(getAuthSecret());
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const signatureB64 = base64UrlEncode(new Uint8Array(signatureBuffer));

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Valida la firma criptográfica y expiración de un token de sesión.
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signatureB64] = parts;
    const enc = new TextEncoder();
    const key = await getHmacKey(getAuthSecret());

    const signatureBytes = base64UrlDecode(signatureB64);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as BufferSource,
      enc.encode(payloadB64)
    );

    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const decodedStr = new TextDecoder().decode(payloadBytes);
    const session: SessionUser = JSON.parse(decodedStr);

    const now = Math.floor(Date.now() / 1000);
    if (session.exp && session.exp < now) {
      return null; // Sesión expirada
    }

    return session;
  } catch {
    return null;
  }
}

// ============================================================================
// 2. EXTRACCIÓN Y VERIFICACIÓN EN PETICIONES HTTP
// ============================================================================

/**
 * Extrae y valida la sesión desde las cookies de la petición.
 */
export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const sessionCookie = request.cookies.get('hb_session')?.value;
  if (!sessionCookie) {
    return null;
  }

  const verified = await verifySessionToken(sessionCookie);
  if (!verified) {
    return null;
  }

  return verified;
}

/**
 * Guarda el token de sesión seguro en cookies de la respuesta.
 * Se configura como cookie de sesión estricta (expira al cerrar el navegador o tras 2 horas).
 */
export function setAuthSessionCookies(response: NextResponse, user: SessionUser, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = 60 * 60 * 2; // Máximo 2 horas de sesión activa

  // 1. Cookie de sesión criptográfica (HttpOnly para prevenir robo por XSS)
  response.cookies.set('hb_session', token, {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge
  });

  // 2. Cookies informativas de rol/usuario para la UI (nunca usadas para autorizar sin hb_session)
  response.cookies.set('hb_user_role', user.role, {
    path: '/',
    httpOnly: false,
    secure: isProd,
    sameSite: 'strict',
    maxAge
  });

  response.cookies.set('hb_user_username', user.username, {
    path: '/',
    httpOnly: false,
    secure: isProd,
    sameSite: 'strict',
    maxAge
  });

  response.cookies.set('hb_user_name', encodeURIComponent(user.name), {
    path: '/',
    httpOnly: false,
    secure: isProd,
    sameSite: 'strict',
    maxAge
  });
}

/**
 * Limpia todas las cookies de autenticación al cerrar sesión.
 */
export function clearAuthSessionCookies(response: NextResponse) {
  const clearOptions = { path: '/', maxAge: 0 };
  response.cookies.set('hb_session', '', clearOptions);
  response.cookies.set('hb_admin_auth', '', clearOptions);
  response.cookies.set('hb_user_role', '', clearOptions);
  response.cookies.set('hb_user_username', '', clearOptions);
  response.cookies.set('hb_user_name', '', clearOptions);
}

// ============================================================================
// 3. GUARDAS DE SEGURIDAD PARA ROUTE HANDLERS
// ============================================================================

/**
 * Exige que el llamador esté autenticado con rol ADMIN o SUPERADMIN.
 * Retorna null si es válido, o un NextResponse con error 401.
 */
export async function requireAdmin(request: NextRequest): Promise<{ user: SessionUser } | NextResponse> {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Acceso no autorizado. Se requiere sesión activa de Administrador.' },
      { status: 401 }
    );
  }
  return { user };
}

/**
 * Exige que el llamador tenga rol exclusivo SUPERADMIN.
 * Retorna null si es válido, o un NextResponse con error 403.
 */
export async function requireSuperAdmin(request: NextRequest): Promise<{ user: SessionUser } | NextResponse> {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Acceso no autorizado. Se requiere inicio de sesión.' },
      { status: 401 }
    );
  }

  if (user.role !== 'SUPERADMIN') {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado. Se requiere nivel de privilegios SUPERADMIN.' },
      { status: 403 }
    );
  }

  return { user };
}
