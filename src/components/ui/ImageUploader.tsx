'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Link as LinkIcon, X, Check, Loader2, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  recommendedSize?: string;
  className?: string;
}

export function ImageUploader({
  value = '',
  onChange,
  label = 'Fotografía del Producto',
  recommendedSize = 'Solo se pueden subir imágenes en formato PNG y JPG hasta 3 megas',
  className = ''
}: ImageUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB (3 * 1024 * 1024 bytes)
  const RESTRICTION_ERROR = 'Solo se permiten imágenes en formato PNG o JPG de hasta 3MB';
  const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];
  const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

  const handleFile = async (file: File) => {
    if (!file) return;

    const fileName = file.name || '';
    const fileExt = fileName.includes('.')
      ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
      : '';

    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtValid = ALLOWED_EXTENSIONS.includes(fileExt);

    if ((!isMimeValid && !isExtValid) || file.size > MAX_FILE_SIZE || file.size <= 0) {
      setUploadError(RESTRICTION_ERROR);
      alert(RESTRICTION_ERROR);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.error || RESTRICTION_ERROR;
        throw new Error(errorMsg);
      }

      onChange(data.url);
      setUrlInput(data.url);
      setIsEditing(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al subir la imagen';
      setUploadError(errorMsg);
      alert(errorMsg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleUrlSubmit = (newUrl: string) => {
    setUrlInput(newUrl);
    onChange(newUrl.trim());
    if (newUrl.trim()) {
      setIsEditing(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUrlInput('');
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header Label and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D4A359]" />
          <span>{label}</span>
        </label>

        {(!value || isEditing) && (
          <div className="inline-flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E2DCD3] shrink-0">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                mode === 'upload'
                  ? 'bg-white text-[#1A1817] shadow-xs border border-[#E2DCD3]'
                  : 'text-[#8C827A] hover:text-[#1A1817]'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Subir de PC</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                mode === 'url'
                  ? 'bg-white text-[#1A1817] shadow-xs border border-[#E2DCD3]'
                  : 'text-[#8C827A] hover:text-[#1A1817]'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Pegar Enlace</span>
            </button>
          </div>
        )}
      </div>

      {/* When Image Exists and Not in Editing Mode: Show Clean Active Card */}
      {value && !isEditing ? (
        <div className="bg-white border border-[#E2DCD3] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 transition-all shadow-xs">
          {/* Thumbnail Box */}
          <div className="relative aspect-square w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3] p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp';
              }}
            />
          </div>

          {/* Details & Info */}
          <div className="flex-1 space-y-1.5 min-w-0 text-center sm:text-left w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3E7B44]/15 border border-[#3E7B44]/30 text-[#1E4D2B] text-[10px] font-black uppercase tracking-wider">
                <Check className="w-3 h-3 text-[#3E7B44]" />
                Imagen Configurada
              </span>
              <span className="text-[11px] font-mono text-[#8C827A] truncate max-w-[200px]" title={value}>
                {value.startsWith('/uploads') ? value.replace('/uploads/', '') : value.startsWith('http') ? 'Enlace Web' : value}
              </span>
            </div>

            <p className="text-[11px] text-[#8C827A] line-clamp-1">
              {recommendedSize}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-[#D4A359]" />
                <span>Cambiar Imagen</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 font-bold text-xs border border-[#E2DCD3] hover:border-red-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Quitar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Full-width Upload / URL Input Zone */
        <div className="space-y-2">
          {mode === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[145px] bg-[#FAF8F5] hover:bg-white ${
                dragActive
                  ? 'border-[#D4A359] bg-[#D4A359]/10 scale-[0.99]'
                  : 'border-[#E2DCD3] hover:border-[#D4A359]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {uploading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-2">
                  <Loader2 className="w-7 h-7 text-[#D4A359] animate-spin" />
                  <span className="text-xs font-black text-[#1A1817]">Subiendo imagen a la web...</span>
                  <span className="text-[11px] text-[#8C827A]">Guardando en public/uploads/</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-white border border-[#E2DCD3] flex items-center justify-center text-[#D4A359] shadow-xs group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1A1817] hover:text-[#D4A359] transition-colors block">
                      Haz clic para buscar o arrastra una foto aquí
                    </span>
                    <span className="text-[11px] text-[#8C827A] font-medium block mt-0.5">
                      Solo formato PNG y JPG hasta 3 megas
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 border border-[#E2DCD3] rounded-2xl p-4 bg-[#FAF8F5] min-h-[145px] flex flex-col justify-center">
              <label className="text-xs font-black text-[#1A1817] block">
                Pega el enlace o URL directa de la imagen:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://ejemplo.com/foto-producto.webp"
                  value={urlInput}
                  onChange={(e) => handleUrlSubmit(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs font-medium bg-white border border-[#E2DCD3] rounded-xl outline-none focus:border-[#D4A359] focus:ring-2 focus:ring-[#D4A359]/20 text-[#1A1817]"
                />
                <button
                  type="button"
                  onClick={() => handleUrlSubmit(urlInput)}
                  className="px-4 py-2 bg-[#161311] hover:bg-[#D4A359] text-white hover:text-[#161311] text-xs font-black rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Aplicar
                </button>
              </div>
              <span className="text-[11px] text-[#8C827A]">
                Puedes usar enlaces de catálogo web o almacenamiento en la nube.
              </span>
            </div>
          )}

          {uploadError && (
            <p className="text-xs font-bold text-red-600 mt-1.5 flex items-center gap-1">
              <span>✕</span> {uploadError}
            </p>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#8C827A] mt-1.5">
            <span>{recommendedSize}</span>
            {value && isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-[#8C827A] hover:text-[#1A1817] underline cursor-pointer"
              >
                Cancelar y mantener foto actual
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
