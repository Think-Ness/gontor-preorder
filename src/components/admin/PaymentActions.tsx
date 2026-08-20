'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  orderId: string
  orderNumber: string
  currentStatus: string
  currentPaymentStatus: string
}

export default function PaymentActions({ orderId, orderNumber, currentStatus, currentPaymentStatus }: Props) {
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

  const alreadyActioned = ['PAID', 'REJECTED', 'COMPLETED', 'CANCELLED'].includes(currentPaymentStatus)

  if (alreadyActioned) {
    return (
      <div className="card-premium p-5 bg-gray-50">
        <p className="text-sm text-gray-500 text-center font-semibold">
          Pembayaran sudah {currentPaymentStatus === 'PAID' ? 'disetujui ✓' : 'ditolak ✕'}
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
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
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
            ✓ Approve
          </button>

          <button
            onClick={() => setShowRejectForm(true)}
            disabled={!!loading}
            className="py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            ✕ Reject
          </button>

          <button
            onClick={() => doAction('NEEDS_REVIEW')}
            disabled={!!loading}
            className="py-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-100 disabled:opacity-50"
          >
            {loading === 'NEEDS_REVIEW' ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            ⚠ Needs Review
          </button>

          <button
            onClick={() => doAction('REQUEST_REUPLOAD')}
            disabled={!!loading}
            className="py-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 disabled:opacity-50"
          >
            {loading === 'REQUEST_REUPLOAD' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            ↻ Re-upload
          </button>
        </div>
      )}
    </div>
  )
}
