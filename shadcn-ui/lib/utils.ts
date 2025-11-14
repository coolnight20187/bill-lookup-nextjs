import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(value: string | number): string {
  const digits = (value ?? '').toString().replace(/\D/g, '')
  if (!digits) return '0 ₫'
  
  try {
    const amount = Math.floor(Number(digits) / 100000)
    return amount.toLocaleString('vi-VN') + ' ₫'
  } catch {
    return '0 ₫'
  }
}

export function formatDate(isoString: string): string {
  if (!isoString) return ''
  
  try {
    const date = new Date(isoString)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return isoString
  }
}

export function parseMoney(value: string | number): number {
  const digits = (value ?? '').toString().replace(/\D/g, '')
  return parseInt(digits, 10) || 0
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    })
  } finally {
    clearTimeout(id)
  }
}