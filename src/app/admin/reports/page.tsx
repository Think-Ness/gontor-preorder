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
    supabase.from('order_items').select('item_name_snapshot,variant_name_snapshot,quantity,subtotal,item_type,orders!inner(payment_status)').eq('orders.payment_status', 'PAID'),
    supabase.from('orders').select('fulfillment_method').eq('payment_status', 'PAID').neq('order_status', 'CANCELLED'),
  ])

  const totalRevenue = salesData?.reduce((s, o) => s + Number(o.total_amount), 0) ?? 0
  const totalPaid = salesData?.length ?? 0

  // Production Recap (Grouped by Product -> Variant)
  const productRecap: Record<string, { total: number, variants: Record<string, number> }> = {}
  
  productData?.forEach(item => {
    const pName = item.item_name_snapshot || 'Unknown Product'
    // For single products without variant, we can label it as "Regular" or "Tanpa Varian"
    const vName = item.variant_name_snapshot || 'Tanpa Varian'
    const qty = item.quantity || 0

    if (!productRecap[pName]) productRecap[pName] = { total: 0, variants: {} }
    productRecap[pName].total += qty
    
    if (!productRecap[pName].variants[vName]) productRecap[pName].variants[vName] = 0
    productRecap[pName].variants[vName] += qty
  })

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
          <div className="text-sm text-gray-500 mt-1">Total Order Paid</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-5">
        {/* Production Recap Table */}
        <div className="card-premium p-5 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div>
              <h2 className="font-display font-bold text-gray-900">Rekap Kebutuhan Produksi</h2>
              <p className="text-xs text-gray-500">Berdasarkan pesanan LUNAS (PAID) untuk diserahkan ke vendor.</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-2 text-sm font-bold text-gray-700 bg-gray-50">Nama Produk</th>
                  <th className="py-3 px-2 text-sm font-bold text-gray-700 bg-gray-50">Varian/Ukuran</th>
                  <th className="py-3 px-2 text-sm font-bold text-gray-700 bg-gray-50 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.keys(productRecap).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400 text-sm">Belum ada pesanan lunas.</td>
                  </tr>
                ) : (
                  Object.entries(productRecap)
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([pName, { total, variants }]) => {
                      const vEntries = Object.entries(variants).sort((a, b) => b[1] - a[1])
                      return (
                        <tr key={pName} className="hover:bg-gray-50/50 align-top group transition-colors">
                          <td className="py-3 px-2">
                            <div className="font-bold text-gray-900">{pName}</div>
                            <div className="text-xs text-gray-500 mt-1">Total pesanan: <span className="font-bold text-emerald-600">{total}</span> pcs</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="space-y-1">
                              {vEntries.map(([vName, vQty]) => (
                                <div key={vName} className="flex justify-between items-center bg-white border border-gray-100 rounded px-2 py-1 text-sm">
                                  <span className="text-gray-700 font-medium">{vName}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="space-y-1">
                              {vEntries.map(([vName, vQty]) => (
                                <div key={vName} className="py-1 text-sm font-bold text-gray-900">
                                  {vQty}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Fulfillment & Export */}
        <div className="space-y-5">
          <div className="card-premium p-5">
            <h2 className="font-display font-bold text-gray-900 mb-4">Metode Pengambilan</h2>
            <p className="text-xs text-gray-500 mb-4">Statistik dari pesanan lunas.</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">📦 Ambil di Stand (Pickup)</span>
                  <span className="font-bold">{pickup.toLocaleString('id-ID')}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${pickup + delivery > 0 ? (pickup / (pickup + delivery)) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">🚚 Kirim Alamat (Delivery)</span>
                  <span className="font-bold">{delivery.toLocaleString('id-ID')}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500"
                    style={{ width: `${pickup + delivery > 0 ? (delivery / (pickup + delivery)) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card-premium p-5 bg-emerald-50 border-emerald-100">
            <h2 className="font-display font-bold text-emerald-900 mb-2">Export Data</h2>
            <p className="text-xs text-emerald-700 mb-4">Unduh rekap data pesanan mentah dalam format Excel.</p>
            <Link href="/admin/reports/export"
              className="btn-primary w-full py-3 text-sm font-display font-bold flex items-center justify-center gap-2">
              Unduh Excel (.xlsx) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
