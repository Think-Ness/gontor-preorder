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
    <>
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/orders/${order.order_number}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-gray-600" />
          Detail
        </Link>

        {isDelivery && (
          <button
            type="button"
            onClick={() => setIsStickerOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors text-white shadow-2xs"
            style={{ background: 'var(--gontor-green, #063D2E)' }}
            title="Cetak / Export Stiker Pengiriman A6"
          >
            <Tag className="w-3.5 h-3.5" style={{ color: 'var(--gontor-gold, #D4AF37)' }} />
            Stiker Paket
          </button>
        )}
      </div>

      <ShippingLabelModal
        order={order}
        isOpen={isStickerOpen}
        onClose={() => setIsStickerOpen(false)}
      />
    </>
  )
}
