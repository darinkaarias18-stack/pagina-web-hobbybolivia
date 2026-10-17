import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada con éxito' });

  // Clear auth cookies
  const clearOptions = {
    path: '/',
    maxAge: 0
  };

  response.cookies.set('hb_admin_auth', '', clearOptions);
  response.cookies.set('hb_user_role', '', clearOptions);
  response.cookies.set('hb_user_username', '', clearOptions);
  response.cookies.set('hb_user_name', '', clearOptions);

  return response;
}
