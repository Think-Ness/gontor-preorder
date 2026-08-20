import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import PaymentActions from '@/components/admin/PaymentActions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, User, MapPin, Package, CreditCard, MessageCircle, Truck } from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = { title: 'Detail Order' }

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const supabase = await createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('order_number', orderNumber)
    .single()

  if (!order) notFound()

  const proofPreviewUrl = order.payment_proof_file_id
    ? `/api/drive/preview/${order.payment_proof_file_id}`
    : null

  const statusCls: Record<string, string> = {
    PAYMENT_REVIEW: 'badge-review', PAID: 'badge-paid',
    PROCESSING: 'bg-blue-50 text-blue-700', READY_FOR_PICKUP: 'bg-purple-50 text-purple-700',
    SHIPPED: 'bg-indigo-50 text-indigo-700', COMPLETED: 'badge-paid',
    REJECTED: 'badge-rejected', CANCELLED: 'badge-unpaid',
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-xl text-gray-900">{order.order_number}</h1>
          <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${statusCls[order.order_status] ?? 'badge-unpaid'}`}>
            {order.order_status.replace(/_/g, ' ')}
          </span>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${statusCls[order.payment_status] ?? 'badge-unpaid'}`}>
            {order.payment_status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Info */}
        <div className="card-premium p-5">
          <h2 className="font-display font-bold text-sm text-gray-700 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Data Pemesan
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-20 flex-shrink-0">Stambuk</dt>
              <dd className="font-semibold text-gray-800">{order.stambuk}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-20 flex-shrink-0">Nama</dt>
              <dd className="font-semibold text-gray-800">{order.full_name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-20 flex-shrink-0">Daerah</dt>
              <dd className="font-semibold text-gray-800">{order.district}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-20 flex-shrink-0">Angkatan</dt>
              <dd className="font-semibold text-gray-800">{order.generation_year}</dd>
            </div>
            <div className="flex gap-2 items-center">
              <dt className="text-gray-500 w-20 flex-shrink-0">WhatsApp</dt>
              <dd className="font-semibold text-gray-800 flex items-center gap-2">
                <span>{order.whatsapp}</span>
                <a
                  href={`https://wa.me/${order.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Halo Kak ${order.full_name}, mengenai pesanan ${order.order_number} Gontor 100 Tahun...`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white font-bold transition-all shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat WA
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Fulfillment */}
        <div className="card-premium p-5">
          <h2 className="font-display font-bold text-sm text-gray-700 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Pengiriman
          </h2>
          <div className="text-sm">
            <div className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              {order.fulfillment_method === 'PICKUP' ? (
                <span className="flex items-center gap-1.5 text-green-800"><Package className="w-4 h-4 text-green-700" /> Ambil di Stand</span>
              ) : (
                <span className="flex items-center gap-1.5 text-blue-800"><Truck className="w-4 h-4 text-blue-600" /> Kirim ke Rumah</span>
              )}
            </div>
            {order.fulfillment_method === 'DELIVERY' && (
              <div className="text-gray-600 space-y-1">
                <p>{order.shipping_address}</p>
                <p>{order.shipping_village}, {order.shipping_district}</p>
                <p>{order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="card-premium p-5">
          <h2 className="font-display font-bold text-sm text-gray-700 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Item Pesanan
          </h2>
          <div className="space-y-2">
            {(order.items ?? []).map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-800">{item.item_name_snapshot}</span>
                  {item.variant_name_snapshot && <span className="text-gray-500"> — {item.variant_name_snapshot}</span>}
                  <span className="text-gray-400"> ×{item.quantity}</span>
                </div>
                <span className="font-semibold text-gray-800">{formatRupiah(Number(item.subtotal))}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatRupiah(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ongkir</span>
              <span>{Number(order.shipping_cost) === 0 ? 'Gratis' : formatRupiah(Number(order.shipping_cost))}</span>
            </div>
            <div className="flex justify-between font-display font-bold">
              <span>Total</span>
              <span style={{ color: 'var(--gontor-green)' }}>{formatRupiah(Number(order.total_amount))}</span>
            </div>
          </div>
        </div>

        {/* Payment Proof */}
        <div className="card-premium p-5">
          <h2 className="font-display font-bold text-sm text-gray-700 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Bukti Pembayaran
          </h2>
          {proofPreviewUrl ? (
            <div className="space-y-3">
              <div className="relative aspect-video bg-gray-50 rounded-xl overflow-hidden">
                <Image src={proofPreviewUrl} alt="Bukti pembayaran" fill className="object-contain" unoptimized />
              </div>
              <p className="text-xs text-gray-500">{order.payment_proof_filename}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              Bukti pembayaran belum diupload
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      <PaymentActions
        orderId={order.id}
        orderNumber={order.order_number}
        currentStatus={order.order_status}
        currentPaymentStatus={order.payment_status}
        fulfillmentMethod={order.fulfillment_method}
      />

      {order.admin_note && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm font-semibold text-yellow-800 mb-1">Catatan Admin</p>
          <p className="text-sm text-yellow-700">{order.admin_note}</p>
        </div>
      )}
    </div>
  )
}
