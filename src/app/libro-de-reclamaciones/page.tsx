'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Search, Send, CheckCircle2, ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function LibroDeReclamacionesPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'search'>('form');

  // Form State
  const [fullName, setFullName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contractedItem, setContractedItem] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'RECLAMO' | 'QUEJA'>('RECLAMO');
  const [detail, setDetail] = useState('');
  const [customerRequest, setCustomerRequest] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdClaim, setCreatedClaim] = useState<{ trackingCode: string } | null>(null);
  const [formError, setFormError] = useState('');

  // Search State
  const [searchTrackingCode, setSearchTrackingCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          documentId,
          phone,
          email,
          contractedItem,
          orderCode,
          amount: amount ? parseFloat(amount) : null,
          type,
          detail,
          customerRequest
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al registrar el reclamo');
      }

      setCreatedClaim({ trackingCode: data.trackingCode });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrackingCode.trim()) return;

    setSearchError('');
    setSearchResult(null);
    setIsSearching(true);

    try {
      const res = await fetch(`/api/claims?code=${encodeURIComponent(searchTrackingCode.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se encontró ningún reclamo con ese código.');
      }
      setSearchResult(data.data);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : 'Error al buscar el reclamo');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#E11D48] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Title */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-[#064E3B] font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#059669]" />
            <span>Plataforma Oficial de Defensa al Consumidor</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Libro de Reclamaciones Virtual
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Hobby Bolivia garantiza la máxima transparencia y respeto a los derechos de nuestros clientes. Puedes ingresar un reclamo o queja formal; te brindaremos un código de seguimiento y respuesta en el plazo legal establecido.
          </p>

          {/* Tab Selector */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'form'
                  ? 'bg-[#E11D48] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Registrar Nuevo Reclamo / Queja
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'search'
                  ? 'bg-[#064E3B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Consultar Estado de Reclamo
            </button>
          </div>
        </div>

        {/* Tab 1: Submit Claim Form */}
        {activeTab === 'form' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            {createdClaim ? (
              <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-black text-emerald-950 font-serif">
                  ¡Reclamo Registrado Exitosamente!
                </h3>
                <p className="text-sm text-emerald-800 max-w-md mx-auto">
                  Tu número oficial de seguimiento es:
                </p>
                <div className="inline-block px-6 py-3 bg-white border-2 border-emerald-600 rounded-2xl text-xl font-black text-emerald-900 tracking-wider">
                  {createdClaim.trackingCode}
                </div>
                <p className="text-xs text-emerald-700">
                  Por favor guarda este código para consultar las actualizaciones de nuestro equipo administrativo.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setCreatedClaim(null);
                      setFullName('');
                      setDocumentId('');
                      setPhone('');
                      setEmail('');
                      setContractedItem('');
                      setOrderCode('');
                      setAmount('');
                      setDetail('');
                      setCustomerRequest('');
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Registrar otro reclamo
                  </button>
                  <button
                    onClick={() => {
                      setSearchTrackingCode(createdClaim.trackingCode);
                      setActiveTab('search');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#064E3B] text-white font-bold text-xs"
                  >
                    Ver Estado Ahora
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-[#E11D48] text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    1. Identificación del Consumidor Reclamante
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nombre Completo*
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ej. Juan Pérez Roca"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Cédula de Identidad (CI / Pasaporte)*
                      </label>
                      <input
                        type="text"
                        required
                        value={documentId}
                        onChange={(e) => setDocumentId(e.target.value)}
                        placeholder="Ej. 6543210 SC"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Teléfono / Celular de Contacto*
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. 77012345"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Correo Electrónico*
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="juan.perez@ejemplo.com"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Contracted Item */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    2. Identificación del Bien o Servicio Contratado
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Arreglo o Servicio Contratado*
                      </label>
                      <input
                        type="text"
                        required
                        value={contractedItem}
                        onChange={(e) => setContractedItem(e.target.value)}
                        placeholder="Ej. Bouquet Imperial de 24 Rosas Rojas"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Código de Pedido (Opcional)
                      </label>
                      <input
                        type="text"
                        value={orderCode}
                        onChange={(e) => setOrderCode(e.target.value)}
                        placeholder="Ej. HB-20261016-001"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Monto Reclamado en Bs. (Opcional)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Ej. 240.00"
                      className="w-full sm:w-48 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>
                </div>

                {/* Section 3: Detail of Claim or Complaint */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    3. Detalle de la Reclamación
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Tipo de Disconformidad:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setType('RECLAMO')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          type === 'RECLAMO'
                            ? 'border-[#E11D48] bg-rose-50/70 ring-1 ring-[#E11D48]'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                          <input
                            type="radio"
                            name="claim_type"
                            checked={type === 'RECLAMO'}
                            onChange={() => setType('RECLAMO')}
                            className="text-[#E11D48]"
                          />
                          <span>RECLAMO</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Disconformidad relacionada a los arreglos florales o productos recibidos.
                        </p>
                      </label>

                      <label
                        onClick={() => setType('QUEJA')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          type === 'QUEJA'
                            ? 'border-[#E11D48] bg-rose-50/70 ring-1 ring-[#E11D48]'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                          <input
                            type="radio"
                            name="claim_type"
                            checked={type === 'QUEJA'}
                            onChange={() => setType('QUEJA')}
                            className="text-[#E11D48]"
                          />
                          <span>QUEJA</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Malestar o descontento respecto a la atención al cliente recibida.
                        </p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Detalle de los Hechos (Describe con precisión lo sucedido)*
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      placeholder="Explica qué ocurrió, fecha, lugar o cualquier aspecto relevante..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Pedido Concreto del Consumidor (¿Qué solución solicitas?)*
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={customerRequest}
                      onChange={(e) => setCustomerRequest(e.target.value)}
                      placeholder="Ej. Solicito el reemplazo del arreglo floral o devolución del importe pagado..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>REGISTRAR EN EL LIBRO DE RECLAMACIONES</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Search Claim Status */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Consultar Estado de tu Reclamo
            </h3>

            <form onSubmit={handleSearchClaim} className="flex gap-2">
              <input
                type="text"
                required
                value={searchTrackingCode}
                onChange={(e) => setSearchTrackingCode(e.target.value.toUpperCase())}
                placeholder="Ingresa tu código (ej. REC-2026-1234)"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono uppercase focus:outline-none focus:border-[#064E3B]"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-2.5 bg-[#064E3B] hover:bg-[#059669] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </button>
            </form>

            {searchError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-[#E11D48] text-xs font-semibold rounded-xl">
                {searchError}
              </div>
            )}

            {searchResult && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Código de Seguimiento
                    </span>
                    <span className="font-mono font-black text-lg text-slate-900">
                      {searchResult.trackingCode}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                      searchResult.status === 'RESUELTO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : searchResult.status === 'EN_PROCESO'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-[#E11D48]'
                    }`}
                  >
                    Estado: {searchResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">Consumidor:</span>
                    <span className="text-slate-800 font-bold">{searchResult.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Tipo:</span>
                    <span className="text-slate-800 font-bold">{searchResult.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Producto / Servicio:</span>
                    <span className="text-slate-800 font-bold">{searchResult.contractedItem}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Fecha de Registro:</span>
                    <span className="text-slate-800 font-bold">
                      {new Date(searchResult.createdAt).toLocaleDateString('es-BO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-xs">
                    <span className="text-slate-400 font-semibold block">Detalle registrado:</span>
                    <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 mt-1">
                      {searchResult.detail}
                    </p>
                  </div>

                  {searchResult.adminNotes && (
                    <div className="text-xs pt-2">
                      <span className="text-emerald-700 font-bold block">Respuesta de Hobby Bolivia:</span>
                      <p className="text-emerald-950 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 mt-1 font-medium">
                        {searchResult.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
