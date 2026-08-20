'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, CustomerFormData } from '@/lib/validations/schemas'
import { CheckoutDraft } from '@/types'
import { normalizeWhatsApp } from '@/lib/utils'
import { ChevronRight, User } from 'lucide-react'

interface Props {
  draft: CheckoutDraft | null
  onSave: (data: Partial<CheckoutDraft>) => void
}

export default function StepCustomer({ draft, onSave }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      stambuk: draft?.stambuk || '',
      full_name: draft?.name || '',
      district: draft?.district || '',
      generation_year: draft?.generationYear ? Number(draft.generationYear) : undefined,
      whatsapp: draft?.whatsapp || '',
    },
  })

  const onSubmit = (data: CustomerFormData) => {
    const normalized = normalizeWhatsApp(data.whatsapp)
    onSave({
      stambuk: data.stambuk,
      name: data.full_name,
      district: data.district,
      generationYear: String(data.generation_year),
      whatsapp: normalized,
    })
  }

  const inputCls = (err?: { message?: string }) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-body ${
      err
        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200'
        : 'border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
    }`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(13,74,43,0.1)' }}>
          <User className="w-6 h-6" style={{ color: 'var(--gontor-green)' }} />
        </div>
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--gontor-green-dark)' }}>Data Pemesan</h2>
        <p className="text-sm text-gray-500 mt-1">Isi data diri Anda sebagai alumni Gontor</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        {/* Stambuk */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
            Stambuk <span className="text-red-400">*</span>
          </label>
          <input {...register('stambuk')} placeholder="Nomor stambuk Anda" className={inputCls(errors.stambuk)} />
          {errors.stambuk && <p className="text-xs text-red-500 mt-1">{errors.stambuk.message}</p>}
        </div>

        {/* Nama */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
            Nama Lengkap <span className="text-red-400">*</span>
          </label>
          <input {...register('full_name')} placeholder="Nama lengkap sesuai KTP" className={inputCls(errors.full_name)} />
          {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
        </div>

        {/* Daerah */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
            Daerah <span className="text-red-400">*</span>
          </label>
          <input {...register('district')} placeholder="Kota/Kabupaten tempat tinggal saat ini" className={inputCls(errors.district)} />
          {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
        </div>

        {/* Angkatan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
            Angkatan <span className="text-red-400">*</span>
          </label>
          <input
            {...register('generation_year', { valueAsNumber: true })}
            type="number"
            placeholder="Tahun kelulusan, contoh: 2005"
            min={1926}
            max={2026}
            className={inputCls(errors.generation_year)}
          />
          {errors.generation_year && <p className="text-xs text-red-500 mt-1">{errors.generation_year.message}</p>}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
            Nomor HP / WhatsApp Aktif <span className="text-red-400">*</span>
          </label>
          <input
            {...register('whatsapp')}
            type="tel"
            placeholder="08xxxxxxxxxx atau +628xxxxxxxxx"
            className={inputCls(errors.whatsapp)}
          />
          {errors.whatsapp && <p className="text-xs text-red-500 mt-1">{errors.whatsapp.message}</p>}
          <p className="text-xs text-gray-400 mt-1">Konfirmasi pembayaran akan dikirim ke nomor ini</p>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full py-4 font-display font-bold flex items-center justify-center gap-2 text-base">
        Lanjut — Pilih Merchandise
        <ChevronRight className="w-5 h-5" />
      </button>
    </form>
  )
}
