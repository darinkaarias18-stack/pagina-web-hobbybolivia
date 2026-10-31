'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  MessageCircle,
  Truck,
  ShieldCheck,
  Share2,
  Copy,
  ChevronRight,
  Package,
  Wrench,
  Clock,
  Sparkles,
  ExternalLink,
  Award
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/catalog/ProductCard';
import type { Product, SiteConfig } from '@/lib/types';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  config?: SiteConfig | null;
  exchangeRate?: number;
}

export function ProductDetailClient({
  product,
  relatedProducts = [],
  config,
  exchangeRate = 11.84
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const rawInitialImage = product.image_url || (product.images && product.images[0]) || product.imageUrl;
  const isInvalidInitialImage = !rawInitialImage || rawInitialImage.trim() === '' || rawInitialImage.includes('d0721149ad-dubq3570tn-t');
  const [selectedImage, setSelectedImage] = useState<string>(
    isInvalidInitialImage ? '/placeholder.webp' : rawInitialImage.trim()
  );
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');
  const [copiedLink, setCopiedLink] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  // Precios
  const rate = exchangeRate > 0 ? exchangeRate : 11.8552;
  const isUsd =
    String(product.currency || '').trim().toUpperCase() === 'USD' ||
    String((product as any).display_currency || '').trim().toUpperCase() === 'USD';
  const priceBob = isUsd ? product.price * rate : product.price;
  const priceUsd = isUsd ? product.price : (rate > 0 ? product.price / rate : 0);

  const formatBs = (num: number) =>
    `Bs. ${(Number(num) || 0).toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const formatUsd = (num: number) =>
    `$ ${(Number(num) || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} USD`;

  // Mostrar fielmente el SKU/Código oficial del producto (coincidente con Admin Products)
  const systemSku = product.sku || (product.id ? `HB-${product.id.toString().padStart(4, '0')}` : '');

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Enlace preformateado de WhatsApp
  const whatsappNumber = (config?.whatsappNumber || '+591 77293446').replace(/[^\d]/g, '');
  const whatsappMessage = encodeURIComponent(
    `Hola Hobby Bolivia, tengo interés en adquirir el producto:\n\n*${product.name || product.title}*\n• SKU: ${systemSku}\n• Precio: ${formatBs(priceBob)} (${formatUsd(priceUsd)})\n• Cantidad: ${quantity} unidad(es)\n\n¿Tienen disponibilidad y costos de envío a mi ciudad? Gracias.`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${whatsappMessage}`;

  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (product.image_url && !product.image_url.includes('d0721149ad-dubq3570tn-t')) {
      list.push(product.image_url);
    }
    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img && !img.includes('d0721149ad-dubq3570tn-t') && !list.includes(img)) {
          list.push(img);
        }
      }
    }
    if (list.length === 0) {
      list.push('/placeholder.webp');
    }
    return list;
  }, [product]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1817] flex flex-col font-sans">
      {/* 1. Barra Superior y Navegación Principal */}
      <TopBar config={config} exchangeRate={exchangeRate} />
      <Header config={config} />

      {/* 2. Breadcrumbs & Volver al Catálogo */}
      <div className="w-full max-w-[1320px] mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8C827A] border-b border-[#E2DCD3] pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-[#D4A359] transition-colors font-semibold">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB3]" />
            <Link href="/#catalogo" className="hover:text-[#D4A359] transition-colors font-semibold">
              Catálogo de Productos
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB3]" />
                <span className="text-[#5C5650] font-semibold">
                  {product.category.name}
                </span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB3]" />
            <span className="text-[#1A1817] font-bold truncate max-w-[220px] sm:max-w-xs">
              {product.name || product.title}
            </span>
          </div>

          <Link
            href="/#catalogo"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A1817] hover:text-[#D4A359] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4A359]" />
            <span>Volver al Catálogo</span>
          </Link>
        </div>
      </div>

      {/* 3. Contenedor Principal del Detalle de Producto */}
      <main className="w-full max-w-[1320px] mx-auto px-4 py-4 sm:py-6 flex-1 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ================= COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES ================= */}
          <div className="lg:col-span-6 space-y-4">
            <div
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`rounded-3xl p-6 sm:p-8 border border-[#E2DCD3] shadow-sm relative overflow-hidden flex items-center justify-center min-h-[380px] sm:min-h-[460px] cursor-zoom-in ${selectedImage.includes('placeholder.webp') ? 'bg-[#FAF8F5]' : 'bg-white'}`}
            >
              {/* Badges de Estado */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {product.badge && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#211E1C] text-[#D4A359] border border-[#D4A359]/40 shadow-xs">
                    {product.badge}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#3E7B44] text-white shadow-xs">
                  ✓ En Stock Disponible
                </span>
              </div>

              {/* Botón de Compartir */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-white text-[#5C5650] hover:text-[#1A1817] border border-[#E2DCD3] hover:border-[#D4A359] transition-all cursor-pointer shadow-2xs"
                title="Copiar enlace directo de este producto"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

              {/* Imagen Principal con Lupa / Zoom interactivo */}
              <img
                src={selectedImage}
                alt={product.name || product.title}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                }}
                className={`max-h-[360px] sm:max-h-[420px] w-auto max-w-full mx-auto transition-transform duration-200 ease-out select-none ${isHovered ? 'scale-150' : 'scale-100'
                  } ${selectedImage.includes('placeholder.webp') ? 'object-cover rounded-2xl shadow-sm' : 'object-contain'}`}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('placeholder.webp')) {
                    target.src = '/placeholder.webp';
                  }
                }}
              />
            </div>

            {/* Tira de Miniaturas (si hay más de 1 imagen) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-2xl bg-white p-2 border transition-all cursor-pointer shrink-0 overflow-hidden ${selectedImage === img
                      ? 'border-[#D4A359] ring-2 ring-[#D4A359]/40 shadow-xs'
                      : 'border-[#E2DCD3] hover:border-[#D4A359]/60 opacity-80 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Garantías de Marca */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCD3] text-center space-y-1 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-[#D4A359] mx-auto" />
                <span className="text-[11px] font-black text-[#1A1817] block">100% Original</span>
                <span className="text-[9.5px] text-[#8C827A] block leading-tight">Dubro & Marcas Oficiales</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCD3] text-center space-y-1 shadow-2xs">
                <Truck className="w-5 h-5 text-[#3E7B44] mx-auto" />
                <span className="text-[11px] font-black text-[#1A1817] block">Envío Nacional</span>
                <span className="text-[9.5px] text-[#8C827A] block leading-tight">A toda Bolivia</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCD3] text-center space-y-1 shadow-2xs">
                <Award className="w-5 h-5 text-[#D4A359] mx-auto" />
                <span className="text-[11px] font-black text-[#1A1817] block">Soporte Técnico</span>
                <span className="text-[9.5px] text-[#8C827A] block leading-tight">Aeromodelismo Pro</span>
              </div>
            </div>
          </div>

          {/* ================= COLUMNA DERECHA: INFORMACIÓN COMERCIAL & ACCIÓN ================= */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Marca & Categoría */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#211E1C] text-[#D4A359]">
                  {product.brand || 'Dubro Products'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#5C5650] border border-[#E2DCD3]">
                  {product.category?.name || 'Productos y Accesorios'}
                </span>
                <span className="font-mono text-xs font-bold text-[#8C827A] ml-auto">
                  SKU: <strong className="text-[#1A1817]">{systemSku}</strong>
                </span>
              </div>

              {/* Título Principal */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1A1817] tracking-tight leading-tight">
                {product.name || product.title}
              </h1>

              {/* Disponibilidad */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3E7B44] animate-pulse" />
                <span className="font-bold text-[#3E7B44]">
                  Stock disponible en almacén para entrega o despacho inmediato
                </span>
              </div>
            </div>

            {/* Tarjeta de Precio Destacada */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E2DCD3] shadow-sm space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#8C827A] block">
                Precio de Catálogo Oficial
              </span>
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-3xl sm:text-4xl font-mono font-black text-[#1A1817]">
                  {formatBs(priceBob)}
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-[#8C827A]">
                  ≈ {formatUsd(priceUsd)}
                </span>
              </div>
              <p className="text-[11px] text-[#8C827A] pt-2 border-t border-[#EFEAE2]">
                * Tipo de cambio oficial referencial: <strong className="text-[#1A1817]">1 USD = Bs. {rate.toFixed(2)}</strong>. Facturación y pago en Bolivianos (BOB) o USD al cambio oficial.
              </p>
            </div>

            {/* Selector de Cantidad y Acciones de Compra */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#5C5650]">
                  Cantidad:
                </span>
                <div className="flex items-center rounded-2xl bg-white border border-[#E2DCD3] p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[#1A1817] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    title="Disminuir"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-mono font-black text-sm text-[#1A1817]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[#1A1817] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    title="Aumentar"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-[#8C827A]">
                  Total a cotizar: <strong className="text-[#1A1817] font-mono font-black">{formatBs(priceBob * quantity)}</strong>
                </div>
              </div>

              {/* Botón Principal: Agregar al Carrito */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 px-6 rounded-2xl bg-[#211E1C] hover:bg-[#2F2A27] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-[#161311]/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400">¡Añadido al Carrito con Éxito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 text-[#D4A359]" />
                    <span>Añadir al Carrito de Cotización</span>
                  </>
                )}
              </button>

              {/* Botón Secundario: WhatsApp Directo */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#1F6E43] hover:bg-[#185534] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md shadow-emerald-900/15 active:scale-[0.99] transition-all cursor-pointer text-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar y Comprar por WhatsApp Ahora</span>
              </a>
            </div>

            {/* Resumen de Despacho & Formas de Pago */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2DCD3] space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#D4A359] shrink-0 mt-0.5" />
                <p className="text-[#5C5650]">
                  <strong>Despacho Express:</strong> Entregas locales en La Paz en el día y envíos a Santa Cruz, Cochabamba y el resto de Bolivia por flota o encomienda aérea.
                </p>
              </div>
              <div className="flex items-start gap-2.5 pt-2 border-t border-[#EFEAE2]">
                <Package className="w-4 h-4 text-[#3E7B44] shrink-0 mt-0.5" />
                <p className="text-[#5C5650]">
                  <strong>Medios de Pago:</strong> Pago mediante QR Simple oficial de Hobby Bolivia, transferencia bancaria o en efectivo al retirar en tienda.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ================= SECCIÓN DE PESTAÑAS: DETALLE TÉCNICO Y ENVÍOS ================= */}
        <div className="bg-white rounded-3xl border border-[#E2DCD3] shadow-sm overflow-hidden">
          <div className="flex items-center border-b border-[#E2DCD3] bg-[#FAF8F5] overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('desc')}
              className={`px-6 py-4 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${activeTab === 'desc'
                ? 'border-[#D4A359] text-[#1A1817] bg-white'
                : 'border-transparent text-[#8C827A] hover:text-[#1A1817]'
                }`}
            >
              Descripción General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-6 py-4 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${activeTab === 'specs'
                ? 'border-[#D4A359] text-[#1A1817] bg-white'
                : 'border-transparent text-[#8C827A] hover:text-[#1A1817]'
                }`}
            >
              Ficha Técnica
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`px-6 py-4 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${activeTab === 'shipping'
                ? 'border-[#D4A359] text-[#1A1817] bg-white'
                : 'border-transparent text-[#8C827A] hover:text-[#1A1817]'
                }`}
            >
              Envíos & Políticas de Compra
            </button>
          </div>

          <div className="p-6 sm:p-8 text-xs leading-relaxed text-[#5C5650]">
            {activeTab === 'desc' && (
              <div className="space-y-4 max-w-4xl">
                <h3 className="text-base font-black text-[#1A1817]">
                  Acerca de {product.name || product.title}
                </h3>
                <p className="text-sm text-[#5C5650] leading-relaxed whitespace-pre-line">
                  {product.description ||
                    'Este producto original está fabricado con los más altos estándares de resistencia y precisión para modelos a radiocontrol (aviones, planeadores, helicópteros y drones). Diseñado para soportar vibraciones intensas, alto torque y condiciones extremas de vuelo.'}
                </p>
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-1">
                    <span className="font-black text-[#1A1817] text-xs block">Compatibilidad Universal</span>
                    <p className="text-[11px] text-[#8C827A]">
                      Apto para ensamblajes estándar en kits ARF, RTF y construcción en balsa o materiales compuestos.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-1">
                    <span className="font-black text-[#1A1817] text-xs block">Durabilidad Comprobada</span>
                    <p className="text-[11px] text-[#8C827A]">
                      Materiales de ingeniería resistentes a la fatiga mecánica y al combustible nitro/gasolina.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-3xl space-y-4">
                <h3 className="text-base font-black text-[#1A1817] mb-2">
                  Especificaciones Técnicas
                </h3>
                <table className="w-full border-collapse border border-[#E2DCD3] rounded-2xl overflow-hidden">
                  <tbody className="divide-y divide-[#E2DCD3]">
                    <tr className="bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-bold text-[#1A1817] w-1/3">Código SKU</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#D4A359]">{systemSku}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#1A1817]">Fabricante / Marca</td>
                      <td className="py-3 px-4 font-medium text-[#1A1817]">{product.brand || 'Dubro Products'}</td>
                    </tr>
                    <tr className="bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-bold text-[#1A1817]">Categoría</td>
                      <td className="py-3 px-4 font-medium text-[#1A1817]">{product.category?.name || 'Productos y Accesorios'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#1A1817]">Condición</td>
                      <td className="py-3 px-4 font-medium text-[#3E7B44] font-bold">Nuevo en Paquete Original</td>
                    </tr>
                    <tr className="bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-bold text-[#1A1817]">Disponibilidad en Bolivia</td>
                      <td className="py-3 px-4 font-medium text-[#1A1817]">Inmediata (Almacén Central La Paz)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4 max-w-4xl text-sm">
                <h3 className="text-base font-black text-[#1A1817]">
                  Envíos y Garantía en Territorio Boliviano
                </h3>
                <p>
                  En <strong>Hobby Bolivia</strong> cuidamos cada envío con embalaje reforzado para asegurar que tus productos y componentes lleguen en perfecto estado:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs">
                  <li><strong>Entregas en La Paz:</strong> Entrega el mismo día o al día siguiente en almacén central o por motomensajería coordinada.</li>
                  <li><strong>Envíos Nacionales:</strong> Despachos diarios a Santa Cruz, Cochabamba, Sucre, Oruro, Potosí, Tarija, Trinidad y Cobija a través de empresas de transporte terrestre y encomienda aérea.</li>
                  <li><strong>Confirmación por WhatsApp:</strong> Al realizar tu cotización recibirás la foto del paquete y la guía de despacho directamente en tu celular.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ================= PRODUCTOS RELACIONADOS ================= */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-[#E2DCD3] pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
                  Catálogo Complementario
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#1A1817]">
                  Productos y Accesorios Relacionados
                </h2>
              </div>
              <Link
                href="/#catalogo"
                className="text-xs font-bold text-[#1A1817] hover:text-[#D4A359] transition-colors flex items-center gap-1"
              >
                <span>Ver todo el catálogo</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  exchangeRate={exchangeRate}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <Footer config={config} products={relatedProducts} />
    </div>
  );
}

