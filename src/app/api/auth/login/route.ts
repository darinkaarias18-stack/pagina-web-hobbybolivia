import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const validUser =
      (username === 'dariasdigital_hobbybolivia' || username === 'admin@hobbybolivia.com') &&
      password === 'Imp6fSMr2%mj0w?v';

    if (!validUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        username: 'dariasdigital_hobbybolivia',
        name: 'Administrador Hobby Bolivia',
        role: 'ADMIN'
      }
    });

    // Set auth cookie
    response.cookies.set('hb_admin_auth', 'authenticated', {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Error al procesar login' }, { status: 500 });
  }
}
