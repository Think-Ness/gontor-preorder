'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product, ProductVariant, CartItem } from '@/types'
import { formatRupiah } from '@/lib/utils'
import { Plus, Minus, ShoppingBag, AlertCircle, Award } from 'lucide-react'
import { buildDriveImageUrl } from '@/lib/drive-urls'

interface ProductCardProps {
  product: Product
  onAdd: (item: Omit<CartItem, 'id'>) => void
  cartItems: CartItem[]
  isOpen: boolean
  isTopTier?: boolean
}

export default function ProductCard({ product, onAdd, cartItems, isOpen, isTopTier }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  )

  let fileId = product.image_drive_file_id
  if (!fileId && product.image_url) {
    const match = product.image_url.match(/id=([^&]+)/)
    if (match) fileId = match[1]
  }

  const imageUrl = fileId
    ? buildDriveImageUrl(fileId)
    : product.image_url || null

  const activePrice = product.has_variants && selectedVariant
    ? selectedVariant.price
    : product.price

  const isOutOfStock = product.has_variants
    ? (selectedVariant?.stock !== null && selectedVariant?.stock !== undefined && selectedVariant.stock <= 0)
    : (product.stock_enabled && product.stock !== null && product.stock <= 0)

  const getCartQty = () => {
    const key = product.has_variants && selectedVariant ? selectedVariant.id : product.id
    return cartItems
      .filter(i => (product.has_variants ? i.variantId === key : i.productId === key))
      .reduce((s, i) => s + i.quantity, 0)
  }

  const qty = getCartQty()

  const maxStock = product.has_variants && selectedVariant
    ? selectedVariant.stock
    : (product.stock_enabled ? product.stock : null)

  const isMaxStockReached = maxStock !== null && maxStock !== undefined && qty >= maxStock

  const handleAdd = () => {
    if (!isOpen || isOutOfStock || isMaxStockReached) return

    if (product.has_variants && selectedVariant) {
      onAdd({
        productId: product.id,
        variantId: selectedVariant.id,
        itemType: 'VARIANT',
        name: product.name,
        variantName: selectedVariant.name,
        unitPrice: selectedVariant.price,
        quantity: 1,
        imageUrl,
        maxStock,
      })
    } else {
      onAdd({
        productId: product.id,
        itemType: 'PRODUCT',
        name: product.name,
        unitPrice: product.price,
        quantity: 1,
        imageUrl,
        maxStock,
      })
    }
  }

  return (
    <div className="card-premium flex flex-col overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {isTopTier && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md border border-amber-400 text-[10px] font-display font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3" />
              Terlaris
            </span>
          </div>
        )}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
            <ShoppingBag className="w-12 h-12 text-green-300" />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-display font-bold px-3 py-1 rounded-full">
              HABIS
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-gray-900 mb-1 text-xs sm:text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-[11px] sm:text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-2">{product.description}</p>
        )}

        {/* Price */}
        <div className="font-display font-bold mb-2 sm:mb-3 text-sm sm:text-base" style={{ color: 'var(--gontor-green)' }}>
          {formatRupiah(activePrice)}
        </div>

        {/* Variant selector */}
        {product.has_variants && product.variants && product.variants.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] sm:text-xs text-gray-500 mb-1.5 font-semibold">Ukuran</div>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.filter(v => v.is_active).map(variant => {
                const outOfStock = variant.stock !== null && variant.stock !== undefined && variant.stock <= 0
                return (
                  <button
                    key={variant.id}
                    onClick={() => !outOfStock && setSelectedVariant(variant)}
                    disabled={outOfStock}
                    className={`px-3 py-1.5 min-h-[36px] rounded text-xs font-display font-semibold border transition-all flex items-center justify-center ${
                      selectedVariant?.id === variant.id
                        ? 'border-green-600 bg-green-50 text-green-700 font-bold'
                        : outOfStock
                          ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                          : 'border-gray-200 hover:border-green-400 text-gray-600'
                    }`}
                  >
                    {variant.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Stock info */}
        {!product.has_variants && product.stock_enabled && product.stock !== null && (
          <div className="text-[11px] sm:text-xs text-gray-400 mb-3 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Stok: {product.stock} tersisa
          </div>
        )}

        {/* Add button */}
        <div className="mt-auto pt-1">
          {qty > 0 ? (
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[11px] sm:text-xs text-gray-500 font-display font-semibold truncate">
                {qty}x di cart
              </span>
              <button
                onClick={handleAdd}
                disabled={isOutOfStock || !isOpen || isMaxStockReached}
                className={`px-3 py-2.5 min-h-[40px] text-xs flex items-center gap-1 font-semibold rounded-lg shrink-0 ${
                  isMaxStockReached ? 'bg-gray-100 text-gray-400 cursor-not-allowed border' : 'btn-primary'
                }`}
              >
                {isMaxStockReached ? 'Stok Maksimal' : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock || !isOpen}
              className={`w-full py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-display font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isOutOfStock || !isOpen
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isOutOfStock ? (
                'Tidak Tersedia'
              ) : !isOpen ? (
                'Pre-order Tutup'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Keranjang</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
