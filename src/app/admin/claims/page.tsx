'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, CheckCircle, Clock, AlertCircle, MessageSquare, Loader2, Send } from 'lucide-react';
import type { ClaimRecord, ClaimStatus } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [newStatus, setNewStatus] = useState<ClaimStatus>('PENDIENTE');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/claims');
      const data = await res.json();
      if (data.success) setClaims(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const openClaimDetails = (c: ClaimRecord) => {
    setSelectedClaim(c);
    setNewStatus(c.status);
    setAdminNotes(c.adminNotes || '');
  };

  const handleUpdateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingCode: selectedClaim.trackingCode,
          status: newStatus,
          adminNotes
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setClaims((prev) =>
          prev.map((c) => (c.trackingCode === selectedClaim.trackingCode ? data.data : c))
        );
        setSelectedClaim(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const filteredClaims = claims.filter(
    (c) =>
      c.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.documentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#E11D48] uppercase tracking-wider block">
            Libro de Reclamaciones Oficial
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Gestión de Reclamos & Quejas
          </h1>
          <p className="text-xs text-slate-500">
            Responde formalmente a las solicitudes registradas por los consumidores en la plataforma.
          </p>
        </div>

        <button
          onClick={loadClaims}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs self-start sm:self-auto cursor-pointer"
        >
          Refrescar Reclamos
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código (REC-...), nombre o cédula de identidad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <span className="text-xs text-slate-400 font-semibold">{filteredClaims.length} registros</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#E11D48]" />
            <span>Cargando libro de reclamaciones...</span>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No hay reclamos o quejas registradas. ¡Excelente servicio!
          </div>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-thin rounded-2xl border border-slate-200 touch-pan-x">
            <table className="w-full text-left text-xs min-w-[680px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Consumidor</th>
                  <th className="py-3 px-4">Arreglo / Orden</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((c) => (
                  <tr key={c.trackingCode} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.trackingCode}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${c.type === 'RECLAMO' ? 'bg-rose-100 text-[#E11D48]' : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{c.fullName}</div>
                      <div className="text-[11px] text-slate-400">CI: {c.documentId}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{c.contractedItem}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(c.createdAt || 0).toLocaleDateString('es-BO')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${c.status === 'RESUELTO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'EN_PROCESO'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-[#E11D48]'
                          }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openClaimDetails(c)}
                        className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & Resolution Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Atención de Reclamación #{selectedClaim.trackingCode}
                </h3>
                <p className="text-[11px] text-slate-500">Registrado por {selectedClaim.fullName}</p>
              </div>
              <button onClick={() => setSelectedClaim(null)} className="text-slate-400">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Teléfono:</span>
                  <span className="font-bold text-slate-800">{selectedClaim.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Email:</span>
                  <span className="font-bold text-slate-800">{selectedClaim.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Producto Reclamado:</span>
                  <span className="font-bold text-slate-800">{selectedClaim.contractedItem}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Monto:</span>
                  <span className="font-bold text-slate-800">
                    {selectedClaim.amount ? formatPrice(selectedClaim.amount) : 'No especificado'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px]">Detalle del Reclamo:</span>
                <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 mt-1">
                  {selectedClaim.detail}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[10px]">
                  Pedido Concreto del Consumidor:
                </span>
                <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 mt-1">
                  {selectedClaim.customerRequest}
                </p>
              </div>
            </div>

            {/* Resolution Form */}
            <form onSubmit={handleUpdateClaim} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Estado de Resolución*</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ClaimStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#E11D48]"
                >
                  <option value="PENDIENTE">PENDIENTE (En espera de revisión)</option>
                  <option value="EN_PROCESO">EN PROCESO (Investigando o coordinando reemplazo)</option>
                  <option value="RESUELTO">RESUELTO (Caso concluido y notificado)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Respuesta Oficial de Hobby Bolivia (Visible para el cliente al consultar):
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ej. Estimado cliente, hemos procedido a la compensación y despacho del nuevo bouquet..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-[#E11D48] text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Resolución</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
