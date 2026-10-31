import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRateConfig } from '@/lib/exchange-rate';
import { requireAdmin } from '@/lib/auth';
import { revalidateCatalog } from '@/lib/revalidate';

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const config = await getExchangeRateConfig(true);
    revalidateCatalog();
    return NextResponse.json({
      success: true,
      message: 'Tipo de cambio sincronizado exitosamente',
      data: {
        ...config,
        formatted: `1 USD = Bs. ${config.exchangeRate.toFixed(2)}`
      }
    });
  } catch (error) {
    console.error('[API Exchange Rate Sync Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al sincronizar tipo de cambio'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

