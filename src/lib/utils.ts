import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string | null | undefined, currency: string = "$us"): string {
  if (amount === null || amount === undefined) return `${currency} 0.00`;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${currency} ${num.toFixed(2)}`;
}

/**
 * Sanitiza texto de entrada del usuario contra ataques Stored XSS e inyecciones de código.
 * Remueve etiquetas HTML, scripts, manejadores de eventos (onload/onerror) y recorta al tamaño máximo.
 */
export function sanitizeText(text: unknown, maxLength: number = 2000): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Remueve tags HTML
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remueve atributos on* (ej. onclick=, onerror=)
    .trim()
    .slice(0, maxLength);
}

