import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'
import { buildDriveImageUrl } from '@/lib/drive-urls'
import { Plus, Edit, Eye, ToggleLeft, ToggleRight, Image as ImageIcon } from 'lucide-react'
export const metadata: Metadata = { title: 'Produk' }
export const revalidate = 0

export default async function ProductsPage() {
  const supabase = await createAdminClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, variants:product_variants(count)')
    .order('display_order')

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Produk</h1>
          <p className="text-gray-500 text-sm">{products?.length ?? 0} produk terdaftar</p>
        </div>
        <Link href="/admin/products/new"
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {(products ?? []).map((product: any) => (
            <div key={product.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              {/* Image placeholder */}
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {product.image_drive_file_id ? (
                  <img src={buildDriveImageUrl(product.image_drive_file_id)}
                    alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-gray-900">{product.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono">
                    {product.product_code}
                  </span>
                  {!product.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500">Nonaktif</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="font-semibold text-sm" style={{ color: 'var(--gontor-green)' }}>
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
                <Link href={`/admin/products/${product.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </div>
            </div>
          ))}

          {(products ?? []).length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-display font-semibold mb-4">Belum ada produk</p>
              <Link href="/admin/products/new" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
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
