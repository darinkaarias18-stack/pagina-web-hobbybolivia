'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, X, Check, Loader2, RefreshCw } from 'lucide-react';

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
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Label & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <label className="text-xs font-bold text-[#162544] uppercase tracking-wide flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#e04f26]" />
          <span>{label}</span>
        </label>

        {/* Mode selector pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-white text-[#162544] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Subir de PC</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-white text-[#162544] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Pegar Enlace</span>
          </button>
        </div>
      </div>

      {/* Main Upload / URL Box with Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
        {/* Left: Input Zone */}
        <div className={value ? 'sm:col-span-8' : 'sm:col-span-12'}>
          {mode === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] bg-slate-50/60 hover:bg-slate-50 ${
                dragActive
                  ? 'border-[#e04f26] bg-[#e04f26]/5 scale-[0.99]'
                  : 'border-slate-300 hover:border-[#162544]'
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
                  <Loader2 className="w-7 h-7 text-[#e04f26] animate-spin" />
                  <span className="text-xs font-bold text-[#162544]">Subiendo imagen a la web...</span>
                  <span className="text-[11px] text-slate-500">Guardando en public/uploads/</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#e04f26] shadow-xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#162544] hover:underline block">
                      Haz clic para buscar o arrastra una foto aquí
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      Solo se pueden subir imágenes en formato PNG y JPG hasta 3 megas
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50 min-h-[140px] flex flex-col justify-center">
              <label className="text-xs font-bold text-slate-700 block">
                Pega el enlace o URL directa de la imagen:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://ejemplo.com/foto-producto.webp"
                  value={urlInput}
                  onChange={(e) => handleUrlSubmit(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
                />
                <button
                  type="button"
                  onClick={() => handleUrlSubmit(urlInput)}
                  className="px-3 py-2 bg-[#162544] hover:bg-[#1d2b53] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Aplicar
                </button>
              </div>
              <span className="text-[11px] text-slate-400">
                Puedes usar enlaces de tu proveedor o de catálogos web.
              </span>
            </div>
          )}

          {uploadError && (
            <p className="text-xs font-bold text-red-600 mt-1.5 flex items-center gap-1">
              <span>✕</span> {uploadError}
            </p>
          )}

          <span className="text-[11px] text-slate-400 block mt-1.5">
            {recommendedSize}
          </span>
        </div>

        {/* Right: Instant Preview Card */}
        {value && (
          <div className="sm:col-span-4 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-100">
              <span className="text-[10px] font-extrabold uppercase text-[#16a34a] tracking-wider flex items-center gap-1">
                <Check className="w-3 h-3" />
                Vista previa
              </span>
              <button
                type="button"
                onClick={handleRemove}
                title="Quitar fotografía"
                className="w-5 h-5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Image Preview Box */}
            <div className="relative aspect-square w-full rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Vista previa"
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp';
                }}
              />
            </div>

            {/* Quick action bar */}
            <div className="mt-2 flex items-center justify-between text-[11px] gap-1">
              <span className="truncate text-slate-400 font-mono text-[10px] max-w-[120px]">
                {value.startsWith('/uploads') ? value.replace('/uploads/', '') : 'Enlace web'}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (mode === 'upload') {
                    fileInputRef.current?.click();
                  } else {
                    const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                    input?.focus();
                  }
                }}
                className="text-[11px] font-bold text-[#e04f26] hover:underline flex items-center gap-0.5"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Cambiar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
