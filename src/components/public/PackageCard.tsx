'use client'

import Image from 'next/image'
import { Package, CartItem } from '@/types'
import { formatRupiah } from '@/lib/utils'
import { Plus, CheckCircle, PackageIcon, Tag } from 'lucide-react'
import { buildDriveImageUrl } from '@/lib/drive-urls'

interface PackageCardProps {
  pkg: Package
  onAdd: (item: Omit<CartItem, 'id'>) => void
  cartItems: CartItem[]
  isOpen: boolean
}

export default function PackageCard({ pkg, onAdd, cartItems, isOpen }: PackageCardProps) {
  let fileId = pkg.image_drive_file_id
  if (!fileId && pkg.image_url) {
    const match = pkg.image_url.match(/id=([^&]+)/)
    if (match) fileId = match[1]
  }

  const imageUrl = fileId
    ? buildDriveImageUrl(fileId)
    : pkg.image_url || null

  const qty = cartItems.filter(i => i.packageId === pkg.id).reduce((s, i) => s + i.quantity, 0)

  const handleAdd = () => {
    if (!isOpen) return
    onAdd({
      packageId: pkg.id,
      itemType: 'PACKAGE',
      name: pkg.name,
      unitPrice: pkg.price,
      quantity: 1,
      imageUrl,
    })
  }

  // Calculate "normal price" from items
  const normalPrice = pkg.items?.reduce((sum, item) => {
    const itemPrice = item.variant?.price ?? item.product?.price ?? 0
    return sum + itemPrice * item.quantity
  }, 0)

  const savings = normalPrice && normalPrice > pkg.price ? normalPrice - pkg.price : null

  return (
    <div className="card-premium flex flex-col overflow-hidden group border-2"
      style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
      {/* Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="btn-gold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
          <Tag className="w-3 h-3" />
          Paket Promo
        </span>
      </div>

      {/* Image */}
      <div className="relative aspect-video bg-amber-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={pkg.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
            <PackageIcon className="w-14 h-14 text-amber-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-gray-900 text-lg mb-1">{pkg.name}</h3>
        {pkg.description && <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>}

        {/* Package items list */}
        {pkg.items && pkg.items.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-gray-50 space-y-1.5">
            {pkg.items.map(item => (
              <div key={item.id} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>
                  {item.product?.name}
                  {item.variant ? ` — ${item.variant.name}` : ''}
                  {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pricing */}
        <div className="mb-4">
          {savings && savings > 0 && normalPrice ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-display font-black text-xl" style={{ color: 'var(--gontor-green)' }}>
                {formatRupiah(pkg.price)}
              </span>
              <span className="text-sm text-gray-400 line-through">{formatRupiah(normalPrice)}</span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Hemat {formatRupiah(savings)}
              </span>
            </div>
          ) : (
            <span className="font-display font-black text-xl" style={{ color: 'var(--gontor-green)' }}>
              {formatRupiah(pkg.price)}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto">
          {qty > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-display font-semibold">{qty}x dipilih</span>
              <button onClick={handleAdd} disabled={!isOpen} className="btn-gold px-4 py-2 text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!isOpen}
              className={`w-full py-3 rounded-lg font-display font-semibold flex items-center justify-center gap-2 text-sm ${
                isOpen ? 'btn-gold' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isOpen ? (
                <>
                  <Plus className="w-4 h-4" />
                  Pilih Paket Ini
                </>
              ) : (
                'Pre-order Tutup'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
