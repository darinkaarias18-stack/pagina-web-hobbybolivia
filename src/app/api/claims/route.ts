import { NextRequest, NextResponse } from 'next/server';
import { getClaimRecords, getClaimRecordByCode, createClaimRecord, updateClaimStatus } from '@/lib/db';
import type { ClaimStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      const claim = await getClaimRecordByCode(code.trim().toUpperCase());
      if (!claim) {
        return NextResponse.json({ success: false, error: "Reclamo no encontrado" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: claim });
    }

    const claims = await getClaimRecords();
    return NextResponse.json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    console.error("Error in GET /api/claims:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch claims" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      documentId,
      phone,
      email,
      contractedItem,
      orderCode,
      amount,
      type,
      detail,
      customerRequest
    } = body;

    if (!fullName || !documentId || !phone || !email || !contractedItem || !detail || !customerRequest) {
      return NextResponse.json(
        { success: false, error: "Todos los campos obligatorios deben ser completados" },
        { status: 400 }
      );
    }

    const claim = await createClaimRecord({
      fullName,
      documentId,
      phone,
      email,
      contractedItem,
      orderCode: orderCode || null,
      amount: amount ? parseFloat(amount) : null,
      type: type === 'QUEJA' ? 'QUEJA' : 'RECLAMO',
      detail,
      customerRequest,
      adminNotes: null
    });

    return NextResponse.json({
      success: true,
      trackingCode: claim.trackingCode,
      data: claim,
      message: "Reclamo registrado exitosamente en el Libro de Reclamaciones de Hobby Bolivia"
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/claims:", error);
    return NextResponse.json({ success: false, error: "Failed to create claim" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingCode, status, adminNotes } = body;

    if (!trackingCode || !status) {
      return NextResponse.json({ success: false, error: "trackingCode and status are required" }, { status: 400 });
    }

    const updated = await updateClaimStatus(trackingCode, status as ClaimStatus, adminNotes);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in PUT /api/claims:", error);
    return NextResponse.json({ success: false, error: "Failed to update claim" }, { status: 500 });
  }
}
