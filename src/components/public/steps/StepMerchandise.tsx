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
    <div>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(13,74,43,0.1)' }}>
          <ShoppingBag className="w-6 h-6" style={{ color: 'var(--gontor-green)' }} />
        </div>
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--gontor-green-dark)' }}>Pilih Merchandise</h2>
        <p className="text-sm text-gray-500 mt-1">Tambahkan produk ke keranjang Anda</p>
      </div>

      {/* Tab */}
      <div className="flex gap-2 p-1 rounded-xl mb-5" style={{ background: 'var(--color-neutral-100)' }}>
        {[{ key: 'produk', label: 'Produk' }, { key: 'paket', label: 'Paket Promo' }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
              tab === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
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

      {/* Cart summary */}
      {cart.items.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="font-display font-bold text-sm mb-3 text-gray-700">Keranjang Anda</h3>
          <div className="space-y-2">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800 truncate block">{item.name}</span>
                  {item.variantName && <span className="text-xs text-gray-500">{item.variantName}</span>}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-xs text-gray-400">×{item.quantity}</span>
                  <span className="font-semibold text-xs" style={{ color: 'var(--gontor-green)' }}>
                    {formatRupiah(item.unitPrice * item.quantity)}
                  </span>
                  <button onClick={() => onRemoveItem(item.id)} className="text-gray-300 hover:text-red-400 ml-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
            <span className="font-display font-bold text-sm">Subtotal</span>
            <span className="font-display font-bold" style={{ color: 'var(--gontor-green)' }}>
              {formatRupiah(cart.subtotal)}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-display font-semibold hover:bg-gray-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNext}
          disabled={totalQty === 0}
          className={`flex-1 py-3 rounded-xl font-display font-bold flex items-center justify-center gap-2 ${
            totalQty > 0 ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Lanjut — Pengiriman
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
