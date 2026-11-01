'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Database,
  CheckCircle2,
  Loader2,
  Package,
  Layers,
  DollarSign,
  AlertCircle,
  Eye,
  X,
  RefreshCw,
  Search,
  Image as ImageIcon,
  FolderArchive
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProductItem {
  id: number;
  sku: string;
  name: string;
  title?: string;
  category_id?: number;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  brand?: string;
  scale?: string;
  material?: string;
  specs_line?: string;
  compatible_models?: string;
  price: number;
  priceUsd?: number;
  price_usd?: number;
  stock: number;
  stockQuantity?: number;
  imageUrl?: string | null;
  image_url?: string | null;
  images?: string[];
  isActive?: boolean;
  is_active?: boolean;
  badge?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export function CatalogBackupExportModule() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(12.01);
  const [loading, setLoading] = useState(true);
  const [exportingImages, setExportingImages] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printSearch, setPrintSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      // 1. Cargar productos (incluyendo inactivos para un respaldo 100% fiel)
      const res = await fetch('/api/products?includeInactive=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }

      // 2. Cargar categorías
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      if (catData.success && Array.isArray(catData.data)) {
        setCategories(catData.data);
      }

      // 3. Cargar tipo de cambio
      const rateRes = await fetch('/api/exchange-rate');
      const rateData = await rateRes.json();
      if (rateData.success && rateData.data?.usdToBobRate) {
        setExchangeRate(Number(rateData.data.usdToBobRate));
      }
    } catch (err) {
      console.error('Error al cargar datos del catálogo para exportación:', err);
      showToast('Error al conectar con la base de datos de productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  // Métricas rápidas
  const totalItems = products.length;
  const inStockItems = products.filter(p => (p.stock ?? p.stockQuantity ?? 0) > 0).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock ?? p.stockQuantity ?? 0), 0);
  const totalValueUsd = products.reduce((acc, p) => {
    const usd = p.priceUsd ?? p.price_usd ?? (p.price / exchangeRate);
    const qty = p.stock ?? p.stockQuantity ?? 0;
    return acc + (usd * qty);
  }, 0);

  // Helper para resolver imagen
  const getProductImage = (p: ProductItem): string => {
    return p.imageUrl || p.image_url || (p.images && p.images[0]) || '';
  };

  // Helper para resolver categoría
  const getProductCategory = (p: ProductItem): string => {
    if (p.category && p.category.name) return p.category.name;
    const catId = p.category_id || p.categoryId;
    const found = categories.find(c => c.id === catId);
    return found ? found.name : 'General / Productos';
  };

  // =========================================================================
  // EXPORTAR PAQUETE COMPLETO DE IMÁGENES (.zip)
  // =========================================================================
  const handleExportImages = async () => {
    setExportingImages(true);
    try {
      showToast('Preparando y comprimiendo todas las imágenes del catálogo...');
      const res = await fetch('/api/admin/backup/images');
      if (!res.ok) {
        throw new Error(`Error en el servidor al generar archivo ZIP (${res.status})`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `Hobby_Bolivia_Respaldo_Imagenes_${today}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('¡Respaldo de imágenes descargado exitosamente en archivo ZIP!');
    } catch (err: any) {
      console.error('Error descargando respaldo de imágenes:', err);
      showToast(err?.message || 'Error al descargar el paquete de imágenes', 'error');
    } finally {
      setExportingImages(false);
    }
  };

  // =========================================================================
  // EXPORTAR A EXCEL (.xlsx)
  // =========================================================================
  const handleExportExcel = async () => {
    if (products.length === 0) {
      showToast('No hay productos cargados para exportar', 'error');
      return;
    }

    setExportingExcel(true);
    try {
      const today = new Date().toISOString().slice(0, 10);

      // 1. Mapear filas con todas las columnas técnicas y comerciales
      const rows = products.map((p, index) => {
        const usdPrice = Number((p.priceUsd ?? p.price_usd ?? (p.price / exchangeRate)).toFixed(2));
        const bobPrice = Number((p.price ?? (usdPrice * exchangeRate)).toFixed(2));
        const stockUnits = p.stock ?? p.stockQuantity ?? 0;
        const imgPath = getProductImage(p);
        const fullImgUrl = imgPath ? `https://hobbybolivia.com${imgPath.startsWith('/') ? '' : '/'}${imgPath}` : 'Sin imagen';

        return {
          'N°': index + 1,
          'SKU / CÓDIGO': p.sku || `HB-${String(p.id).padStart(4, '0')}`,
          'NOMBRE DEL PRODUCTO': p.name || p.title || 'Sin nombre',
          'CATEGORÍA': getProductCategory(p),
          'MARCA': p.brand || 'Hobby Bolivia',
          'PRECIO USD ($)': usdPrice,
          'PRECIO Bs. (BOB)': bobPrice,
          'STOCK DISPONIBLE': stockUnits,
          'ESTADO': (p.isActive ?? p.is_active ?? true) ? 'ACTIVO' : 'INACTIVO',
          'DESTACADO / BADGE': p.badge || '-',
          'ESCALA DE MODELO': p.scale || 'RC Estándar',
          'MATERIAL': p.material || 'Compuesto',
          'ESPECIFICACIONES TÉCNICAS': p.specs_line || '-',
          'MODELOS COMPATIBLES': p.compatible_models || 'Modelos RC generales',
          'RUTA IMAGEN LOCAL': imgPath || 'Sin imagen',
          'ENLACE IMAGEN COMPLETO': fullImgUrl,
          'DESCRIPCIÓN DETALLADA': p.description || '-'
        };
      });

      // 2. Crear hoja de cálculo del catálogo
      const worksheet = XLSX.utils.json_to_sheet(rows);

      // 3. Configurar anchos óptimos de columna
      worksheet['!cols'] = [
        { wch: 6 },  // N°
        { wch: 16 }, // SKU
        { wch: 38 }, // Nombre
        { wch: 28 }, // Categoría
        { wch: 20 }, // Marca
        { wch: 15 }, // USD
        { wch: 15 }, // BOB
        { wch: 16 }, // Stock
        { wch: 12 }, // Estado
        { wch: 16 }, // Badge
        { wch: 22 }, // Escala
        { wch: 22 }, // Material
        { wch: 35 }, // Specs
        { wch: 35 }, // Compatibilidad
        { wch: 30 }, // Ruta local
        { wch: 45 }, // URL completa
        { wch: 50 }, // Descripción
      ];

      // 4. Crear hoja de resumen / auditoría de base de datos
      const summaryRows = [
        { 'PARÁMETRO': 'EMPRESA', 'VALOR': 'Hobby Bolivia' },
        { 'PARÁMETRO': 'DOMINIO OFICIAL', 'VALOR': 'https://hobbybolivia.com' },
        { 'PARÁMETRO': 'FECHA DE RESPALDO', 'VALOR': new Date().toLocaleString('es-BO') },
        { 'PARÁMETRO': 'TOTAL DE PRODUCTOS REGISTRADOS', 'VALOR': totalItems },
        { 'PARÁMETRO': 'PRODUCTOS CON STOCK ACTIVO', 'VALOR': inStockItems },
        { 'PARÁMETRO': 'TOTAL UNIDADES EN STOCK FÍSICO', 'VALOR': totalStockUnits },
        { 'PARÁMETRO': 'TIPO DE CAMBIO UTILIZADO', 'VALOR': `1 USD = Bs. ${exchangeRate.toFixed(4)}` },
        { 'PARÁMETRO': 'VALOR TOTAL INVENTARIO ESTIMADO (USD)', 'VALOR': `$ ${totalValueUsd.toFixed(2)} USD` },
        { 'PARÁMETRO': 'VALOR TOTAL INVENTARIO ESTIMADO (Bs.)', 'VALOR': `Bs. ${(totalValueUsd * exchangeRate).toFixed(2)}` },
        { 'PARÁMETRO': 'TOTAL DE CATEGORÍAS EN CATÁLOGO', 'VALOR': categories.length },
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
      summarySheet['!cols'] = [{ wch: 35 }, { wch: 45 }];

      // 5. Ensamblar libro de Excel
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Catálogo Completo');
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen de Inventario');

      // 6. Descargar archivo
      const fileName = `Hobby_Bolivia_Respaldo_Catalogo_${today}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      showToast(`Catálogo exportado exitosamente: ${fileName}`);
    } catch (err) {
      console.error('Error generando archivo Excel:', err);
      showToast('Ocurrió un error al generar el archivo Excel', 'error');
    } finally {
      setExportingExcel(false);
    }
  };

  // =========================================================================
  // EXPORTAR A PDF OFICIAL (.pdf vía jsPDF + autoTable)
  // =========================================================================
  const handleExportPdf = async () => {
    if (products.length === 0) {
      showToast('No hay productos cargados para exportar', 'error');
      return;
    }

    setExportingPdf(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'letter'
      });

      // Encabezado corporativo Hobby Bolivia
      doc.setFillColor(22, 19, 17); // #161311
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 55, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(212, 163, 89); // #D4A359
      doc.text('HOBBY BOLIVIA', 35, 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(250, 248, 245);
      doc.text('Catálogo Oficial de Productos y Componentes de Aeromodelismo', 35, 42);

      const dateStr = `Fecha: ${new Date().toLocaleDateString('es-BO')} | T.C.: Bs. ${exchangeRate.toFixed(2)}`;
      doc.setFontSize(9);
      doc.setTextColor(212, 163, 89);
      doc.text(dateStr, doc.internal.pageSize.getWidth() - 35, 33, { align: 'right' });

      // Preparar filas para autoTable
      const tableHead = [
        ['N°', 'SKU', 'Nombre del Producto', 'Categoría', 'Marca', 'Precio USD', 'Precio Bs.', 'Stock', 'Ruta Imagen']
      ];

      const tableBody = products.map((p, index) => {
        const usdPrice = (p.priceUsd ?? p.price_usd ?? (p.price / exchangeRate)).toFixed(2);
        const bobPrice = (p.price ?? (Number(usdPrice) * exchangeRate)).toFixed(2);
        const imgPath = getProductImage(p);

        return [
          String(index + 1),
          p.sku || `HB-${String(p.id).padStart(4, '0')}`,
          p.name || p.title || 'Sin nombre',
          getProductCategory(p),
          p.brand || 'Hobby Bolivia',
          `$${usdPrice}`,
          `Bs. ${bobPrice}`,
          String(p.stock ?? p.stockQuantity ?? 0),
          imgPath || 'Sin imagen'
        ];
      });

      autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 68,
        theme: 'grid',
        headStyles: {
          fillColor: [22, 19, 17],
          textColor: [212, 163, 89],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 3.5,
          textColor: [26, 24, 23],
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' }, // N°
          1: { cellWidth: 70, fontStyle: 'bold' }, // SKU
          2: { cellWidth: 160 }, // Nombre
          3: { cellWidth: 120 }, // Categoría
          4: { cellWidth: 75 }, // Marca
          5: { cellWidth: 55, halign: 'right' }, // USD
          6: { cellWidth: 55, halign: 'right' }, // BOB
          7: { cellWidth: 40, halign: 'center' }, // Stock
          8: { cellWidth: 130 } // Imagen
        },
        alternateRowStyles: {
          fillColor: [250, 248, 245]
        },
        margin: { top: 68, bottom: 35, left: 25, right: 25 },
        didDrawPage: (data) => {
          // Pie de página
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(140, 130, 122);
          doc.text(
            `Hobby Bolivia · hobbybolivia.com · Página ${data.pageNumber} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 15,
            { align: 'center' }
          );
        }
      });

      const fileName = `Hobby_Bolivia_Catalogo_Oficial_${today}.pdf`;
      doc.save(fileName);
      showToast(`Documento PDF generado exitosamente: ${fileName}`);
    } catch (err) {
      console.error('Error generando archivo PDF:', err);
      showToast('Ocurrió un error al generar el archivo PDF', 'error');
    } finally {
      setExportingPdf(false);
    }
  };

  // =========================================================================
  // EXPORTAR RESPALDO JSON DE BASE DE DATOS
  // =========================================================================
  const handleExportJson = () => {
    if (products.length === 0) {
      showToast('No hay datos disponibles para respaldar', 'error');
      return;
    }

    setExportingJson(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const backupPayload = {
        metadata: {
          company: 'Hobby Bolivia',
          domain: 'https://hobbybolivia.com',
          exportedAt: new Date().toISOString(),
          totalProducts: products.length,
          totalCategories: categories.length,
          exchangeRate: exchangeRate,
          version: '1.0'
        },
        categories,
        products
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Hobby_Bolivia_Respaldo_Base_Datos_${today}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Respaldo JSON descargado correctamente');
    } catch (err) {
      console.error('Error generando respaldo JSON:', err);
      showToast('Error al generar respaldo JSON', 'error');
    } finally {
      setExportingJson(false);
    }
  };

  // Filtrado para la vista imprimible
  const filteredPrintProducts = products.filter(p => {
    if (!printSearch.trim()) return true;
    const term = printSearch.toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const name = (p.name || p.title || '').toLowerCase();
    const cat = getProductCategory(p).toLowerCase();
    return sku.includes(term) || name.includes(term) || cat.includes(term);
  });

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 border ${
            toastMessage.type === 'success'
              ? 'bg-[#161311] text-[#FAF8F5] border-[#D4A359]'
              : 'bg-rose-950 text-white border-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#D4A359]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Module Card */}
      <section className="bg-white rounded-3xl border border-[#E2DCD3] shadow-xs overflow-hidden transition-all">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#161311] via-[#211E1C] to-[#161311] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4A359]/30">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D4A359] animate-pulse" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#D4A359]">
                Superadmin Data Management · Respaldo Seguro
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Database className="w-6 h-6 text-[#D4A359]" />
              <span>Módulo de Respaldo y Exportación del Catálogo</span>
            </h2>
            <p className="text-xs text-[#E2DCD3]/80 mt-1 max-w-2xl leading-relaxed">
              Exporta el inventario completo con todas sus imágenes, códigos SKU oficiales, precios en USD/Bs., stock físico y especificaciones técnicas para archivo o auditoría comercial.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchCatalogData}
              disabled={loading}
              title="Refrescar catálogo desde la base de datos"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#D4A359] border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E2DCD3]">
          <div className="p-3 bg-white rounded-2xl border border-[#E2DCD3] shadow-2xs">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#8C827A] mb-1">
              <Package className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Total Productos</span>
            </div>
            <div className="text-lg font-black text-[#1A1817]">
              {loading ? '...' : totalItems}
              <span className="text-[10px] text-[#8C827A] font-medium ml-1">ítems</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-[#E2DCD3] shadow-2xs">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#8C827A] mb-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Fotos en Catálogo</span>
            </div>
            <div className="text-lg font-black text-[#1A1817]">
              {loading ? '...' : products.filter(p => Boolean(p.imageUrl || p.image_url)).length}
              <span className="text-[10px] text-[#8C827A] font-medium ml-1">con foto</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-[#E2DCD3] shadow-2xs">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#8C827A] mb-1">
              <Layers className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Stock Físico Total</span>
            </div>
            <div className="text-lg font-black text-[#1A1817]">
              {loading ? '...' : totalStockUnits}
              <span className="text-[10px] text-[#8C827A] font-medium ml-1">unidades</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-[#E2DCD3] shadow-2xs">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#8C827A] mb-1">
              <DollarSign className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Valor Inventario</span>
            </div>
            <div className="text-lg font-black text-[#1A1817]">
              {loading ? '...' : `$${totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              <span className="text-[10px] text-[#8C827A] font-medium ml-1">USD</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-[#E2DCD3] shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#8C827A] mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Tipo de Cambio</span>
            </div>
            <div className="text-lg font-black text-emerald-700 font-mono">
              Bs. {exchangeRate.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card 1: Respaldo de Imágenes (.zip) */}
          <div className="p-4 rounded-2xl bg-white border-2 border-[#D4A359]/70 hover:border-[#D4A359] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4A359] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-[#D4A359]/40">
                <FolderArchive className="w-5 h-5 text-[#B88738]" />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-[#211E1C] text-[#D4A359] text-[9px] font-black uppercase tracking-wider">
                  NUEVO
                </span>
                <h3 className="font-extrabold text-sm text-[#1A1817]">
                  Respaldo de Imágenes (.zip)
                </h3>
              </div>
              <p className="text-xs text-[#5C5650] leading-relaxed mb-4">
                Descarga un paquete ZIP con todas las fotografías de productos del catálogo, índice CSV de correspondencia y manifiesto técnico.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportImages}
              disabled={exportingImages || loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#D4A359] hover:bg-[#C2934A] text-[#161311] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {exportingImages ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#161311]" />
                  <span>Empaquetando...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#161311]" />
                  <span>Descargar Imágenes (.zip)</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Excel Export */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] hover:border-[#D4A359] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1A1817] mb-1">
                Exportar a Excel (.xlsx)
              </h3>
              <p className="text-xs text-[#5C5650] leading-relaxed mb-4">
                Genera una hoja de cálculo con todas las columnas de producto, rutas de imagen, fórmulas y resumen de inventario.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exportingExcel || loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {exportingExcel ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando Excel...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar Excel (.xlsx)</span>
                </>
              )}
            </button>
          </div>

          {/* Card 3: PDF Document Export */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] hover:border-[#D4A359] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1A1817] mb-1">
                Documento PDF Oficial (.pdf)
              </h3>
              <p className="text-xs text-[#5C5650] leading-relaxed mb-4">
                Genera un PDF horizontal con tablas estilizadas, membrete de Hobby Bolivia, precios oficiales y rutas de fotos.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf || loading}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {exportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF (.pdf)</span>
                </>
              )}
            </button>
          </div>

          {/* Card 4: Interactive Printable Catalog with Photos */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] hover:border-[#D4A359] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-[#D4A359]/40">
                <Printer className="w-5 h-5 text-[#D4A359]" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1A1817] mb-1">
                Catálogo Imprimible con Fotos
              </h3>
              <p className="text-xs text-[#5C5650] leading-relaxed mb-4">
                Abre una vista previa con todas las imágenes cargadas en miniatura para imprimir o guardar en PDF desde el navegador.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#161311] hover:bg-[#211E1C] text-[#D4A359] font-bold text-xs flex items-center justify-center gap-2 shadow-sm border border-[#D4A359]/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Eye className="w-4 h-4 text-[#D4A359]" />
              <span>Ver Catálogo con Fotos</span>
            </button>
          </div>

          {/* Card 5: Full JSON Database Snapshot */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] hover:border-[#D4A359] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1A1817] mb-1">
                Respaldo Completo (JSON)
              </h3>
              <p className="text-xs text-[#5C5650] leading-relaxed mb-4">
                Copia de seguridad en formato JSON estructurado con todos los campos, relaciones de categoría y metadatos del catálogo.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportJson}
              disabled={exportingJson || loading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {exportingJson ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparando JSON...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar JSON (.json)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* MODAL: VISTA PREVIA IMPRIMIBLE CON FOTOS Y FORMATO OFICIAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#D4A359]/40 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#161311] text-white flex items-center justify-between gap-4 border-b border-[#D4A359]/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#211E1C] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359]">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">
                    Vista Imprimible del Catálogo con Fotos ({filteredPrintProducts.length} productos)
                  </h3>
                  <p className="text-[11px] text-[#E2DCD3]/70">
                    Diseñado para imprimir en tamaño carta / A4 o guardar como PDF con imágenes en alta calidad.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar como PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Sub-bar */}
            <div className="p-3 bg-[#FAF8F5] border-b border-[#E2DCD3] flex items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C827A]" />
                <input
                  type="text"
                  placeholder="Filtrar por SKU, nombre o categoría en esta vista..."
                  value={printSearch}
                  onChange={(e) => setPrintSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E2DCD3] rounded-xl text-xs text-[#1A1817] focus:border-[#D4A359] outline-none"
                />
              </div>

              <div className="text-[11px] text-[#8C827A] font-mono">
                Mostrando <strong className="text-[#1A1817]">{filteredPrintProducts.length}</strong> de {products.length} productos
              </div>
            </div>

            {/* Printable Content Area */}
            <div id="printable-catalog-container" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
              {/* Document Header (Visible en Impresión) */}
              <div className="pb-4 mb-5 border-b-2 border-[#161311] flex justify-between items-start">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#161311] tracking-tight">
                    HOBBY BOLIVIA
                  </h1>
                  <p className="text-xs font-semibold text-[#5C5650]">
                    Catálogo Oficial de Productos y Componentes para Aeromodelismo
                  </p>
                  <p className="text-[10px] text-[#8C827A] mt-0.5">
                    Sitio Oficial: https://hobbybolivia.com · WhatsApp: +591 77293446
                  </p>
                </div>
                <div className="text-right text-[11px] font-mono text-[#5C5650]">
                  <div><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-BO')}</div>
                  <div><strong>Tipo de Cambio:</strong> 1 USD = Bs. {exchangeRate.toFixed(2)}</div>
                  <div><strong>Total Productos:</strong> {filteredPrintProducts.length}</div>
                </div>
              </div>

              {/* Table with Thumbnails */}
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#161311] text-[#D4A359] text-[10px] font-black uppercase tracking-wider border-b border-[#161311]">
                    <th className="py-2.5 px-2 w-[4%] text-center">N°</th>
                    <th className="py-2.5 px-2.5 w-[11%]">SKU / Código</th>
                    <th className="py-2.5 px-2 w-[9%] text-center">Foto</th>
                    <th className="py-2.5 px-3 w-[26%]">Nombre del Producto</th>
                    <th className="py-2.5 px-2.5 w-[18%]">Categoría & Marca</th>
                    <th className="py-2.5 px-2.5 w-[11%] text-right">Precio USD</th>
                    <th className="py-2.5 px-2.5 w-[11%] text-right">Precio Bs.</th>
                    <th className="py-2.5 px-2 w-[10%] text-center">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DCD3]">
                  {filteredPrintProducts.map((p, idx) => {
                    const img = getProductImage(p);
                    const usdPrice = (p.priceUsd ?? p.price_usd ?? (p.price / exchangeRate)).toFixed(2);
                    const bobPrice = (p.price ?? (Number(usdPrice) * exchangeRate)).toFixed(2);
                    const stock = p.stock ?? p.stockQuantity ?? 0;

                    return (
                      <tr key={p.id || idx} className="hover:bg-[#FAF8F5] transition-colors break-inside-avoid">
                        <td className="py-2.5 px-2 text-center font-mono text-[11px] font-bold text-[#8C827A]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono font-black text-xs text-[#1A1817] whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#E2DCD3]">
                            {p.sku}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          {img ? (
                            <div className="w-12 h-12 mx-auto rounded-lg bg-white border border-[#E2DCD3] p-0.5 flex items-center justify-center overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt={p.name || p.sku}
                                className="max-w-full max-h-full object-contain"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 mx-auto rounded-lg bg-[#FAF8F5] border border-dashed border-[#E2DCD3] flex items-center justify-center text-[9px] text-[#8C827A] font-medium">
                              Sin foto
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-xs text-[#1A1817] leading-snug">
                            {p.name || p.title}
                          </div>
                          {p.specs_line && (
                            <div className="text-[10px] text-[#8C827A] mt-0.5 line-clamp-1">
                              {p.specs_line}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="font-semibold text-xs text-[#1A1817]">
                            {getProductCategory(p)}
                          </div>
                          <div className="text-[10px] text-[#8C827A]">
                            {p.brand || 'Hobby Bolivia'}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-xs text-[#1A1817] whitespace-nowrap">
                          ${usdPrice} USD
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-black text-xs text-[#D4A359] whitespace-nowrap">
                          Bs. {bobPrice}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                              stock > 0
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {stock} un.
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Document Footer (Visible en Impresión) */}
              <div className="mt-6 pt-4 border-t border-[#E2DCD3] text-center text-[10px] text-[#8C827A] flex justify-between items-center">
                <span>Hobby Bolivia · Productos Oficiales para Aviones RC</span>
                <span>Documento confidencial generado por la administración</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

