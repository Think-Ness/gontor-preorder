'use client'

import { useState } from 'react'
import { Edit, UploadCloud } from 'lucide-react'
import EditOrderModal from './EditOrderModal'
import AdminReuploadProofModal from './AdminReuploadProofModal'

interface AdminOrderEditControlsProps {
  order: any
}

export function EditOrderButton({ order }: AdminOrderEditControlsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsEditOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-all border border-emerald-200 shadow-sm"
      >
        <Edit className="w-3.5 h-3.5" />
        Edit Detail Order
      </button>

      <EditOrderModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        order={order}
      />
    </>
  )
}

export function ReuploadProofButton({ orderId, orderNumber, hasExistingProof = false }: { orderId: string; orderNumber: string; hasExistingProof?: boolean }) {
  const [isReuploadOpen, setIsReuploadOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsReuploadOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all border border-blue-200 shadow-sm mt-2"
      >
        <UploadCloud className="w-3.5 h-3.5" />
        {hasExistingProof ? 'Re-upload Bukti' : 'Upload Bukti Pembayaran'}
      </button>

      <AdminReuploadProofModal
        isOpen={isReuploadOpen}
        onClose={() => setIsReuploadOpen(false)}
        orderId={orderId}
        orderNumber={orderNumber}
      />
    </>
  )
}
