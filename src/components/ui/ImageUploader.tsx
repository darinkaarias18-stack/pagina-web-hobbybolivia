'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Link as LinkIcon, X, Check, Loader2, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onUploadSuccess?: (url: string) => void;
  label?: string;
  recommendedSize?: string;
  className?: string;
}

export function ImageUploader({
  value = '',
  onChange,
  onUploadSuccess,
  label = 'Fotografía del Producto',
  recommendedSize = 'Compresión automática a WebP · Peso máx. 250 KB · Máx. 1000px',
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

  const MAX_DB_SIZE = 250 * 1024; // Límite estricto de 250 KB (256,000 bytes)
  const RESTRICTION_ERROR = 'Solo se permiten imágenes en formato PNG, JPG, WebP o SVG (máx. 250 KB tras compresión)';
  const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

  const compressImageClient = (file: File, maxBytes = MAX_DB_SIZE): Promise<File> => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        resolve(file);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1000; // Máximo 1000px manteniendo proporción

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const attempt = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              if (blob.size <= maxBytes || quality <= 0.35) {
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                resolve(
                  new File([blob], `${baseName}.webp`, {
                    type: 'image/webp',
                    lastModified: Date.now()
                  })
                );
              } else {
                quality -= 0.12;
                attempt();
              }
            },
            'image/webp',
            quality
          );
        };
        attempt();
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    const fileName = file.name || '';
    const fileExt = fileName.includes('.')
      ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
      : '';

    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtValid = ALLOWED_EXTENSIONS.includes(fileExt);

    if ((!isMimeValid && !isExtValid) || file.size <= 0) {
      setUploadError(RESTRICTION_ERROR);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const compressedFile = await compressImageClient(file, MAX_DB_SIZE);
      const formData = new FormData();
      formData.append('file', compressedFile);

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
      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }
      setUrlInput(data.url);
      setIsEditing(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al subir la imagen';
      setUploadError(errorMsg);
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

  const handleUrlSubmit = (newUrl: string, closeEditor = false) => {
    setUrlInput(newUrl);
    onChange(newUrl.trim());
    if (closeEditor && newUrl.trim()) {
      if (onUploadSuccess) {
        onUploadSuccess(newUrl.trim());
      }
      setIsEditing(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (onUploadSuccess) {
      onUploadSuccess('');
    }
    setUrlInput('');
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input de archivo global siempre montado para permitir abrir el selector en 1 clic */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

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
              className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${mode === 'upload'
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
              className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${mode === 'url'
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
          <div
            onClick={() => fileInputRef.current?.click()}
            title="Haz clic para subir una nueva imagen desde tu PC"
            className="relative aspect-square w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3] p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs group cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-7 h-7 text-[#D4A359] animate-spin" />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={value}
                alt={label}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/placeholder.webp';
                }}
              />
            )}
          </div>

          {/* Details & Info */}
          <div className="flex-1 space-y-1.5 min-w-0 text-center sm:text-left w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3E7B44]/15 border border-[#3E7B44]/30 text-[#1E4D2B] text-[10px] font-black uppercase tracking-wider">
                <Check className="w-3 h-3 text-[#3E7B44]" />
                Imagen Configurada
              </span>
              <span className="text-[11px] font-mono text-[#8C827A] truncate max-w-[240px]" title={value}>
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
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-[#161311] hover:bg-[#D4A359] text-white hover:text-[#161311] font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-[#D4A359] group-hover:text-[#161311]" />
                )}
                <span>{uploading ? 'Subiendo...' : 'Subir Nuevo desde PC'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('url');
                  setIsEditing(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-[#D4A359]" />
                <span>Cambiar por URL / Arrastrar</span>
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
              className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[145px] bg-[#FAF8F5] hover:bg-white ${dragActive
                ? 'border-[#D4A359] bg-[#D4A359]/10 scale-[0.99]'
                : 'border-[#E2DCD3] hover:border-[#D4A359]'
                }`}
            >
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
                      Haz clic para buscar o arrastra tu archivo aquí
                    </span>
                    <span className="text-[11px] text-[#8C827A] font-medium block mt-0.5">
                      Formatos soportados: PNG, JPG, WebP o SVG
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
                  placeholder="https://ejemplo.com/mi-logo.png"
                  value={urlInput}
                  onChange={(e) => handleUrlSubmit(e.target.value, false)}
                  className="flex-1 px-3.5 py-2 text-xs font-medium bg-white border border-[#E2DCD3] rounded-xl outline-none focus:border-[#D4A359] focus:ring-2 focus:ring-[#D4A359]/20 text-[#1A1817]"
                />
                <button
                  type="button"
                  onClick={() => handleUrlSubmit(urlInput, true)}
                  className="px-4 py-2 bg-[#161311] hover:bg-[#D4A359] text-white hover:text-[#161311] text-xs font-black rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Aplicar
                </button>
              </div>
              <span className="text-[11px] text-[#8C827A]">
                Puedes usar enlaces de imágenes alojadas en la web o rutas locales.
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
