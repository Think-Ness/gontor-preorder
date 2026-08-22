'use client'

import { useState } from 'react'
import { Product, Package, CartItem } from '@/types'
import ProductCard from './ProductCard'
import PackageCard from './PackageCard'
import { PackageIcon, ShirtIcon, Tag, Filter } from 'lucide-react'

interface ProductCatalogProps {
  products: Product[]
  packages: Package[]
  onAddItem: (item: Omit<CartItem, 'id'>) => void
  cart: { items: CartItem[] }
  isOpen?: boolean
  productStats?: { productId: string; totalQty: number }[]
}

export default function ProductCatalog({ products, packages, onAddItem, cart, isOpen, productStats }: ProductCatalogProps) {
  const maxQty = productStats && productStats.length > 0 ? productStats[0].totalQty : 0
  const topProductIds = productStats?.filter(s => s.totalQty === maxQty && maxQty > 0).map(s => s.productId) || []



  return (
    <div className="max-w-[80rem] mx-auto px-6 lg:px-10 space-y-10">
      
      {/* Section Header (Competzy Style) */}
      <div className="space-y-3">
        <div className="text-xs font-extrabold uppercase tracking-widest text-[#063D2E] font-display flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          Katalog Merchandise Official
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-gray-950 tracking-tight">
          Jelajahi Semua Merchandise
        </h2>
        <p className="text-gray-500 text-sm font-body max-w-xl">
          Pilih koleksi cenderamata resmi peringatan 100 Tahun Gontor. Pengiriman fleksibel ke seluruh daerah.
        </p>
      </div>

      {/* Products & Packages Grid */}
      <div className="space-y-8 pt-4">
        
        {/* Packages Section */}
        {packages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <PackageIcon className="w-5 h-5 text-emerald-600" />
              Paket Promo Bundling
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map(pkg => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onAdd={onAddItem}
                  cartItems={cart.items}
                  isOpen={!!isOpen}
                />
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        {products.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <ShirtIcon className="w-5 h-5 text-[#063D2E]" />
              Katalog Produk Satuan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
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
                    isOpen={!!isOpen}
                    isTopTier={topProductIds.includes(product.id)}
                  />
                ))
              )}
            </div>
          </div>
        ) : null}

      </div>

    </div>
  )
}
