import { NextRequest, NextResponse } from 'next/server';
import { testMysqlConnection, syncMysqlTables, getLocalStore } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const diag = await testMysqlConnection();
    const localStore = getLocalStore();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      mysql: diag,
      localFallback: {
        active: !diag.connected,
        productsCount: localStore.items?.length || 0,
        categoriesCount: localStore.categories?.length || 0,
        policiesCount: localStore.policies?.length || 0
      },
      currentMode: diag.connected ? 'MYSQL_HOSTING_LIVE' : 'LOCAL_REACTIVE_FALLBACK',
      message: diag.connected
        ? `Conectado exitosamente a MySQL del Hosting (${diag.host} / ${diag.database})`
        : diag.configured
        ? `Configuración presente pero no se pudo conectar al host (${diag.error || 'Verifica Remote MySQL o credenciales'})`
        : 'Operando en almacenamiento local reactivo. Configura las variables en .env para conectar tu hosting.'
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al diagnosticar base de datos'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const { forceSeed = true } = body as { forceSeed?: boolean };
    const result = await syncMysqlTables(forceSeed);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al sincronizar tablas en el hosting'
      },
      { status: 500 }
    );
  }
}
