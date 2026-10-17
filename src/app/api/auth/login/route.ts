import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Ingresa usuario y contraseña' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // 1. Guaranteed master account: superadmin / superhobby2026*
    let matchedUser: {
      id?: number;
      username: string;
      name: string;
      role: 'SUPERADMIN' | 'ADMIN';
      isActive?: boolean;
    } | null = null;

    if (cleanUsername === 'superadmin' && password === 'superhobby2026*') {
      matchedUser = {
        id: 1,
        username: 'superadmin',
        name: 'Super Administrador',
        role: 'SUPERADMIN',
        isActive: true
      };
    } else if (
      (cleanUsername === 'dariasdigital_hobbybolivia' || cleanUsername === 'admin@hobbybolivia.com') &&
      password === 'Imp6fSMr2%mj0w?v'
    ) {
      matchedUser = {
        id: 2,
        username: 'dariasdigital_hobbybolivia',
        name: 'Administrador Hobby Bolivia',
        role: 'SUPERADMIN',
        isActive: true
      };
    } else {
      // 2. Lookup in database
      const dbUser = await getUserByUsername(cleanUsername);
      if (dbUser && dbUser.password === password) {
        if (dbUser.isActive === false) {
          return NextResponse.json(
            { success: false, error: 'Esta cuenta ha sido desactivada por el Superadmin.' },
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

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: matchedUser.id,
        username: matchedUser.username,
        name: matchedUser.name,
        role: matchedUser.role
      }
    });

    // Set auth cookies for session and role enforcement
    const cookieOptions = {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    };

    response.cookies.set('hb_admin_auth', 'authenticated', cookieOptions);
    response.cookies.set('hb_user_role', matchedUser.role, cookieOptions);
    response.cookies.set('hb_user_username', matchedUser.username, cookieOptions);
    response.cookies.set('hb_user_name', encodeURIComponent(matchedUser.name), cookieOptions);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Error al procesar login' }, { status: 500 });
  }
}

