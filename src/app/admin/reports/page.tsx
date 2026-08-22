import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { TrendingUp, ShoppingBag, Truck, Package, Boxes, Warehouse } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Laporan' }
export const revalidate = 0

interface VariantStats {
  total: number
  pickup: number
  delivery: number
}

interface ProductStats {
  total: number
  pickup: number
  delivery: number
  variants: Record<string, VariantStats>
}

export default async function ReportsPage() {
  const supabase = await createAdminClient()

  const [
    { data: salesData },
    { data: productData },
    { data: fulfillmentData },
  ] = await Promise.all([
    supabase.from('orders').select('total_amount,payment_status,created_at').eq('payment_status', 'PAID'),
    supabase.from('order_items').select('item_name_snapshot,variant_name_snapshot,quantity,subtotal,item_type,orders!inner(payment_status,fulfillment_method)').eq('orders.payment_status', 'PAID'),
    supabase.from('orders').select('fulfillment_method').eq('payment_status', 'PAID').neq('order_status', 'CANCELLED'),
  ])

  const totalRevenue = salesData?.reduce((s, o) => s + Number(o.total_amount), 0) ?? 0
  const totalPaidOrders = salesData?.length ?? 0

  // Total items recap across all paid orders
  let totalItemsVendor = 0
  let totalItemsPickup = 0
  let totalItemsDelivery = 0

  // Production Recap (Grouped by Product -> Variant)
  const productRecap: Record<string, ProductStats> = {}

  productData?.forEach(item => {
    const pName = item.item_name_snapshot || 'Unknown Product'
    const vName = item.variant_name_snapshot || 'Tanpa Varian'
    const qty = item.quantity || 0
    const method = (item.orders as any)?.fulfillment_method === 'DELIVERY' ? 'DELIVERY' : 'PICKUP'

    totalItemsVendor += qty
    if (method === 'PICKUP') totalItemsPickup += qty
    else totalItemsDelivery += qty

    if (!productRecap[pName]) {
      productRecap[pName] = { total: 0, pickup: 0, delivery: 0, variants: {} }
    }
    productRecap[pName].total += qty
    if (method === 'PICKUP') productRecap[pName].pickup += qty
    else productRecap[pName].delivery += qty

    if (!productRecap[pName].variants[vName]) {
      productRecap[pName].variants[vName] = { total: 0, pickup: 0, delivery: 0 }
    }
    productRecap[pName].variants[vName].total += qty
    if (method === 'PICKUP') productRecap[pName].variants[vName].pickup += qty
    else productRecap[pName].variants[vName].delivery += qty
  })

  // Fulfillment distribution
  const pickupCount = fulfillmentData?.filter(o => o.fulfillment_method === 'PICKUP').length ?? 0
  const deliveryCount = fulfillmentData?.filter(o => o.fulfillment_method === 'DELIVERY').length ?? 0

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Laporan & Rekapitulasi Produksi</h1>
        <p className="text-gray-500 text-sm">Rekapitulasi total pesanan lunas untuk Vendor Konveksi & Tim Distributor (Stand vs Kirim Alamat)</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-premium p-5 border-l-4 border-emerald-600">
          <TrendingUp className="w-7 h-7 mb-2 text-emerald-600" />
          <div className="font-display font-black text-2xl text-gray-900">{formatRupiah(totalRevenue)}</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Total Omset Terbayar</div>
        </div>

        <div className="card-premium p-5 border-l-4 border-blue-600">
          <Boxes className="w-7 h-7 mb-2 text-blue-600" />
          <div className="font-display font-black text-2xl text-gray-900">{totalItemsVendor.toLocaleString('id-ID')} Pcs</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Total Majmuk Produksi (Vendor)</div>
        </div>

        <div className="card-premium p-5 border-l-4 border-amber-500">
          <Package className="w-7 h-7 mb-2 text-amber-600" />
          <div className="font-display font-black text-2xl text-gray-900">{totalItemsPickup.toLocaleString('id-ID')} Pcs</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Alokasi Stand Bazar ({pickupCount} Order)</div>
        </div>

        <div className="card-premium p-5 border-l-4 border-purple-600">
          <Truck className="w-7 h-7 mb-2 text-purple-600" />
          <div className="font-display font-black text-2xl text-gray-900">{totalItemsDelivery.toLocaleString('id-ID')} Pcs</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Alokasi Kirim Ekspedisi ({deliveryCount} Order)</div>
        </div>
      </div>

      {/* Detailed Production & Distribution Recap Table */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="card-premium p-6 overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-3">
            <div>
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-emerald-700" />
                Rekap Kebutuhan Produksi & Distribusi
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Rincian barang per varian/ukuran khusus vendor konveksi (Total Majmuk) dan pembagian tim distributor (Stand vs Pengiriman).
              </p>
            </div>
            <Link href="/admin/reports/export" className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold font-display transition-colors">
              📥 Download Excel (.xlsx)
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50/80">
                  <th className="py-3 px-3">Nama Produk / Katalog</th>
                  <th className="py-3 px-2">Varian / Ukuran</th>
                  <th className="py-3 px-2 text-center bg-blue-50/50 text-blue-900">Total Majmuk (Vendor)</th>
                  <th className="py-3 px-2 text-center bg-emerald-50/50 text-emerald-900">📦 Ambil Stand</th>
                  <th className="py-3 px-2 text-center bg-purple-50/50 text-purple-900">🚚 Kirim Alamat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {Object.keys(productRecap).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Belum ada pesanan lunas.</td>
                  </tr>
                ) : (
                  Object.entries(productRecap)
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([pName, { total, pickup, delivery, variants }]) => {
                      const vEntries = Object.entries(variants).sort((a, b) => b[1].total - a[1].total)
                      return (
                        <tr key={pName} className="hover:bg-gray-50/50 align-top group transition-colors">
                          <td className="py-4 px-3">
                            <div className="font-display font-bold text-gray-900">{pName}</div>
                            <div className="text-xs text-gray-500 mt-1 space-x-2">
                              <span>Total: <strong className="text-gray-900">{total} pcs</strong></span>
                              <span>• Stand: <strong className="text-emerald-700">{pickup}</strong></span>
                              <span>• Kirim: <strong className="text-purple-700">{delivery}</strong></span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="space-y-1.5">
                              {vEntries.map(([vName]) => (
                                <div key={vName} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                                  {vName}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center font-bold text-blue-950 bg-blue-50/20">
                            <div className="space-y-1.5">
                              {vEntries.map(([vName, vStat]) => (
                                <div key={vName} className="py-1 text-xs font-black">
                                  {vStat.total} pcs
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center font-semibold text-emerald-800 bg-emerald-50/20">
                            <div className="space-y-1.5">
                              {vEntries.map(([vName, vStat]) => (
                                <div key={vName} className="py-1 text-xs">
                                  {vStat.pickup} pcs
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center font-semibold text-purple-800 bg-purple-50/20">
                            <div className="space-y-1.5">
                              {vEntries.map(([vName, vStat]) => (
                                <div key={vName} className="py-1 text-xs">
                                  {vStat.delivery} pcs
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

        {/* Right Sidebar: Distribution Guide & Export */}
        <div className="space-y-5">
          <div className="card-premium p-5 space-y-3">
            <h2 className="font-display font-bold text-gray-900 text-base">Panduan Operasional</h2>
            <div className="space-y-2.5 text-xs leading-relaxed text-gray-600">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-900">
                <span className="font-bold block mb-1">🏭 Vendor Konveksi:</span>
                Gunakan kolom <strong>Total Majmuk</strong> untuk memproses total produksi barang tanpa peduli lokasi pengambilan.
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                <span className="font-bold block mb-1">⛺ Tim Stand Bazar (Ponorogo):</span>
                Gunakan kolom <strong>📦 Ambil Stand</strong> untuk menyortir stok yang harus dibawa langsung ke lokasi Bazar Gontor Pusat.
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-900">
                <span className="font-bold block mb-1">🚚 Tim Pengiriman Kurir:</span>
                Gunakan kolom <strong>🚚 Kirim Alamat</strong> untuk menyiapkan paket pesanan yang akan dikirim via POS / JNE / J&T dll.
              </div>
            </div>
          </div>

          <div className="card-premium p-5 bg-gradient-to-br from-emerald-800 to-green-900 text-white space-y-3">
            <h2 className="font-display font-bold text-base">Unduh Excel Laporan</h2>
            <p className="text-xs opacity-80 leading-relaxed">
              Unduh rekapitulasi data lengkap untuk diserahkan ke vendor konveksi dan tim logistik lapangan.
            </p>
            <Link href="/admin/reports/export"
              className="w-full py-3 px-4 rounded-xl bg-white text-emerald-900 font-display font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-md">
              Unduh File Excel (.xlsx) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

