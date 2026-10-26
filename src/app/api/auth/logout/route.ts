import { NextResponse } from 'next/server';
import { clearAuthSessionCookies } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada con éxito' });
  clearAuthSessionCookies(response);
  return response;
}
