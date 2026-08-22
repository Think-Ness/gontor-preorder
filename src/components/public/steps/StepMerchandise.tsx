'use client'

import { Product, Package, CartItem } from '@/types'
import ProductCard from '../ProductCard'
import PackageCard from '../PackageCard'
import { formatRupiah } from '@/lib/utils'
import { ShoppingBag, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface Cart { items: CartItem[]; subtotal: number }

interface Props {
  products: Product[]
  packages: Package[]
  cart: Cart
  onAddItem: (item: Omit<CartItem, 'id'>) => void
  onRemoveItem: (id: string) => void
  onUpdateQty: (id: string, qty: number) => void
  onNext: () => void
  onBack: () => void
}

export default function StepMerchandise({ products, packages, cart, onAddItem, onRemoveItem, onUpdateQty, onNext, onBack }: Props) {
  const [tab, setTab] = useState<'produk' | 'paket'>('produk')
  const totalQty = cart.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="relative">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(13,74,43,0.1)' }}>
          <ShoppingBag className="w-6 h-6" style={{ color: 'var(--gontor-green)' }} />
        </div>
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--gontor-green-dark)' }}>Pilih Merchandise</h2>
        <p className="text-sm text-gray-500 mt-1">Tambahkan produk ke keranjang Anda</p>
      </div>

      {/* Cart summary placed AT THE TOP so user sees current selections first */}
      {cart.items.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-200 mb-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <h3 className="font-display font-bold text-sm text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Keranjang Anda ({totalQty} item)
            </h3>
            <span className="text-xs font-bold text-emerald-800 font-display">
              Total: {formatRupiah(cart.subtotal)}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-none">
                <div className="flex-1 min-w-0 pr-2">
                  <span className="font-semibold text-gray-800 truncate block text-xs sm:text-sm">{item.name}</span>
                  {item.variantName && <span className="text-[11px] text-gray-500">{item.variantName}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500 font-medium">×{item.quantity}</span>
                  <span className="font-bold text-xs" style={{ color: 'var(--gontor-green)' }}>
                    {formatRupiah(item.unitPrice * item.quantity)}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex gap-2 p-1 rounded-xl mb-5" style={{ background: 'var(--color-neutral-100)' }}>
        {[{ key: 'produk', label: 'Katalog Produk' }, { key: 'paket', label: 'Paket Promo' }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-display font-bold transition-all ${
              tab === key ? 'bg-white shadow-sm text-[#063D2E]' : 'text-gray-500 hover:text-gray-800'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Product / Package Grid */}
      {tab === 'produk' ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onAdd={onAddItem} cartItems={cart.items} isOpen />
          ))}
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {packages.map(p => (
            <PackageCard key={p.id} pkg={p} onAdd={onAddItem} cartItems={cart.items} isOpen />
          ))}
        </div>
      )}

      {/* Sticky Bottom Action Navigation (No scrolling required!) */}
      <div className="sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 -mx-4 -mb-6 mt-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center gap-3 safe-area-bottom">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 px-4 py-3 min-h-[48px] rounded-xl border border-gray-200 font-display font-semibold text-gray-600 hover:bg-gray-50 shrink-0 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline text-xs sm:text-sm">Kembali</span>
        </button>

        <button
          onClick={onNext}
          disabled={totalQty === 0}
          className={`flex-1 py-3 px-4 min-h-[48px] rounded-xl font-display font-bold flex items-center justify-between transition-all ${
            totalQty > 0
              ? 'btn-primary shadow-lg active:scale-[0.99]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs sm:text-sm truncate">Lanjut — Pengiriman</span>
            {totalQty > 0 && (
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-extrabold shrink-0">
                {totalQty} item
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 font-black text-xs sm:text-sm">
            {totalQty > 0 && <span>{formatRupiah(cart.subtotal)}</span>}
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </div>
        </button>
      </div>
    </div>
  )
}
