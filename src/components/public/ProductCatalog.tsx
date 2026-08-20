'use client'

import { useState } from 'react'
import { Product, Package, CartItem } from '@/types'
import ProductCard from './ProductCard'
import PackageCard from './PackageCard'
import { PackageIcon, ShirtIcon, Tag } from 'lucide-react'

interface ProductCatalogProps {
  products: Product[]
  packages: Package[]
  onAddItem: (item: Omit<CartItem, 'id'>) => void
  cart: { items: CartItem[] }
  isOpen: boolean
}

type Tab = 'produk' | 'paket'

export default function ProductCatalog({ products, packages, onAddItem, cart, isOpen }: ProductCatalogProps) {
  const [activeTab, setActiveTab] = useState<Tab>('produk')

  const tabs = [
    { key: 'produk' as Tab, label: 'Produk', icon: ShirtIcon, count: products.length },
    { key: 'paket' as Tab, label: 'Paket Promo', icon: PackageIcon, count: packages.length },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-xs font-semibold font-display tracking-widest uppercase"
          style={{ background: 'rgba(13,74,43,0.08)', color: 'var(--gontor-green)' }}>
          <Tag className="w-3 h-3" />
          Katalog Merchandise
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl mb-3"
          style={{ color: 'var(--gontor-green-dark)' }}>
          Official Reunion Kit
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto text-sm">
          Koleksi merchandise resmi peringatan 100 tahun Gontor. Hanya tersedia dalam pre-order ini.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl mb-8 max-w-xs mx-auto"
        style={{ background: 'var(--color-neutral-100)' }}>
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-display font-semibold transition-all ${
              activeTab === key
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === key ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {activeTab === 'produk' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <ShirtIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-display font-semibold">Belum ada produk tersedia</p>
            </div>
          ) : (
            products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAddItem}
                cartItems={cart.items}
                isOpen={isOpen}
              />
            ))
          )}
        </div>
      )}

      {/* Packages Grid */}
      {activeTab === 'paket' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <PackageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-display font-semibold">Belum ada paket tersedia</p>
            </div>
          ) : (
            packages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onAdd={onAddItem}
                cartItems={cart.items}
                isOpen={isOpen}
              />
            ))
          )}
        </div>
      )}

      {!isOpen && (
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl"
            style={{ background: 'rgba(13,74,43,0.06)', border: '1px dashed rgba(13,74,43,0.2)' }}>
            <span className="text-3xl">🔒</span>
            <div className="text-left">
              <div className="font-display font-bold" style={{ color: 'var(--gontor-green)' }}>
                Pre-order belum/sudah ditutup
              </div>
              <div className="text-sm text-gray-500">Pemesanan tidak dapat dilakukan saat ini</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
