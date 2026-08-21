'use client'

import Link from 'next/link'
import { Eye, Printer, MessageCircle, Trash2 } from 'lucide-react'

interface OrderRowActionsProps {
  order: any
  waUrl?: string
  onDeleteClick?: () => void
}

export default function OrderRowActions({ order, waUrl, onDeleteClick }: OrderRowActionsProps) {
  const isDelivery = order.fulfillment_method === 'DELIVERY'
  
  // Build WA URL if not provided explicitly
  let finalWaUrl = waUrl
  if (!finalWaUrl && order.whatsapp) {
    let cleaned = (order.whatsapp || '').replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1)
    }
    const text = encodeURIComponent(`Halo Kak ${order.full_name}, mengenai pesanan ${order.order_number} Gontor 100 Tahun...`)
    finalWaUrl = `https://wa.me/${cleaned}?text=${text}`
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* 1. Print Sticker Icon (If Delivery) */}
      {isDelivery && (
        <a
          href={`/admin/delivery/print?ids=${order.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors text-white shadow-2xs hover:opacity-90 flex-shrink-0"
          style={{ background: 'var(--gontor-green, #063D2E)' }}
          title="Cetak Stiker Pengiriman A5"
        >
          <Printer className="w-4 h-4" style={{ color: 'var(--gontor-gold, #D4AF37)' }} />
        </a>
      )}

      {/* 2. WA Chat Icon */}
      {finalWaUrl && (
        <a
          href={finalWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors border border-green-200/60 flex-shrink-0"
          title="Chat WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
      )}

      {/* 3. Delete Button */}
      {onDeleteClick && (
        <button
          onClick={onDeleteClick}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200/60 flex-shrink-0"
          title="Hapus Pesanan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* 4. Detail Button */}
      <Link
        href={`/admin/orders/${order.order_number}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors flex-shrink-0"
      >
        <Eye className="w-3.5 h-3.5 text-gray-600" />
        Detail
      </Link>
    </div>
  )
}

