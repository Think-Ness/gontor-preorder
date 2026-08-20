'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  orderId: string
  orderNumber: string
  currentStatus: string
  currentPaymentStatus: string
  fulfillmentMethod?: 'PICKUP' | 'DELIVERY'
}

export default function PaymentActions({
  orderId,
  orderNumber,
  currentStatus,
  currentPaymentStatus,
  fulfillmentMethod,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const router = useRouter()

  const doAction = async (action: string, adminNote?: string) => {
    setLoading(action)
    try {
      const res = await fetch(`/api/admin/payments/${orderId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, admin_note: adminNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal')
    } finally {
      setLoading(null)
      setShowRejectForm(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui status')
    } finally {
      setLoading(null)
    }
  }

  // If payment is already approved, show Order Status Progress Management
  if (currentPaymentStatus === 'PAID') {
    const statuses = [
      { id: 'PROCESSING', label: 'Sedang Diproses', desc: 'Pesanan sedang disiapkan panitia' },
      { id: 'READY_FOR_PICKUP', label: 'Siap Diambil di Stand', desc: 'Merchandise dapat diambil di stand acara' },
      { id: 'SHIPPED', label: 'Dalam Pengiriman', desc: 'Pesanan telah diserahkan ke ekspedisi/kurir' },
      { id: 'COMPLETED', label: 'Pesanan Selesai', desc: 'Merchandise telah diserahterimakan' },
    ]

    return (
      <div className="card-premium p-6 space-y-4 bg-white border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-gray-900 text-base">Perbarui Status Progres Pesanan</h2>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-700" />
              Pembayaran Disetujui
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Ubah status pesanan di bawah ini. Email notifikasi otomatis akan langsung dikirim ke pemesan setiap kali status diubah.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {statuses.map(st => {
            const isActive = currentStatus === st.id
            const isPending = loading === st.id

            return (
              <button
                key={st.id}
                onClick={() => updateOrderStatus(st.id)}
                disabled={isActive || !!loading}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-green-50 border-green-500 text-green-900 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-green-300 text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-display font-bold text-sm">{st.label}</span>
                  {isActive && (
                    <span className="text-[10px] bg-green-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                  {isPending && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
                </div>
                <span className="text-xs text-gray-500">{st.desc}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (currentPaymentStatus === 'REJECTED') {
    return (
      <div className="card-premium p-5 bg-red-50 border border-red-200">
        <p className="text-sm text-red-700 text-center font-semibold flex items-center justify-center gap-1.5">
          <XCircle className="w-4 h-4 text-red-600" />
          Pembayaran ditolak (Memerlukan upload ulang bukti dari pembeli)
        </p>
      </div>
    )
  }

  return (
    <div className="card-premium p-5 space-y-4">
      <h2 className="font-display font-bold text-gray-900">Keputusan Pembayaran</h2>

      {showRejectForm ? (
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Alasan penolakan (wajib diisi)..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400 font-display"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { if (!note.trim()) { alert('Alasan wajib diisi'); return; } doAction('REJECT', note) }}
              disabled={loading === 'REJECT'}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white font-display font-bold text-sm flex items-center justify-center gap-2"
            >
              {loading === 'REJECT' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Tolak Pembayaran
            </button>
            <button onClick={() => setShowRejectForm(false)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => doAction('APPROVE')}
            disabled={!!loading}
            className="py-3 rounded-xl bg-green-600 text-white font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
          >
            {loading === 'APPROVE' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve (ACC)
          </button>

          <button
            onClick={() => setShowRejectForm(true)}
            disabled={!!loading}
            className="py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Tolak Pembayaran
          </button>

          <button
            onClick={() => doAction('NEEDS_REVIEW')}
            disabled={!!loading}
            className="py-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-100 disabled:opacity-50"
          >
            {loading === 'NEEDS_REVIEW' ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            Needs Review
          </button>

          <button
            onClick={() => doAction('REQUEST_REUPLOAD')}
            disabled={!!loading}
            className="py-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 disabled:opacity-50"
          >
            {loading === 'REQUEST_REUPLOAD' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Re-upload Bukti
          </button>
        </div>
      )}
    </div>
  )
}
