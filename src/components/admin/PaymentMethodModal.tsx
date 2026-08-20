'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Loader2, Plus, X } from 'lucide-react'
import { PaymentMethod } from '@/types'

interface Props {
  initialData?: PaymentMethod | null
  isOpen: boolean
  onClose: () => void
}

export default function PaymentMethodModal({ initialData, isOpen, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    bank_name: initialData?.bank_name ?? 'BSI (Bank Syariah Indonesia)',
    account_number: initialData?.account_number ?? '',
    account_holder: initialData?.account_holder ?? '',
    is_active: initialData?.is_active ?? true,
    display_order: initialData?.display_order ?? 0,
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.bank_name || !form.account_number || !form.account_holder) {
      setError('Mohon isi semua field')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/settings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: initialData?.id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan rekening')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 font-display font-bold text-lg text-gray-900">
            <CreditCard className="w-5 h-5 text-green-600" />
            {initialData ? 'Edit Rekening' : 'Tambah Rekening Pembayaran'}
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Nama Bank / E-Wallet *</label>
            <input
              value={form.bank_name}
              onChange={e => setForm(p => ({ ...p, bank_name: e.target.value }))}
              placeholder="Contoh: BSI, Bank Mandiri, BCA"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Nomor Rekening *</label>
            <input
              value={form.account_number}
              onChange={e => setForm(p => ({ ...p, account_number: e.target.value.replace(/\s+/g, '') }))}
              placeholder="7123456789"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Nama Pemilik Rekening (a.n.) *</label>
            <input
              value={form.account_holder}
              onChange={e => setForm(p => ({ ...p, account_holder: e.target.value }))}
              placeholder="Panitia 100 Tahun Gontor"
              required
              className={inputCls}
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm font-semibold text-gray-700 font-display">Status Rekening Aktif</span>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_active ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="w-1/3 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">
              Batal
            </button>
            <button type="submit" disabled={loading} className="w-2/3 btn-primary py-3 font-display font-bold flex items-center justify-center gap-2 text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Menyimpan...' : 'Simpan Rekening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
