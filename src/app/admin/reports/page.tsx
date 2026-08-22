import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { TrendingUp, ShoppingBag, Truck, Package, Boxes } from 'lucide-react'
import Link from 'next/link'
import ReportsTabbedView from '@/components/admin/ReportsTabbedView'

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
        <h1 className="font-display font-bold text-2xl text-gray-900">Laporan & Rekapitulasi Barang</h1>
        <p className="text-gray-500 text-sm">Rekapitulasi pesanan lunas per kategori khusus Vendor Konveksi & Tim Distributor (Stand vs Kirim Alamat)</p>
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

      {/* Interactive Tabbed Production & Distribution View */}
      <ReportsTabbedView productRecap={productRecap} />
    </div>
  )
}

