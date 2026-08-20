import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Eye, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = { title: 'Verifikasi Pembayaran' }
export const revalidate = 0

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ selected?: string }>
}) {
  const params = await searchParams
  const supabase = await createAdminClient()

  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('id,order_number,full_name,total_amount,payment_status,payment_proof_file_id,created_at')
    .in('order_status', ['PAYMENT_REVIEW', 'PROOF_UPLOADED'])
    .order('created_at', { ascending: true })

  const selectedId = params.selected ?? pendingOrders?.[0]?.id
  const selected = pendingOrders?.find(o => o.id === selectedId)

  let selectedDetail: any = null
  if (selectedId) {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', selectedId)
      .single()
    selectedDetail = data
  }

  return (
    <div className="max-w-7xl space-y-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-6 h-6" style={{ color: 'var(--gontor-green)' }} />
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Payment Verification Center</h1>
          <p className="text-gray-500 text-sm">{pendingOrders?.length ?? 0} order menunggu verifikasi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ minHeight: '600px' }}>
        {/* Left: Pending list */}
        <div className="card-premium overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-display font-bold text-sm text-gray-700">Menunggu Verifikasi</h2>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto" style={{ maxHeight: '600px' }}>
            {(pendingOrders ?? []).map(order => (
              <Link
                key={order.id}
                href={`/admin/payments?selected=${order.id}`}
                className={`flex items-center gap-3 px-5 py-4 transition-colors ${
                  selectedId === order.id ? 'bg-green-50 border-l-2 border-green-500' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-sm text-gray-900">{order.order_number}</div>
                  <div className="text-xs text-gray-500">{order.full_name}</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--gontor-green)' }}>
                    {formatRupiah(Number(order.total_amount))}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleDateString('id-ID')}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            ))}
            {(pendingOrders ?? []).length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-display font-semibold text-sm">Tidak ada order yang perlu diverifikasi</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail */}
        <div className="card-premium overflow-hidden">
          {selectedDetail ? (
            <div className="flex flex-col h-full">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-sm text-gray-900">{selectedDetail.order_number}</div>
                  <div className="text-xs text-gray-500">{selectedDetail.full_name}</div>
                </div>
                <Link href={`/admin/orders/${selectedDetail.order_number}`}
                  className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700">
                  <Eye className="w-3.5 h-3.5" />
                  Detail Lengkap
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Expected amount */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Expected</div>
                    <div className="font-display font-bold" style={{ color: 'var(--gontor-green)' }}>
                      {formatRupiah(Number(selectedDetail.total_amount))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Fulfillment</div>
                    <div className="font-semibold text-gray-700">
                      {selectedDetail.fulfillment_method === 'PICKUP' ? '📦 Pickup' : '🚚 Delivery'}
                    </div>
                  </div>
                </div>

                {/* Payment proof image */}
                {selectedDetail.payment_proof_file_id && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">Bukti Pembayaran</div>
                    <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <Image
                        src={`/api/drive/preview/${selectedDetail.payment_proof_file_id}`}
                        alt="Bukti pembayaran"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{selectedDetail.payment_proof_filename}</p>
                  </div>
                )}

                {/* Items summary */}
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-2">Item Pesanan</div>
                  <div className="space-y-1.5">
                    {(selectedDetail.items ?? []).map((item: any) => (
                      <div key={item.id} className="flex justify-between text-xs text-gray-600">
                        <span>{item.item_name_snapshot}{item.variant_name_snapshot ? ` — ${item.variant_name_snapshot}` : ''} ×{item.quantity}</span>
                        <span className="font-semibold">{formatRupiah(Number(item.subtotal))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  <Link href={`/admin/orders/${selectedDetail.order_number}`}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-display font-bold text-sm">
                    Buka & Ambil Keputusan
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm p-10 text-center">
              <div>
                <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-display font-semibold">Pilih order dari daftar kiri</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
