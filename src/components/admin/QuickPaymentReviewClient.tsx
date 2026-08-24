'use client'

import { useState } from 'react'
import {
  ShieldCheck, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Loader2, Eye, ChevronRight, MessageCircle, ExternalLink, Package, MapPin, User, Truck
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { broadcastOrderUpdate } from '@/lib/realtime'
import Link from 'next/link'

export interface OrderPending {
  id: string
  order_number: string
  full_name: string
  stambuk: string
  whatsapp: string
  district: string
  generation_year: number
  fulfillment_method: 'PICKUP' | 'DELIVERY'
  shipping_address?: string
  total_amount: number
  subtotal: number
  shipping_cost: number
  payment_status: string
  order_status: string
  payment_proof_file_id?: string | null
  payment_proof_filename?: string | null
  created_at: string
  items?: Array<{
    id: string
    item_name_snapshot: string
    variant_name_snapshot?: string | null
    unit_price_snapshot: number
    quantity: number
    subtotal: number
  }>
}

interface Props {
  pendingOrders: OrderPending[]
  initialSelectedId?: string
}

export function formatWaLink(phone: string, orderNumber: string, name: string) {
  let cleaned = (phone || '').replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  }
  const text = encodeURIComponent(`Halo Kak ${name}, mengenai pesanan ${orderNumber} Gontor 100 Tahun...`)
  return `https://wa.me/${cleaned}?text=${text}`
}

