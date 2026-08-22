'use client'

import { useEffect, useCallback } from 'react'
import { CartItem } from '@/types'
import { formatRupiah } from '@/lib/utils'
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Cart {
  items: CartItem[]
  subtotal: number
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: Cart
  onRemove: (id: string) => void
  onUpdateQty: (id: string, qty: number) => void
  onClear: () => void
  isPreorderOpen: boolean
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onRemove,
  onUpdateQty,
  onClear,
  isPreorderOpen,
}: CartDrawerProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const isEmpty = cart.items.length === 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: 'var(--gontor-green)' }} />
            <h2 className="font-display font-bold text-gray-900">Keranjang</h2>
            {!isEmpty && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(13,74,43,0.1)', color: 'var(--gontor-green)' }}>
                {cart.items.reduce((s, i) => s + i.quantity, 0)} item
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEmpty && (
              <button
                onClick={onClear}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 font-semibold min-h-[44px] px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kosongkan
              </button>
            )}
            <button onClick={onClose} aria-label="Tutup Keranjang" className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-3">
          {isEmpty ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
              <p className="font-display font-semibold text-gray-400 mb-1">Keranjang kosong</p>
              <p className="text-xs text-gray-400">Tambahkan produk dari katalog</p>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-sm text-gray-900 truncate">{item.name}</div>
                  {item.variantName && (
                    <div className="text-xs text-gray-500">{item.variantName}</div>
                  )}
                  <div className="text-xs font-semibold mt-1" style={{ color: 'var(--gontor-green)' }}>
                    {formatRupiah(item.unitPrice)}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => item.quantity <= 1 ? onRemove(item.id) : onUpdateQty(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 hover:border-red-300 text-gray-600 hover:text-red-500 transition-colors active:scale-95"
                    >
                      {item.quantity <= 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    <span className="font-display font-bold text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      disabled={item.maxStock !== undefined && item.maxStock !== null && item.quantity >= item.maxStock}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors active:scale-95 ${
                        item.maxStock !== undefined && item.maxStock !== null && item.quantity >= item.maxStock
                          ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:border-green-400 text-gray-600 hover:text-green-600'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    {item.maxStock !== undefined && item.maxStock !== null && (
                      <span className="text-[10px] text-gray-400 font-semibold">
                        (Maks: {item.maxStock})
                      </span>
                    )}
                    <span className="ml-auto text-xs font-semibold text-gray-700">
                      {formatRupiah(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Subtotal</span>
              <span className="font-display font-bold text-lg" style={{ color: 'var(--gontor-green)' }}>
                {formatRupiah(cart.subtotal)}
              </span>
            </div>
            <p className="text-xs text-gray-400">* Ongkos kirim dihitung di langkah selanjutnya</p>
            {isPreorderOpen ? (
              <Link
                href="/order"
                onClick={onClose}
                className="btn-primary w-full py-4 min-h-[48px] flex items-center justify-center gap-2 font-display font-bold"
              >
                Lanjut Pemesanan
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="w-full py-4 text-center text-sm text-gray-400 font-semibold bg-gray-100 rounded-lg">
                Pre-order sudah ditutup
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
