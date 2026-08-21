'use client'

import { useState } from 'react'
import { Trash2, X, AlertTriangle, Send } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
  onConfirm: () => void
}

export default function DeleteOrderModal({ isOpen, onClose, order, onConfirm }: DeleteOrderModalProps) {
  const [customMessage, setCustomMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen || !order) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customMessage }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus pesanan')

      toast.success('Pesanan berhasil dihapus')
      if (customMessage.trim()) {
        toast.success('Email pembatalan berhasil dikirim ke pelanggan')
      }
      
      onConfirm()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-red-900">Hapus Pesanan</h2>
              <p className="text-xs font-semibold text-red-700/80">#{order.order_number} - {order.full_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-sm leading-relaxed">
              <strong>Peringatan!</strong> Tindakan ini akan menghapus pesanan secara permanen dari database. Tindakan ini tidak dapat dibatalkan.
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Kirim Notifikasi Email Pembatalan? <span className="text-gray-400 font-normal">(Opsional)</span>
            </label>
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
              Jika Anda ingin memberitahu pelanggan mengapa pesanan ini dihapus/dibatalkan, silakan ketik pesan di bawah ini. Email akan otomatis dikirim ke <strong>{order.email}</strong>. Jika dikosongkan, pesanan akan dihapus tanpa mengirim email.
            </p>
            <textarea
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              placeholder="Contoh: Pesanan Anda dibatalkan karena tidak ada pembayaran yang diterima setelah batas waktu yang ditentukan."
              rows={4}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              'Menghapus...'
            ) : (
              <>
                {customMessage.trim() ? <Send className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                {customMessage.trim() ? 'Hapus & Kirim Email' : 'Hapus Saja'}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
