'use client'

import { useState } from 'react'
import { CreditCard, Plus, Edit } from 'lucide-react'
import { PaymentMethod } from '@/types'
import PaymentMethodModal from './PaymentMethodModal'

interface Props {
  initialMethods: PaymentMethod[]
}

export default function PaymentSettingsClient({ initialMethods }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)

  const handleOpenAdd = () => {
    setSelectedMethod(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Rekening Pembayaran</h1>
          <p className="text-gray-500 text-sm">Kelola rekening bank untuk tujuan transfer pelanggan</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-display font-bold"
        >
          <Plus className="w-4 h-4" />
          Tambah Rekening
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {initialMethods.map(method => (
          <div key={method.id} className="card-premium p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="font-display font-bold text-xs tracking-widest uppercase text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                  {method.bank_name}
                </div>
                {!method.is_active && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500">Nonaktif</span>
                )}
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-400 font-display mb-0.5">Nomor Rekening</div>
                <div className="font-display font-black text-2xl text-gray-900 tracking-widest">
                  {method.account_number}
                </div>
                <div className="text-sm font-semibold text-gray-600 mt-1 font-display">
                  a.n. {method.account_holder}
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-3">
                <button
                  onClick={() => handleOpenEdit(method)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-600"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Rekening
                </button>
              </div>
            </div>
          </div>
        ))}

        {initialMethods.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-400 card-premium">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-display font-semibold">Belum ada rekening pembayaran</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Klik tombol di atas untuk menambah rekening bank pertama</p>
            <button onClick={handleOpenAdd} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
              <Plus className="w-4 h-4" />
              Tambah Rekening
            </button>
          </div>
        )}
      </div>

      <PaymentMethodModal
        key={selectedMethod?.id ?? 'new'}
        initialData={selectedMethod}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
