import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: string | number): string {
  const digits = String(amount).replace(/\D/g, '')
  if (!digits) return '0 ₫'
  try {
    const numAmount = Number(digits) / 100000
    return numAmount.toLocaleString('vi-VN') + ' ₫'
  } catch {
    return Math.floor(Number(digits) / 100000).toLocaleString('vi-VN') + ' ₫'
  }
}

export function parseMoney(amount: string): number {
  const digits = String(amount).replace(/\D/g, '')
  return parseInt(digits) || 0
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}