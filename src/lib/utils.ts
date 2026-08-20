import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format number only (for copy)
export function formatNumber(amount: number): string {
  return amount.toString()
}

// Normalize WhatsApp number to 08xx format
export function normalizeWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('62')) return '0' + cleaned.slice(2)
  if (cleaned.startsWith('+62')) return '0' + cleaned.slice(3)
  return cleaned
}

// Generate WhatsApp link
export function buildWhatsAppLink(phone: string, message?: string): string {
  const normalized = normalizeWhatsApp(phone).replace(/^0/, '62')
  const encoded = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${normalized}${encoded}`
}

// Get pre-order status
export function getPreorderStatus(
  settings: { preorder_start: string | null; preorder_end: string | null; is_active: boolean } | null
): 'SCHEDULED' | 'OPEN' | 'CLOSED' {
  if (!settings || !settings.is_active) return 'CLOSED'
  const now = new Date()
  const start = settings.preorder_start ? new Date(settings.preorder_start) : null
  const end = settings.preorder_end ? new Date(settings.preorder_end) : null
  if (start && now < start) return 'SCHEDULED'
  if (end && now > end) return 'CLOSED'
  return 'OPEN'
}

// Generate unique cart item ID
export function generateCartItemId(): string {
  return Math.random().toString(36).substring(2, 10)
}

// Generate checkout session ID
export function generateSessionId(): string {
  return crypto.randomUUID()
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Safe filename for Drive uploads
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}