export default function QuickPaymentReviewClient({ pendingOrders, initialSelectedId }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || pendingOrders[0]?.id || ''
  )
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null) // action type ('REJECT' | 'REQUEST_REUPLOAD')

  const selectedOrder = pendingOrders.find(o => o.id === selectedId) || pendingOrders[0]

  const handleAction = async (orderId: string, action: string, adminNote?: string) => {
    setLoadingAction(action)
    try {
      const res = await fetch(`/api/admin/payments/${orderId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, admin_note: adminNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memproses keputusan')

      // Find next order in list
      const currentIndex = pendingOrders.findIndex(o => o.id === orderId)
      const nextOrder = pendingOrders[currentIndex + 1] || pendingOrders[currentIndex - 1]
      
      if (nextOrder) {
        setSelectedId(nextOrder.id)
      } else {
        setSelectedId('')
      }

      broadcastOrderUpdate()
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal memproses keputusan')
    } finally {
      setLoadingAction(null)
      setShowRejectModal(null)
      setRejectNote('')
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-700" />
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Verifikasi Bukti Pembayaran</h1>
            <p className="text-gray-500 text-sm">
              {pendingOrders.length} order menunggu konfirmasi verifikasi panitia
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" style={{ minHeight: '650px' }}>
        {/* Left Column: List of Pending Orders (4 cols) */}
        <div className="lg:col-span-4 card-premium overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-display font-bold text-xs uppercase tracking-wider text-gray-700">
              Antrean Verifikasi ({pendingOrders.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto flex-1 max-h-[650px]">
            {pendingOrders.map(order => {
              const isActive = selectedOrder?.id === order.id
              const waUrl = formatWaLink(order.whatsapp, order.order_number, order.full_name)

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedId(order.id)}
                  className={`p-4 transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-green-50 border-l-4 border-green-600 shadow-inner'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display font-bold text-sm text-gray-900 truncate">
                        {order.order_number}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{order.full_name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-green-800 font-display">
                        {formatRupiah(Number(order.total_amount))}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')} WIB
                      </span>
                    </div>
                  </div>

                  {/* WA Quick Link Button */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors flex-shrink-0"
                    title="Chat via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              )
            })}

            {pendingOrders.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20 text-green-600" />
                <p className="font-display font-bold text-sm text-gray-600">Semua Bukti Telah Diverifikasi!</p>
                <p className="text-xs text-gray-400 mt-1">Tidak ada antrean verifikasi pembayaran saat ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Verification Panel & Direct Action (8 cols) */}
        <div className="lg:col-span-8 card-premium overflow-hidden flex flex-col">
          {selectedOrder ? (
            <div className="flex flex-col h-full">
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display font-black text-xl text-gray-900">{selectedOrder.order_number}</h2>
                    {/* WhatsApp Clickable Badge */}
                    <a
                      href={formatWaLink(selectedOrder.whatsapp, selectedOrder.order_number, selectedOrder.full_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-600 text-white text-xs font-display font-bold hover:bg-green-700 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WA: {selectedOrder.whatsapp}
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedOrder.full_name} — Stambuk: {selectedOrder.stambuk} ({selectedOrder.district})
                  </p>
                </div>

                <Link
                  href={`/admin/orders/${selectedOrder.order_number}`}
                  className="flex items-center gap-1 text-xs font-display font-bold text-green-700 hover:text-green-900 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Detail Order Lengkap
                </Link>
              </div>

              {/* Card Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Top Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50/60 border border-green-100 rounded-xl p-4">
                    <span className="text-xs text-green-700 font-semibold uppercase tracking-wider font-display">Total Nominal Pembayaran</span>
                    <p className="font-display font-black text-2xl text-green-900 mt-1">
                      {formatRupiah(Number(selectedOrder.total_amount))}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-display">Metode Pengiriman</span>
                    <p className="font-display font-bold text-base text-gray-800 mt-1 flex items-center gap-1.5">
                      {selectedOrder.fulfillment_method === 'PICKUP' ? (
                        <span className="flex items-center gap-1.5 text-green-800"><Package className="w-4 h-4 text-green-700" /> Ambil di Stand Acara</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-blue-800"><Truck className="w-4 h-4 text-blue-600" /> Dikirim ke Alamat Rumah</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Proof Image Box */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-bold text-sm text-gray-800">Foto Bukti Pembayaran</span>
                    {selectedOrder.payment_proof_file_id && (
                      <a
                        href={`/api/drive/preview/${selectedOrder.payment_proof_file_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-green-700 hover:underline flex items-center gap-1"
                      >
                        Buka Gambar Ukuran Penuh
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {selectedOrder.payment_proof_file_id ? (
                    <div className="relative aspect-[16/10] max-h-[380px] bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 shadow-inner group">
                      <Image
                        src={`/api/drive/preview/${selectedOrder.payment_proof_file_id}`}
                        alt="Bukti Pembayaran"
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
                      Bukti transfer belum di-upload oleh pembeli
                    </div>
                  )}
                  {selectedOrder.payment_proof_filename && (
                    <p className="text-xs text-gray-400 mt-1.5">Nama file: {selectedOrder.payment_proof_filename}</p>
                  )}
                </div>

                {/* Items Summary */}
                <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100">
                  <span className="font-display font-bold text-xs text-gray-700 uppercase tracking-wider block mb-2">Rincian Item Pesanan</span>
                  <div className="space-y-1.5">
                    {(selectedOrder.items ?? []).map(item => (
                      <div key={item.id} className="flex justify-between text-xs text-gray-700 font-medium">
                        <span>
                          {item.item_name_snapshot}
                          {item.variant_name_snapshot ? ` (${item.variant_name_snapshot})` : ''}
                          {' × '}{item.quantity}
                        </span>
                        <span className="font-bold text-gray-900">{formatRupiah(Number(item.subtotal))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Direct Decision Action Panel */}
              <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-gray-900">Keputusan Verifikasi Bukti Transfer:</span>
                  <span className="text-xs text-gray-500">Setelah diklik, sistem akan otomatis lanjut ke pesanan berikutnya</span>
                </div>

                {/* Decision Form Modal / Input for Reject / Reupload */}
                {showRejectModal ? (
                  <div className="space-y-3 p-4 bg-white rounded-xl border border-amber-200 shadow-md">
                    <p className="text-xs font-bold text-amber-900">
                      {showRejectModal === 'REJECT' ? 'Alasan Penolakan Pembayaran:' : 'Alasan Meminta Upload Ulang:'}
                    </p>
                    <textarea
                      value={rejectNote}
                      onChange={e => setRejectNote(e.target.value)}
                      placeholder="Tulis alasan untuk pembeli (akan terkirim di email)..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 outline-none focus:border-green-600 font-display"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(selectedOrder.id, showRejectModal, rejectNote)}
                        disabled={!!loadingAction}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-display font-bold text-white flex items-center justify-center gap-2 ${
                          showRejectModal === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Kirim & Lanjut Pesanan Berikutnya
                      </button>
                      <button
                        onClick={() => setShowRejectModal(null)}
                        className="px-4 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* 1. APPROVE Button */}
                    <button
                      onClick={() => handleAction(selectedOrder.id, 'APPROVE')}
                      disabled={!!loadingAction}
                      className="py-3.5 px-4 min-h-[44px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-display font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {loadingAction === 'APPROVE' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4.5 h-4.5" />
                      )}
                      Approve (ACC)
                    </button>

                    {/* 2. RE-UPLOAD Button */}
                    <button
                      onClick={() => setShowRejectModal('REQUEST_REUPLOAD')}
                      disabled={!!loadingAction}
                      className="py-3.5 px-3 min-h-[44px] rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Re-upload Bukti
                    </button>

                    {/* 3. NEEDS REVIEW Button */}
                    <button
                      onClick={() => handleAction(selectedOrder.id, 'NEEDS_REVIEW')}
                      disabled={!!loadingAction}
                      className="py-3.5 px-3 min-h-[44px] rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Needs Review
                    </button>

                    {/* 4. REJECT Button */}
                    <button
                      onClick={() => setShowRejectModal('REJECT')}
                      disabled={!!loadingAction}
                      className="py-3.5 px-3 min-h-[44px] rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak Pembayaran
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center text-gray-400">
              <ShieldCheck className="w-16 h-16 mb-4 text-gray-200" />
              <p className="font-display font-bold text-base text-gray-700">Pilih Pesanan dari Daftar Antrean</p>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Klik salah satu order di sebelah kiri untuk melihat foto bukti pembayaran dan memberikan keputusan verifikasi instan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
