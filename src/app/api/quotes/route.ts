import { NextRequest, NextResponse } from 'next/server';
import { getQuoteOrders, createQuoteOrder, updateQuoteOrderStatus } from '@/lib/db';
import type { OrderStatus } from '@/lib/types';
import { requireAdmin } from '@/lib/auth';

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

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Faltan datos obligatorios del pedido (cliente, teléfono o productos)." },
        { status: 400 }
      );
    }

    const order = await createQuoteOrder({
      customerName,
      customerPhone,
      recipientName: recipientName || customerName,
      deliveryCity: deliveryCity || "La Paz",
      deliveryDate: deliveryDate || new Date().toLocaleDateString('es-BO'),
      deliveryTimeSlot: deliveryTimeSlot || "Horario a coordinar",
      deliveryAddress: deliveryAddress || "A coordinar por WhatsApp",
      cardMessage: cardMessage || "",
      customerNotes: customerNotes || cardMessage || "",
      items,
      total: Number(total) || 0,
      status: "PENDING"
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
  } catch (error) {
    console.error("Error in PUT /api/quotes:", error);
    return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 });
  }
}
