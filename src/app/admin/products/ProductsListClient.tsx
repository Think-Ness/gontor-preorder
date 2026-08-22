'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import { buildDriveImageUrl } from '@/lib/drive-urls'
import { Plus, Edit, Copy, Trash2, Image as ImageIcon, Loader2, CheckSquare, Square } from 'lucide-react'

interface ProductItem {
  id: string
  name: string
  product_code: string
  price: number | string
  product_type: string
  is_active: boolean
  stock_enabled: boolean
  stock: number | null
  has_variants: boolean
  image_drive_file_id?: string | null
  display_order?: number
}

interface Props {
  initialProducts: ProductItem[]
}

export default function ProductsListClient({ initialProducts }: Props) {
  const router = useRouter()
  const [products, setProducts] = useState<ProductItem[]>(initialProducts)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const isAllSelected = products.length > 0 && selectedIds.length === products.length

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map(p => p.id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    const confirmMsg = selectedIds.length === 1
      ? `Hapus 1 produk terpilih secara permanen?`
      : `Hapus ${selectedIds.length} produk terpilih secara permanen?`

    if (!confirm(confirmMsg)) return

    setDeleting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus produk')

      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)))
      setSelectedIds([])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus produk')
    } finally {
      setDeleting(false)
    }
  }

  const handleSingleDelete = async (product: ProductItem) => {
    if (!confirm(`Hapus produk "${product.name}" secara permanen?`)) return

    setDeleting(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus produk')

      setProducts(prev => prev.filter(p => p.id !== product.id))
      setSelectedIds(prev => prev.filter(id => id !== product.id))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus produk')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Produk</h1>
          <p className="text-gray-500 text-sm">{products.length} produk terdaftar</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Hapus ({selectedIds.length}) Terpilih
            </button>
          )}

          <Link
            href="/admin/products/new"
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Main List Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header / Selection Control */}
        {products.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2.5 hover:text-gray-900 transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-green-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>{isAllSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}</span>
            </button>

            {selectedIds.length > 0 && (
              <span className="text-gray-600 font-normal">
                <strong className="text-gray-900">{selectedIds.length}</strong> produk dipilih
              </span>
            )}
          </div>
        )}

        {/* Product Items */}
        <div className="divide-y divide-gray-50 min-w-[500px]">
          {products.map(product => {
            const isSelected = selectedIds.includes(product.id)

            return (
              <div
                key={product.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                  isSelected ? 'bg-green-50/40' : 'hover:bg-gray-50'
                }`}
              >
                {/* Select Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleSelect(product.id)}
                  className="p-1 rounded text-gray-400 hover:text-green-600 transition-colors"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-green-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-300" />
                  )}
                </button>

                {/* Image placeholder */}
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.image_drive_file_id ? (
                    <img
                      src={buildDriveImageUrl(product.image_drive_file_id)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-gray-900">
                      {product.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono">
                      {product.product_code}
                    </span>
                    {!product.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: 'var(--gontor-green)' }}
                    >
                      {formatRupiah(Number(product.price))}
                    </span>
                    <span className="text-xs text-gray-400">{product.product_type}</span>
                    {product.stock_enabled && product.stock !== null && (
                      <span className="text-xs text-gray-400">Stok: {product.stock}</span>
                    )}
                    {product.has_variants && (
                      <span className="text-xs text-gray-400">Memiliki varian</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/new?duplicateFrom=${product.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Duplikat Produk Ini"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    Duplikat
                  </Link>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleSingleDelete(product)}
                    disabled={deleting}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {products.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-display font-semibold mb-4">Belum ada produk</p>
              <Link
                href="/admin/products/new"
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <Plus className="w-4 h-4" />
                Tambah Produk Pertama
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
