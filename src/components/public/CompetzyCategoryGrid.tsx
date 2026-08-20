'use client'

import { Product, Package, CartItem } from '@/types'
import { ArrowUpRight, Shirt, Package as PackageIcon, Tag, Plus, Check } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface CompetzyCategoryGridProps {
  products: Product[]
  packages: Package[]
  onAddItem: (item: Omit<CartItem, 'id'>) => void
  cartItems: CartItem[]
}

export default function CompetzyCategoryGrid({
  products,
  packages,
  onAddItem,
  cartItems,
}: CompetzyCategoryGridProps) {
  
  // Pick top 3 products, top 3 packages, and top 3 accessories
  const topProducts = products.slice(0, 3)
  const topPackages = packages.slice(0, 3)
  const accessories = products.filter(p => p.has_variants === false || p.price < 100000).slice(0, 3)

  const isItemInCart = (productId?: string, packageId?: string) => {
    return cartItems.some(item => 
      (productId && item.productId === productId) || 
      (packageId && item.packageId === packageId)
    )
  }

  return (
    <section className="relative bg-[#f4f1fb] py-12 lg:py-16">
      <div className="mx-auto max-w-[80rem] px-6 lg:px-10 space-y-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[1.2rem] sm:text-[1.35rem] font-bold font-display tracking-tight text-[#181219]">
            Baru & Populer 100 Tahun
          </h2>
          <a href="#catalog" className="text-xs font-bold text-[#5627ff] hover:underline flex items-center gap-1">
            Lihat semua katalog →
          </a>
        </div>

        {/* 3-Column Cards Grid (Competzy Signature Component) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* CARD 1: Terpopuler Reuni */}
          <div className="flex h-full flex-col rounded-[1.5rem] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(24,18,25,0.5)] border border-gray-100">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[1rem] font-bold font-display text-gray-900 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-[#5627ff]" />
                Kaos & Jaket Terfavorit
              </h3>
              <a
                href="#catalog"
                className="grid h-7 w-7 place-items-center rounded-full text-white bg-[#5627ff] transition-transform duration-300 hover:scale-105"
                title="Lihat semua"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <ul className="flex flex-col gap-3 flex-1">
              {topProducts.map(product => {
                const inCart = isItemInCart(product.id, undefined)
                const img = product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80'

                return (
                  <li key={product.id}>
                    <div className="group flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-md">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                        <img src={img} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-gray-900 font-display group-hover:text-[#5627ff]">
                          {product.name}
                        </div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
                          {formatRupiah(product.price)}
                        </div>
                        <p className="line-clamp-1 text-xs text-gray-500 font-body">
                          {product.description || 'Official 100 Tahun Gontor'}
                        </p>
                      </div>

                      <button
                        onClick={() => onAddItem({
                          productId: product.id,
                          itemType: 'PRODUCT',
                          name: product.name,
                          unitPrice: product.price,
                          quantity: 1,
                          imageUrl: product.image_url,
                        })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          inCart 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-purple-50 hover:bg-[#5627ff] text-[#5627ff] hover:text-white'
                        }`}
                        title="Tambah ke Keranjang"
                      >
                        {inCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* CARD 2: Paket Promo Bundling */}
          <div className="flex h-full flex-col rounded-[1.5rem] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(24,18,25,0.5)] border border-gray-100">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[1rem] font-bold font-display text-gray-900 flex items-center gap-2">
                <PackageIcon className="w-4 h-4 text-emerald-600" />
                Paket Hemat Bundling
              </h3>
              <a
                href="#catalog"
                className="grid h-7 w-7 place-items-center rounded-full text-white bg-emerald-600 transition-transform duration-300 hover:scale-105"
                title="Lihat semua"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <ul className="flex flex-col gap-3 flex-1">
              {topPackages.map(pkg => {
                const inCart = isItemInCart(undefined, pkg.id)
                const img = pkg.image_url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80'

                return (
                  <li key={pkg.id}>
                    <div className="group flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                        <img src={img} alt={pkg.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-gray-900 font-display group-hover:text-emerald-700">
                          {pkg.name}
                        </div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                          {formatRupiah(pkg.price)}
                        </div>
                        <p className="line-clamp-1 text-xs text-gray-500 font-body">
                          {pkg.description || 'Hemat Bundling Spesial Reuni'}
                        </p>
                      </div>

                      <button
                        onClick={() => onAddItem({
                          packageId: pkg.id,
                          itemType: 'PACKAGE',
                          name: pkg.name,
                          unitPrice: pkg.price,
                          quantity: 1,
                          imageUrl: pkg.image_url,
                        })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          inCart 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white'
                        }`}
                        title="Tambah ke Keranjang"
                      >
                        {inCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* CARD 3: Aksesoris & Official Kit */}
          <div className="flex h-full flex-col rounded-[1.5rem] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(24,18,25,0.5)] border border-gray-100">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[1rem] font-bold font-display text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                Cenderamata & Aksesoris
              </h3>
              <a
                href="#catalog"
                className="grid h-7 w-7 place-items-center rounded-full text-white bg-amber-500 transition-transform duration-300 hover:scale-105"
                title="Lihat semua"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <ul className="flex flex-col gap-3 flex-1">
              {accessories.map(item => {
                const inCart = isItemInCart(item.id, undefined)
                const img = item.image_url || 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=200&q=80'

                return (
                  <li key={item.id}>
                    <div className="group flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-md">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                        <img src={img} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-gray-900 font-display group-hover:text-amber-600">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
                          {formatRupiah(item.price)}
                        </div>
                        <p className="line-clamp-1 text-xs text-gray-500 font-body">
                          {item.description || 'Edisi Spesial 100 Tahun'}
                        </p>
                      </div>

                      <button
                        onClick={() => onAddItem({
                          productId: item.id,
                          itemType: 'PRODUCT',
                          name: item.name,
                          unitPrice: item.price,
                          quantity: 1,
                          imageUrl: item.image_url,
                        })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          inCart 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white'
                        }`}
                        title="Tambah ke Keranjang"
                      >
                        {inCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

        </div>

      </div>
    </section>
  )
}
