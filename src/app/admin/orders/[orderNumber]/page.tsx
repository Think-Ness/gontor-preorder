import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import PaymentActions from '@/components/admin/PaymentActions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MapPin, Package, Truck, User, MessageCircle, CreditCard, Mail } from 'lucide-react'
import OrderRowActions from '@/components/admin/OrderRowActions'
import Image from 'next/image'
import { EditOrderButton, ReuploadProofButton } from '@/components/admin/AdminOrderEditControls'

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-xl text-gray-900">{order.order_number}</h1>
            <p className="text-gray-500 text-sm font-medium">
              {new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} &bull; Pukul {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')} WIB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${statusCls[order.order_status] ?? 'badge-unpaid'}`}>
            {order.order_status.replace(/_/g, ' ')}
          </span>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${statusCls[order.payment_status] ?? 'badge-unpaid'}`}>
            {order.payment_status}
          </span>
          <EditOrderButton order={order} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Info */}
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-sm text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Data Pemesan
            </h2>
            <EditOrderButton order={order} />
          </div>
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
            <div className="flex gap-2 items-center">
              <dt className="text-gray-500 w-20 flex-shrink-0">Email</dt>
              <dd className="font-semibold text-gray-800 flex items-center gap-2 break-all">
                <span>{order.email || '-'}</span>
                {order.email && (
                  <a
                    href={`mailto:${order.email}`}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all border border-gray-200"
                    title="Kirim Email"
                  >
                    <Mail className="w-3.5 h-3.5 text-gray-600" />
                    Email
                  </a>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Fulfillment */}
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-sm text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Pengiriman
            </h2>
            <EditOrderButton order={order} />
          </div>
          <div className="text-sm space-y-3">
            <div className="font-semibold text-gray-800 flex items-center gap-1.5">
              {order.fulfillment_method === 'PICKUP' ? (
                <span className="flex items-center gap-1.5 text-green-800 bg-green-50 border border-green-200 px-3 py-1 rounded-full text-xs font-bold">
                  <Package className="w-4 h-4 text-green-700" /> Ambil di Stand
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                  <Truck className="w-4 h-4 text-blue-600" /> Kirim ke Rumah
                </span>
              )}
            </div>

            {/* Address Details */}
            {(order.shipping_address || order.shipping_city || order.shipping_province || order.district) ? (
              <div className="text-gray-700 space-y-1 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 text-xs sm:text-sm">
                <p className="font-bold text-gray-800 flex items-center gap-1.5 mb-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-green-700" /> Alamat Pemesan:
                </p>
                {order.shipping_address && <p className="font-medium text-gray-900">{order.shipping_address}</p>}
                <p className="text-gray-600">
                  {[
                    order.shipping_village,
                    order.shipping_district || order.district,
                    order.shipping_city,
                    order.shipping_province,
                    order.shipping_postal_code
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Alamat pengiriman tidak terdaftar.</p>
            )}

            {order.fulfillment_method === 'DELIVERY' && (
              <div className="pt-2 border-t border-gray-100">
                <OrderRowActions order={order} />
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
        <div className="card-premium p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-sm text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Bukti Pembayaran
              </h2>
            </div>
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
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
            <ReuploadProofButton
              orderId={order.id}
              orderNumber={order.order_number}
              hasExistingProof={!!order.payment_proof_file_id}
            />
          </div>
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
