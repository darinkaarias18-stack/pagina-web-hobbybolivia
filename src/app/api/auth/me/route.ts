import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('hb_admin_auth');
  const roleCookie = request.cookies.get('hb_user_role');
  const usernameCookie = request.cookies.get('hb_user_username');
  const nameCookie = request.cookies.get('hb_user_name');

  if (authCookie && authCookie.value === 'authenticated') {
    return NextResponse.json({
      authenticated: true,
      user: {
        username: usernameCookie?.value || 'admin',
        role: roleCookie?.value || 'ADMIN',
        name: nameCookie?.value ? decodeURIComponent(nameCookie.value) : 'Usuario'
      }
    });
  }

  return NextResponse.json({
    authenticated: false,
    user: null
  });
}
