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

const STANDARD_SIZE_ORDER: Record<string, number> = {
  'xxs': 1,
  'xs': 2,
  's': 3,
  'm': 4,
  'l': 5,
  'xl': 6,
  '2xl': 7,
  'xxl': 7,
  '3xl': 8,
  'xxxl': 8,
  '4xl': 9,
  'xxxxl': 9,
  '5xl': 10,
  '6xl': 11,
}

// Sort product variants intelligently (Numbers: 13, 13.5, 14... | Sizes: S, M, L, XL, XXL... | Alphanumeric A-Z)
export function sortVariants<T extends { name: string }>(variants: T[]): T[] {
  if (!variants || variants.length <= 1) return variants || []

  return [...variants].sort((a, b) => {
    const cleanA = (a.name || '').trim().toLowerCase().replace(',', '.')
    const cleanB = (b.name || '').trim().toLowerCase().replace(',', '.')

    const isNumA = !isNaN(Number(cleanA)) && cleanA !== ''
    const isNumB = !isNaN(Number(cleanB)) && cleanB !== ''

    // 1. Both are numeric (e.g. 13, 13.5, 14, 14.5, 15, 15.5, 16)
    if (isNumA && isNumB) {
      return Number(cleanA) - Number(cleanB)
    }

    // 2. Both are standard apparel sizes (e.g. S, M, L, XL, XXL)
    const apparelRankA = STANDARD_SIZE_ORDER[cleanA]
    const apparelRankB = STANDARD_SIZE_ORDER[cleanB]

    if (apparelRankA !== undefined && apparelRankB !== undefined) {
      return apparelRankA - apparelRankB
    }

    // Apparel size vs non-apparel size
    if (apparelRankA !== undefined && apparelRankB === undefined) return -1
    if (apparelRankA === undefined && apparelRankB !== undefined) return 1

    // Numeric vs non-numeric
    if (isNumA && !isNumB) return -1
    if (!isNumA && isNumB) return 1

    // 3. Fallback: Natural alphanumeric sort (A-Z, 1-9)
    return (a.name || '').localeCompare(b.name || '', undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  })
}
