import { NextRequest, NextResponse } from 'next/server';
import { getClaimRecords, getClaimRecordByCode, createClaimRecord, updateClaimStatus } from '@/lib/db';
import type { ClaimStatus } from '@/lib/types';
import { requireAdmin, getSessionUser } from '@/lib/auth';
import { sanitizeText } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    // Consulta individual por código de seguimiento (permitido para clientes con su código)
    if (code) {
      const claim = await getClaimRecordByCode(code.trim().toUpperCase());
      if (!claim) {
        return NextResponse.json({ success: false, error: "Reclamo no encontrado" }, { status: 404 });
      }

      const adminUser = await getSessionUser(request);
      if (!adminUser) {
        // Enmascarar / omitir PII sensible (cédula, teléfono, email) para consultas públicas
        const sanitizedClaim = {
          id: claim.id,
          trackingCode: claim.trackingCode,
          fullName: claim.fullName,
          contractedItem: claim.contractedItem,
          orderCode: claim.orderCode,
          type: claim.type,
          detail: claim.detail,
          status: claim.status,
          adminNotes: claim.adminNotes,
          createdAt: claim.createdAt,
          updatedAt: claim.updatedAt
        };
        return NextResponse.json({ success: true, data: sanitizedClaim });
      }

      return NextResponse.json({ success: true, data: claim });
    }

    // Listado masivo de reclamos: requiere autenticación de administrador para proteger PII
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

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

    const cleanFullName = sanitizeText(fullName, 150);
    const cleanDocumentId = sanitizeText(documentId, 50);
    const cleanPhone = sanitizeText(phone, 50);
    const cleanEmail = sanitizeText(email, 120);
    const cleanContractedItem = sanitizeText(contractedItem, 255);
    const cleanDetail = sanitizeText(detail, 2500);
    const cleanCustomerRequest = sanitizeText(customerRequest, 2500);

    if (!cleanFullName || !cleanDocumentId || !cleanPhone || !cleanEmail || !cleanContractedItem || !cleanDetail || !cleanCustomerRequest) {
      return NextResponse.json(
        { success: false, error: "Todos los campos obligatorios deben ser completados" },
        { status: 400 }
      );
    }

    const claim = await createClaimRecord({
      fullName: cleanFullName,
      documentId: cleanDocumentId,
      phone: cleanPhone,
      email: cleanEmail,
      contractedItem: cleanContractedItem,
      orderCode: orderCode ? sanitizeText(orderCode, 50) : null,
      amount: amount ? parseFloat(amount) : null,
      type: type === 'QUEJA' ? 'QUEJA' : 'RECLAMO',
      detail: cleanDetail,
      customerRequest: cleanCustomerRequest,
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
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

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
