'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Product, ProductVariant, CartItem, SizeChart } from '@/types'
import { formatRupiah, sortVariants } from '@/lib/utils'
import { buildDriveImageUrl } from '@/lib/drive-urls'
import { X, Plus, ShoppingBag, Shirt, Ruler, Sparkles, Check, ZoomIn } from 'lucide-react'

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAdd: (item: Omit<CartItem, 'id'>) => void
  cartItems: CartItem[]
  isStoreOpen: boolean
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAdd,
  cartItems,
  isStoreOpen,
}: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'sizechart'>('details')
  const [isZoomingSizeChart, setIsZoomingSizeChart] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [fetchedSizeChart, setFetchedSizeChart] = useState<SizeChart | null>(null)

  const sortedVariants = useMemo(() => {
    if (!product || !product.variants) return []
    return sortVariants(product.variants.filter(v => v.is_active))
  }, [product])

  useEffect(() => {
    if (product) {
      const activeVars = sortVariants((product.variants || []).filter(v => v.is_active))
      setSelectedVariant(activeVars[0] ?? null)
      setActiveTab('details')
      setIsZoomingSizeChart(false)
      setAddedSuccess(false)

      if (product.size_chart_id && !product.size_chart) {
        fetch('/api/admin/size-charts')
          .then(res => res.json())
          .then(res => {
            if (res.data && Array.isArray(res.data)) {
              const found = res.data.find((sc: SizeChart) => sc.id === product.size_chart_id)
              if (found) setFetchedSizeChart(found)
            }
          })
          .catch(console.error)
      } else {
        setFetchedSizeChart(null)
      }
    }
  }, [product])

  if (!isOpen || !product) return null

  let fileId = product.image_drive_file_id
  if (!fileId && product.image_url) {
    const match = product.image_url.match(/id=([^&]+)/)
    if (match) fileId = match[1]
  }

  const imageUrl = fileId
    ? buildDriveImageUrl(fileId)
    : product.image_url || null

  let sizeChartFileId = product.size_chart_drive_file_id
  if (!sizeChartFileId && product.size_chart_image_url) {
    const match = product.size_chart_image_url.match(/id=([^&]+)/)
    if (match) sizeChartFileId = match[1]
  }

  const sizeChartImageUrl = sizeChartFileId
    ? buildDriveImageUrl(sizeChartFileId)
    : product.size_chart_image_url || null

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

  const handleAddToCart = () => {
    if (!isStoreOpen || isOutOfStock || isMaxStockReached) return

    if (product.has_variants && selectedVariant) {
      onAdd({
        productId: product.id,
        variantId: selectedVariant.id,
        itemType: 'VARIANT',
        name: product.name,
        variantName: selectedVariant.name,
        unitPrice: selectedVariant.price,
        weightGram: product.weight_gram,
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
        weightGram: product.weight_gram,
        quantity: 1,
        imageUrl,
        maxStock,
      })
    }

    setAddedSuccess(true)
    setTimeout(() => setAddedSuccess(false), 2000)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
        <div 
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-green-800 text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-white border border-white/20 uppercase">
                {product.product_code}
              </span>
              <h2 className="font-display font-bold text-sm sm:text-base line-clamp-1">
                Detail Produk
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Scroll Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Product Main Image */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                      <ShoppingBag className="w-16 h-16 text-emerald-300" />
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs font-display font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                        STOK HABIS
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 w-full text-center">
                  <div className="font-display font-black text-xl sm:text-2xl text-emerald-800">
                    {formatRupiah(activePrice)}
                  </div>
                  {product.weight_gram && (
                    <p className="text-[11px] text-gray-400 font-medium">Estimasi Berat: {product.weight_gram} gram</p>
                  )}
                </div>
              </div>

              {/* Product Info & Specs */}
              <div className="md:col-span-7 space-y-5">
                <div>
                  <h1 className="font-display font-black text-lg sm:text-xl text-gray-900 leading-snug">
                    {product.name}
                  </h1>
                </div>

                {/* Tab Controls: Detail Spesifikasi vs Chart Ukuran */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2.5 px-3 text-xs font-display font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'details'
                        ? 'border-emerald-600 text-emerald-700 font-black'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Shirt className="w-4 h-4" />
                    Spesifikasi & Deskripsi
                  </button>
                  <button
                    onClick={() => setActiveTab('sizechart')}
                    className={`pb-2.5 px-3 text-xs font-display font-bold border-b-2 transition-all flex items-center gap-1.5 relative ${
                      activeTab === 'sizechart'
                        ? 'border-emerald-600 text-emerald-700 font-black'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Ruler className="w-4 h-4" />
                    Panduan Ukuran (Size Chart)
                    {sizeChartImageUrl && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </button>
                </div>

                {/* Tab 1: Details */}
                {activeTab === 'details' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Material Specification Banner */}
                    {product.material_description && (
                      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-4 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-display font-black text-emerald-800 uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          Spesifikasi Bahan & Material
                        </div>
                        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold">
                          {product.material_description}
                        </p>
                      </div>
                    )}

                    {/* Description Text */}
                    {product.description ? (
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Penjelasan Produk</div>
                        <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    ) : (
                      !product.material_description && (
                        <p className="text-xs text-gray-400 italic">Belum ada deskripsi tambahan untuk produk ini.</p>
                      )
                    )}

                    {/* Variant Selector */}
                    {product.has_variants && sortedVariants.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-xs font-bold text-gray-700 mb-2 font-display flex items-center justify-between">
                          <span>Pilih Ukuran / Varian:</span>
                          {selectedVariant && (
                            <span className="text-emerald-700 font-black">{selectedVariant.name}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sortedVariants.map(v => {
                            const outOfStock = v.stock !== null && v.stock !== undefined && v.stock <= 0
                            const isSelected = selectedVariant?.id === v.id
                            return (
                              <button
                                key={v.id}
                                onClick={() => !outOfStock && setSelectedVariant(v)}
                                disabled={outOfStock}
                                className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-display font-bold border transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                                    : outOfStock
                                      ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                      : 'border-gray-200 hover:border-emerald-400 bg-white text-gray-700 hover:bg-emerald-50/50'
                                }`}
                              >
                                {v.name}
                                {v.stock !== null && v.stock !== undefined && (
                                  <span className={`text-[10px] opacity-80 font-normal ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                    ({v.stock})
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Size Chart */}
                {activeTab === 'sizechart' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Sleek & Formal Master Size Chart Table */}
                    {(() => {
                      const sc = product.size_chart || fetchedSizeChart
                      if (!sc || !sc.sizes || sc.sizes.length === 0) {
                        return (
                          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-6 text-center space-y-1">
                            <p className="text-xs font-bold text-emerald-900 font-display">Tabel Size Chart Belum Dipasang</p>
                            <p className="text-[11px] text-emerald-700">Panitia belum memilih template tabel ukuran untuk produk ini. Silakan pilih varian ukuran langsung pada tab Spesifikasi.</p>
                          </div>
                        )
                      }
                      return (
                        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-3.5 border border-slate-800 shadow-lg">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2">
                              <Ruler className="w-4 h-4 text-emerald-400" />
                              <h3 className="font-display font-black text-white text-xs sm:text-sm tracking-wide uppercase">
                                {sc.name || 'PANDUAN UKURAN'}
                              </h3>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded font-semibold">
                              Satuan: {sc.unit || 'cm'}
                            </span>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-900 text-amber-400 font-display font-black text-[10px] sm:text-xs uppercase border-b border-slate-800">
                                  <th className="py-2.5 px-3 text-left font-bold tracking-wider">KETERANGAN</th>
                                  {sc.sizes.map(s => (
                                    <th key={s} className="py-2.5 px-2 text-center font-black">{s}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/80">
                                {(sc.measurements || []).map((m, idx) => (
                                  <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                                    <td className="py-2.5 px-3 font-display font-bold text-emerald-300 text-[11px] sm:text-xs whitespace-nowrap">
                                      {m.label.toUpperCase()}
                                    </td>
                                    {sc.sizes.map(s => (
                                      <td key={s} className="py-2.5 px-2 text-center font-mono font-bold text-slate-100 text-xs sm:text-sm">
                                        {m.values[s] || '-'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 italic text-right pt-0.5">
                            * Toleransi ukuran ±1-2 cm dapat terjadi karena proses penjahitan.
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2">
              {qty > 0 && (
                <span className="text-xs font-display font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  {qty}x di keranjang
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || !isStoreOpen || isMaxStockReached}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-display font-bold flex items-center gap-2 shadow-lg transition-all ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock || !isStoreOpen || isMaxStockReached
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      : 'btn-primary'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Berhasil Ditambahkan!
                  </>
                ) : isOutOfStock ? (
                  'Stok Habis'
                ) : !isStoreOpen ? (
                  'Pre-order Tutup'
                ) : isMaxStockReached ? (
                  'Mencapai Stok Maksimal'
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    + Tambah ke Keranjang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Size Chart Zoom Modal */}
      {isZoomingSizeChart && sizeChartImageUrl && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomingSizeChart(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
            <button
              onClick={() => setIsZoomingSizeChart(false)}
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={sizeChartImageUrl}
                alt="Size chart full view"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
