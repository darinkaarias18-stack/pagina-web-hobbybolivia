import { NextRequest, NextResponse } from 'next/server';
import { getQuoteOrders, createQuoteOrder, updateQuoteOrderStatus, deleteQuoteOrder } from '@/lib/db';
import type { OrderStatus } from '@/lib/types';
import { requireAdmin } from '@/lib/auth';
import { sanitizeText } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const orders = await getQuoteOrders();
    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Error in GET /api/quotes:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      recipientName,
      deliveryCity,
      deliveryDate,
      deliveryTimeSlot,
      deliveryAddress,
      cardMessage,
      customerNotes,
      items,
      total
    } = body;

    const cleanCustomerName = sanitizeText(customerName, 150);
    const cleanCustomerPhone = sanitizeText(customerPhone, 50);

    if (!cleanCustomerName || !cleanCustomerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Faltan datos obligatorios del pedido (cliente, teléfono o productos)." },
        { status: 400 }
      );
    }

    const order = await createQuoteOrder({
      customerName: cleanCustomerName,
      customerPhone: cleanCustomerPhone,
      recipientName: sanitizeText(recipientName || cleanCustomerName, 150),
      deliveryCity: sanitizeText(deliveryCity || "La Paz", 100),
      deliveryDate: sanitizeText(deliveryDate || new Date().toLocaleDateString('es-BO'), 50),
      deliveryTimeSlot: sanitizeText(deliveryTimeSlot || "Horario a coordinar", 100),
      deliveryAddress: sanitizeText(deliveryAddress || "A coordinar por WhatsApp", 300),
      cardMessage: sanitizeText(cardMessage || "", 1000),
      customerNotes: sanitizeText(customerNotes || cardMessage || "", 1000),
      items,
      total: Number(total) || 0,
      status: "PEDIDO"
    });

    return NextResponse.json({
      success: true,
      orderCode: order.orderCode,
      data: order,
      order
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/quotes:", error);
    return NextResponse.json({ success: false, error: "Failed to create quote order" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const { orderCode, id, status } = body;

    if ((!orderCode && !id) || !status) {
      return NextResponse.json({ success: false, error: "orderCode and status are required" }, { status: 400 });
    }

    const updated = await updateQuoteOrderStatus(orderCode || id, status as OrderStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error in PUT /api/quotes:", error);
    const message = error?.message || "Error al actualizar el estado del pedido";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const codeParam = searchParams.get('orderCode');
    let orderIdentifier = (idParam && idParam !== 'undefined') ? idParam : codeParam;

    if (!orderIdentifier) {
      const body = await request.json().catch(() => ({}));
      orderIdentifier = body?.id || body?.orderCode;
    }

    if (!orderIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Código o ID de pedido requerido para eliminar' },
        { status: 400 }
      );
    }

    await deleteQuoteOrder(orderIdentifier);
    return NextResponse.json({
      success: true,
      message: `Pedido ${orderIdentifier} eliminado con éxito`
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/quotes:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al eliminar el pedido' },
      { status: 500 }
    );
  }
}
