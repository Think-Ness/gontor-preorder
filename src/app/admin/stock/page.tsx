import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { Shirt, PackageIcon, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = { title: 'Manajemen Stok' }
export const revalidate = 0

export default async function StockPage() {
  const supabase = await createAdminClient()
  
  const { data: products } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('is_active', true)
    .order('display_order')

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Manajemen Stok</h1>
        <p className="text-gray-500 text-sm">Pantau ketersediaan produk dan varian</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-5 space-y-4">
        {(products ?? []).map((product: any) => (
          <div key={product.id} className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                <Shirt className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-sm">{product.name}</div>
                <div className="text-xs text-gray-500">{product.product_code}</div>
              </div>
              {!product.has_variants && product.stock_enabled && (
                <div className={`px-4 py-2 rounded-lg text-center ${
                  (product.stock ?? 0) <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                }`}>
                  <div className="text-xs font-semibold">Sisa Stok</div>
                  <div className="font-display font-black text-xl">{product.stock}</div>
                </div>
              )}
            </div>

            {product.has_variants && product.variants?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {product.variants.map((v: any) => (
                    <div key={v.id} className="bg-white rounded-lg p-2 border border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-semibold">{v.name}</span>
                      <span className={`text-sm font-bold ${
                        (v.stock ?? 0) <= 5 ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {v.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
