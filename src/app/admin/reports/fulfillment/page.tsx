import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { Truck, Package, CheckCircle, Clock, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Laporan Fulfillment' }
export const revalidate = 0

export default async function FulfillmentReportPage() {
  const supabase = await createAdminClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, full_name, stambuk, whatsapp, fulfillment_method, shipping_address, shipping_city, shipping_province, shipping_cost, order_status, payment_status, created_at')
    .neq('order_status', 'CANCELLED')
    .order('created_at', { ascending: false })

  const allOrders = orders ?? []
  const pickupOrders = allOrders.filter(o => o.fulfillment_method === 'PICKUP')
  const deliveryOrders = allOrders.filter(o => o.fulfillment_method === 'DELIVERY')

  const readyPickup = pickupOrders.filter(o => o.order_status === 'READY_FOR_PICKUP')
  const shippedDelivery = deliveryOrders.filter(o => o.order_status === 'SHIPPED')
  const completedCount = allOrders.filter(o => o.order_status === 'COMPLETED').length
  const processingCount = allOrders.filter(o => o.order_status === 'PROCESSING').length

  const totalShippingFee = deliveryOrders.reduce((sum, o) => sum + Number(o.shipping_cost || 0), 0)

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Laporan Fulfillment</h1>
        <p className="text-gray-500 text-sm">Status penyerahan barang (Ambil Mandiri di Stand vs Pengiriman Alamat)</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-premium p-5 border-l-4 border-green-600">
          <Package className="w-7 h-7 mb-2 text-green-700" />
          <div className="font-display font-black text-2xl text-gray-900">{pickupOrders.length}</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Ambil di Stand (Pickup)</div>
        </div>

        <div className="card-premium p-5 border-l-4 border-blue-600">
          <Truck className="w-7 h-7 mb-2 text-blue-600" />
          <div className="font-display font-black text-2xl text-gray-900">{deliveryOrders.length}</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Kirim ke Alamat (Delivery)</div>
        </div>

        <div className="card-premium p-5 border-l-4 border-purple-600">
          <Clock className="w-7 h-7 mb-2 text-purple-600" />
          <div className="font-display font-black text-2xl text-gray-900">{processingCount}</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Sedang Dalam Proses</div>
        </div>

        <div className="card-premium p-5 border-l-4 border-amber-500">
          <CheckCircle className="w-7 h-7 mb-2 text-amber-600" />
          <div className="font-display font-black text-2xl text-gray-900">{completedCount}</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Selesai Diserahterimakan</div>
        </div>
      </div>

      {/* Fulfillment Status Comparison & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pickup Orders Ready */}
        <div className="card-premium p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
              <h2 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-700" />
                Daftar Siap Diambil di Stand ({readyPickup.length})
              </h2>
              <Link href="/admin/orders?status=READY_FOR_PICKUP" className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {readyPickup.map(o => (
                <div key={o.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-display font-bold text-gray-900">{o.order_number}</span>
                    <p className="text-gray-600 font-semibold">{o.full_name} (Stambuk: {o.stambuk})</p>
                  </div>
                  <Link href={`/admin/orders/${o.order_number}`} className="px-2.5 py-1 rounded-lg bg-green-100 text-green-800 font-bold hover:bg-green-200">
                    Proses
                  </Link>
                </div>
              ))}
              {readyPickup.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8">Belum ada pesanan berstatus Siap Diambil</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipped Delivery Orders */}
        <div className="card-premium p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
              <h2 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Pesanan Dalam Pengiriman ({shippedDelivery.length})
              </h2>
              <Link href="/admin/orders?status=SHIPPED" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {shippedDelivery.map(o => (
                <div key={o.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-display font-bold text-gray-900">{o.order_number}</span>
                    <p className="text-gray-600 font-semibold">{o.full_name}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{o.shipping_address}, {o.shipping_city}</p>
                  </div>
                  <Link href={`/admin/orders/${o.order_number}`} className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold hover:bg-blue-200">
                    Proses
                  </Link>
                </div>
              ))}
              {shippedDelivery.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8">Belum ada pesanan berstatus Dalam Pengiriman</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
