'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Printer,
  Send,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Phone,
  User,
  CheckCircle,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { QuoteOrder, OrderStatus } from '@/lib/types';

export default function AdminQuotesPage() {
  const [orders, setOrders] = useState<QuoteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal for printable card dedication
  const [printOrder, setPrintOrder] = useState<QuoteOrder | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotes');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderCode: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch('/api/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode, status: newStatus })
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.orderCode === orderCode ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.recipientName || '').toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);


    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#8a6a00] uppercase tracking-wider block">
            Despachos y Ventas RC
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10202f] font-serif">
            Bandeja de Pedidos & Cotizaciones
          </h1>
          <p className="text-xs text-[#6b7480]">
            Controla las solicitudes de repuestos, envíos departamentales y confirmaciones por WhatsApp.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-white border border-[#10202f] hover:bg-[#ebe4d3] text-[#10202f] font-bold text-xs rounded-full shadow-xs self-start sm:self-auto cursor-pointer"
        >
          Refrescar Bandeja
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código (HB-...), remitente, destinatario o celular..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="IN_PREPARATION">En Preparación</option>
            <option value="DELIVERED">Entregados</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#E11D48]" />
          <span>Cargando pedidos...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-xs text-slate-500">
          No hay pedidos registrados con estos criterios.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const cleanPhone = ord.customerPhone.replace(/[^0-9]/g, '');
            const waChatUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}`;

            return (
              <div
                key={ord.orderCode}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 sm:p-6 space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                      {ord.orderCode}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ord.createdAt || 0).toLocaleString('es-BO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.orderCode, e.target.value as OrderStatus)}
                      className={`text-xs font-extrabold uppercase rounded-xl px-3 py-1.5 border cursor-pointer focus:outline-none ${ord.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : ord.status === 'IN_PREPARATION'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : ord.status === 'CANCELLED'
                              ? 'bg-slate-100 text-slate-500 border-slate-200'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                    >
                      <option value="PENDING">PENDIENTE</option>
                      <option value="IN_PREPARATION">EN PREPARACIÓN</option>
                      <option value="DELIVERED">ENTREGADO</option>
                      <option value="CANCELLED">CANCELADO</option>
                    </select>

                    {/* WhatsApp Direct Button */}
                    <a
                      href={waChatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Abrir chat de WhatsApp con el cliente"
                    >
                      <Send className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Print Dedication Button */}
                    <button
                      onClick={() => setPrintOrder(ord)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      title="Ver e imprimir tarjeta de felicitación"
                    >
                      <Printer className="w-3.5 h-3.5 text-rose-300" />
                      <span>Dedicatoria</span>
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: Remitente & Destinatario */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2 border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Cliente (Remitente)
                      </span>
                      <div className="font-bold text-slate-900">{ord.customerName}</div>
                      <div className="text-slate-500">{ord.customerPhone}</div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Destinatario (Quién Recibe)
                      </span>
                      <div className="font-bold text-slate-900">{ord.recipientName}</div>
                    </div>
                  </div>

                  {/* Column 2: Entrega */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2 border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#E11D48]" />
                        <span>Fecha & Horario de Entrega</span>
                      </span>
                      <div className="font-bold text-slate-900 text-sm">{ord.deliveryDate}</div>
                      <div className="text-slate-600 font-semibold">{ord.deliveryTimeSlot}</div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E11D48]" />
                        <span>Dirección / Zona</span>
                      </span>
                      <div className="text-slate-800 leading-snug">{ord.deliveryAddress}</div>
                    </div>
                  </div>

                  {/* Column 3: Dedicatoria Card */}
                  <div className="bg-[#FFF1F2] p-3.5 rounded-2xl border border-rose-200/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#E11D48] uppercase tracking-wider block flex items-center gap-1 mb-1">
                        <Heart className="w-3 h-3" />
                        <span>Texto de la Tarjeta Dedicatoria</span>
                      </span>
                      <p className="font-serif italic text-slate-800 text-xs leading-relaxed line-clamp-4">
                        &quot;{ord.cardMessage || 'Sin dedicatoria solicitada'}&quot;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-rose-200/60 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Total Pedido:</span>
                      <span className="text-base font-black text-[#E11D48]">{formatPrice(ord.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Items in order */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Arreglos incluidos:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ord.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                      >
                        {it.quantity}x {it.item.title}
                        {it.selectedOptions && (
                          <span className="text-[10px] text-slate-500 ml-1">
                            ({Object.values(it.selectedOptions).join(', ')})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Dedication Card Modal */}
      {printOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tarjeta de Felicitación / Dedicatoria</h3>
                <p className="text-[11px] text-slate-500">Orden #{printOrder.orderCode}</p>
              </div>
              <button
                onClick={() => setPrintOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* The actual Card Preview formatted for printing */}
            <div
              id="printable-card"
              className="bg-gradient-to-br from-[#FFF1F2] to-white border-2 border-rose-300 rounded-2xl p-8 text-center space-y-4 shadow-inner"
            >
              <div className="w-8 h-8 rounded-full bg-rose-100 text-[#E11D48] flex items-center justify-center mx-auto text-xs font-bold">
                HB
              </div>

              <div className="text-xs font-serif uppercase tracking-widest text-[#064E3B] font-bold">
                Para: {printOrder.recipientName}
              </div>

              <div className="font-serif italic text-base sm:text-lg text-slate-800 leading-relaxed max-w-sm mx-auto py-2">
                &quot;{printOrder.cardMessage || 'Con todo nuestro cariño y mejores deseos.'}&quot;
              </div>

              <div className="text-xs font-serif text-slate-500 pt-2 border-t border-rose-200">
                De: {printOrder.customerName}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPrintOrder(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Tarjeta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
