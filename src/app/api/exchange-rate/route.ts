import { NextRequest, NextResponse } from 'next/server';
import {
  getExchangeRateConfig,
  updateExchangeRateConfig,
  convertUsdToBob,
  convertBobToUsd,
  CACHE_DURATION_MS
} from '@/lib/exchange-rate';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true' || searchParams.get('force') === 'true';

    const config = await getExchangeRateConfig(forceRefresh);

    const lastCheckedTime = config.lastChecked ? new Date(config.lastChecked).getTime() : Date.now();
    const ageMs = Date.now() - lastCheckedTime;
    const remainingMs = Math.max(0, CACHE_DURATION_MS - ageMs);
    const cacheExpiresInHours = Number((remainingMs / (1000 * 60 * 60)).toFixed(1));

    // Cálculos de ejemplo para el frontend
    const sample10UsdInBob = convertUsdToBob(10, config.exchangeRate);
    const sample100BobInUsd = convertBobToUsd(100, config.exchangeRate);

    return NextResponse.json({
      success: true,
      data: {
        ...config,
        formatted: `1 USD = Bs. ${config.exchangeRate.toFixed(2)}`,
        cacheExpiresInHours,
        samples: {
          usd10ToBob: sample10UsdInBob,
          bob100ToUsd: sample100BobInUsd
        }
      }
    });
  } catch (error) {
    console.error('[API Exchange Rate Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al consultar tipo de cambio'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const { exchangeRate, autoUpdate, source } = body;

    const updated = await updateExchangeRateConfig({
      exchangeRate: exchangeRate !== undefined ? Number(exchangeRate) : undefined,
      autoUpdate: autoUpdate !== undefined ? Boolean(autoUpdate) : undefined,
      source: source || (autoUpdate ? 'API Oficial' : 'Manual (Administrador)')
    });

    return NextResponse.json({
      success: true,
      message: 'Tipo de cambio actualizado correctamente',
      data: {
        ...updated,
        formatted: `1 USD = Bs. ${updated.exchangeRate.toFixed(2)}`
      }
    });
  } catch (error) {
    console.error('[API Exchange Rate PUT Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar tipo de cambio'
      },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Permitir POST como alias de PUT para compatibilidad con diferentes clientes HTTP
  return PUT(request);
}
