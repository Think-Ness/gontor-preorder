import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { TrendingUp, ShoppingBag, Truck, Package } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Laporan' }
export const revalidate = 0

export default async function ReportsPage() {
  const supabase = await createAdminClient()

  const [
    { data: salesData },
    { data: productData },
    { data: fulfillmentData },
  ] = await Promise.all([
    supabase.from('orders').select('total_amount,payment_status,created_at').eq('payment_status', 'PAID'),
    supabase.from('order_items').select('item_name_snapshot,variant_name_snapshot,quantity,subtotal,item_type'),
    supabase.from('orders').select('fulfillment_method').neq('order_status', 'CANCELLED'),
  ])

  const totalRevenue = salesData?.reduce((s, o) => s + Number(o.total_amount), 0) ?? 0
  const totalPaid = salesData?.length ?? 0

  // Variant distribution
  const variantMap: Record<string, number> = {}
  productData?.filter(i => i.item_type === 'VARIANT').forEach(i => {
    const key = `${i.item_name_snapshot} — ${i.variant_name_snapshot}`
    variantMap[key] = (variantMap[key] ?? 0) + i.quantity
  })
  const variants = Object.entries(variantMap).sort((a, b) => b[1] - a[1])

  // Fulfillment distribution
  const pickup = fulfillmentData?.filter(o => o.fulfillment_method === 'PICKUP').length ?? 0
  const delivery = fulfillmentData?.filter(o => o.fulfillment_method === 'DELIVERY').length ?? 0

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Laporan Penjualan</h1>
        <p className="text-gray-500 text-sm">Ringkasan performa pre-order</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-5">
          <TrendingUp className="w-8 h-8 mb-3 text-green-600" />
          <div className="font-display font-black text-2xl text-gray-900">{formatRupiah(totalRevenue)}</div>
          <div className="text-sm text-gray-500 mt-1">Total Pendapatan (Paid)</div>
        </div>
        <div className="card-premium p-5">
          <ShoppingBag className="w-8 h-8 mb-3 text-blue-500" />
          <div className="font-display font-black text-2xl text-gray-900">{totalPaid.toLocaleString('id-ID')}</div>
          <div className="text-sm text-gray-500 mt-1">Order Terbayar</div>
        </div>
        <div className="card-premium p-5">
          <Package className="w-8 h-8 mb-3 text-amber-500" />
          <div className="font-display font-black text-2xl text-gray-900">
            {(pickup + delivery).toLocaleString('id-ID')}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Order (non-cancelled)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Variant distribution */}
        <div className="card-premium p-5">
          <h2 className="font-display font-bold text-gray-900 mb-4">Distribusi Varian</h2>
          <div className="space-y-2">
            {variants.slice(0, 15).map(([name, qty]) => {
              const max = variants[0]?.[1] ?? 1
              return (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 truncate mr-2">{name}</span>
                    <span className="font-bold text-gray-800 flex-shrink-0">{qty}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${(qty / max) * 100}%`,
                      background: 'linear-gradient(90deg, var(--gontor-green), var(--gontor-green-light))'
                    }} />
                  </div>
                </div>
              )
            })}
            {variants.length === 0 && <p className="text-sm text-gray-400">Belum ada data</p>}
          </div>
        </div>

        {/* Fulfillment */}
        <div className="card-premium p-5">
          <h2 className="font-display font-bold text-gray-900 mb-4">Fulfillment</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold">📦 Pickup</span>
                <span className="font-bold">{pickup.toLocaleString('id-ID')}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-green-500"
                  style={{ width: `${pickup + delivery > 0 ? (pickup / (pickup + delivery)) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold">🚚 Delivery</span>
                <span className="font-bold">{delivery.toLocaleString('id-ID')}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500"
                  style={{ width: `${pickup + delivery > 0 ? (delivery / (pickup + delivery)) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link href="/admin/reports/export"
              className="btn-primary w-full py-3 text-sm font-display font-bold flex items-center justify-center gap-2">
              Export Data CSV/XLSX →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
