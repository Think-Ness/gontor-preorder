'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Tag, Printer } from 'lucide-react'
import ShippingLabelModal from './ShippingLabelModal'

interface OrderRowActionsProps {
  order: any
}

export default function OrderRowActions({ order }: OrderRowActionsProps) {
  const [isStickerOpen, setIsStickerOpen] = useState(false)

  const isDelivery = order.fulfillment_method === 'DELIVERY'

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/orders/${order.order_number}`}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
      >
        <Eye className="w-3.5 h-3.5 text-gray-600" />
        Detail
      </Link>

      {isDelivery && (
        <a
          href={`/admin/delivery/print?ids=${order.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors text-white shadow-2xs hover:opacity-90"
          style={{ background: 'var(--gontor-green, #063D2E)' }}
          title="Cetak Stiker Pengiriman A5"
        >
          <Printer className="w-3.5 h-3.5" style={{ color: 'var(--gontor-gold, #D4AF37)' }} />
          Stiker Paket
        </a>
      )}
    </div>
  )
}
