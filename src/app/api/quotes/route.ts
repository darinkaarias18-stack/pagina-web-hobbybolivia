import { NextRequest, NextResponse } from 'next/server';
import { getQuoteOrders, createQuoteOrder, updateQuoteOrderStatus } from '@/lib/db';
import type { OrderStatus } from '@/lib/types';

export async function GET() {
  try {
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
      deliveryDate,
      deliveryTimeSlot,
      deliveryAddress,
      cardMessage,
      items,
      total
    } = body;

    if (!customerName || !customerPhone || !recipientName || !deliveryDate || !deliveryAddress || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order fields (customer, recipient, date, address, items)" },
        { status: 400 }
      );
    }

    const result = await createQuoteOrder({
      customerName,
      customerPhone,
      recipientName,
      deliveryDate,
      deliveryTimeSlot: deliveryTimeSlot || "Horario a coordinar",
      deliveryAddress,
      cardMessage: cardMessage || "",
      items,
      total: Number(total) || 0,
      status: "PENDING"
    });

    return NextResponse.json({
      success: true,
      orderCode: result.order.orderCode,
      order: result.order,
      whatsappUrl: result.whatsappUrl
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/quotes:", error);
    return NextResponse.json({ success: false, error: "Failed to create quote order" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderCode, status } = body;

    if (!orderCode || !status) {
      return NextResponse.json({ success: false, error: "orderCode and status are required" }, { status: 400 });
    }

    const updated = await updateQuoteOrderStatus(orderCode, status as OrderStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in PUT /api/quotes:", error);
    return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 });
  }
}
