import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(value: string | number): string {
  const digits = (value ?? '').toString().replace(/\D/g, '');
  if (!digits) return '0 ₫';
  try {
    const amount = BigInt(digits) / 100000n;
    return amount.toLocaleString('vi-VN') + ' ₫';
  } catch {
    return Math.floor(Number(digits) / 100000)
      .toLocaleString('vi-VN') + ' ₫';
  }
}

export function formatDate(isoString: string | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('vi-VN', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch { 
    return isoString; 
  }
}

export function parseMoney(s: string | number): number {
  return parseInt((s + '').replace(/\D/g, ''), 10) || 0;
}