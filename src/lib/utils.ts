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

