'use client'

import { useState } from 'react'
import { Product, Package, CartItem } from '@/types'
import ProductCard from './ProductCard'
import PackageCard from './PackageCard'
import { PackageIcon, ShirtIcon, Tag, Sparkles, Filter } from 'lucide-react'

interface ProductCatalogProps {
  products: Product[]
  packages: Package[]
  onAddItem: (item: Omit<CartItem, 'id'>) => void
  cart: { items: CartItem[] }
  isOpen: boolean
}

type Tab = 'semua' | 'produk' | 'paket'
type FilterTag = 'semua' | 'populer' | 'limited' | 'bundling'

export default function ProductCatalog({ products, packages, onAddItem, cart, isOpen }: ProductCatalogProps) {
  const [activeTab, setActiveTab] = useState<Tab>('semua')
  const [activeTag, setActiveTag] = useState<FilterTag>('semua')

  const filterTags: { key: FilterTag; label: string; bg: string }[] = [
    { key: 'semua', label: 'Semua Tag', bg: 'bg-[#5627ff] text-white' },
    { key: 'populer', label: 'Terpopuler', bg: 'bg-amber-500 text-white' },
    { key: 'limited', label: 'Edisi Terbatas', bg: 'bg-[#d9277b] text-white' },
    { key: 'bundling', label: 'Bundling Hemat', bg: 'bg-emerald-600 text-white' },
  ]

  const featuredCards = [
    {
      id: 1,
      title: 'Official T-Shirt 100 Tahun',
      subtitle: 'Merchandise Resmi Panitia',
      tag: 'BEST SELLER',
      gradient: 'from-[#063D2E] via-emerald-900 to-green-950',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      title: 'Varsity Jacket Reuni Akbar',
      subtitle: 'Bahan Fleece Premium Distro',
      tag: 'LIMITED EDITION',
      gradient: 'from-purple-950 via-[#5627ff] to-indigo-950',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      title: 'Paket Hemat Lengkap Reuni',
      subtitle: 'Kaos + Jaket + Peci + Accessories',
      tag: 'HEMAT BUNDLING',
      gradient: 'from-amber-950 via-amber-700 to-yellow-950',
      image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=600&q=80',
    },
  ]

  return (
    <div className="max-w-[80rem] mx-auto px-6 lg:px-10 space-y-10">
      
      {/* Section Header (Competzy Style) */}
      <div className="space-y-3">
        <div className="text-xs font-extrabold uppercase tracking-widest text-[#5627ff] font-display flex items-center gap-1.5">
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

      {/* 2-Level Competzy Filter Pills */}
      <div className="space-y-3">
        
        {/* Row 1: Category Types Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-bold font-display">
          <span className="text-gray-400 text-[11px] font-extrabold uppercase tracking-widest mr-2">Tipe:</span>
          <button
            onClick={() => setActiveTab('semua')}
            className={`px-4 py-2 rounded-full transition-all border ${
              activeTab === 'semua'
                ? 'bg-[#5627ff] text-white border-[#5627ff] shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Semua ({products.length + packages.length})
          </button>
          <button
            onClick={() => setActiveTab('produk')}
            className={`px-4 py-2 rounded-full transition-all border ${
              activeTab === 'produk'
                ? 'bg-[#5627ff] text-white border-[#5627ff] shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Produk Satuan ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('paket')}
            className={`px-4 py-2 rounded-full transition-all border ${
              activeTab === 'paket'
                ? 'bg-[#5627ff] text-white border-[#5627ff] shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Paket Promo ({packages.length})
          </button>
        </div>

        {/* Row 2: Tag Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-bold font-display">
          <span className="text-gray-400 text-[11px] font-extrabold uppercase tracking-widest mr-2">Tag:</span>
          {filterTags.map(tag => (
            <button
              key={tag.key}
              onClick={() => setActiveTag(tag.key)}
              className={`px-3.5 py-1.5 rounded-full transition-all border text-[11px] ${
                activeTag === tag.key
                  ? tag.bg + ' shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

      </div>

      {/* Featured Banner Cards Grid (Competzy Signature Component) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {featuredCards.map(card => (
          <div
            key={card.id}
            className={`relative overflow-hidden rounded-[1.8rem] bg-gradient-to-b ${card.gradient} text-white p-6 shadow-xl border border-white/10 group min-h-[260px] flex flex-col justify-between`}
          >
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 z-0">
              <img src={card.image} alt={card.title} className="w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>

            {/* Tag */}
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/30 text-white">
                {card.tag}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-1">
              <h3 className="font-display font-black text-xl sm:text-2xl text-white group-hover:text-amber-300 transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-gray-300 font-body">
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Products & Packages Grid */}
      <div className="space-y-8 pt-4">
        
        {/* Packages Section */}
        {(activeTab === 'semua' || activeTab === 'paket') && packages.length > 0 && (
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
                  isOpen={isOpen}
                />
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        {(activeTab === 'semua' || activeTab === 'produk') && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <ShirtIcon className="w-5 h-5 text-[#5627ff]" />
              Katalog Produk Satuan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          </div>
        )}

      </div>

    </div>
  )
}
