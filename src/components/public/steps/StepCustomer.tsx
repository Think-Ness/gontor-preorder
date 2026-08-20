import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, CustomerFormData } from '@/lib/validations/schemas'
import { CheckoutDraft } from '@/types'
import { normalizeWhatsApp } from '@/lib/utils'
import { ChevronRight, User, GraduationCap, Users } from 'lucide-react'

interface Props {
  draft: CheckoutDraft | null
  onSave: (data: Partial<CheckoutDraft>) => void
}

export default function StepCustomer({ draft, onSave }: Props) {
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      is_alumni: draft?.isAlumni !== undefined ? draft.isAlumni : true,
      stambuk: draft?.stambuk || '',
      full_name: draft?.name || '',
      district: draft?.district || '',
      generation_year: draft?.generationYear && draft.generationYear !== '0' ? Number(draft.generationYear) : undefined,
      whatsapp: draft?.whatsapp || '',
      email: draft?.email || '',
    },
  })

  const isAlumni = watch('is_alumni')

  // Auto-fill from localStorage if available and form is empty
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('gontor_customer_profile')
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        if (draft?.isAlumni === undefined && profile.is_alumni !== undefined) setValue('is_alumni', profile.is_alumni)
        if (!draft?.stambuk && profile.stambuk) setValue('stambuk', profile.stambuk)
        if (!draft?.name && profile.full_name) setValue('full_name', profile.full_name)
        if (!draft?.district && profile.district) setValue('district', profile.district)
        if (!draft?.generationYear && profile.generation_year) setValue('generation_year', Number(profile.generation_year))
        if (!draft?.whatsapp && profile.whatsapp) setValue('whatsapp', profile.whatsapp)
        if (!draft?.email && profile.email) setValue('email', profile.email)
      }
    } catch (e) {
      console.warn('Failed to parse saved customer profile')
    }
  }, [draft, setValue])

  const onSubmit = (data: CustomerFormData) => {
    const normalized = normalizeWhatsApp(data.whatsapp)
    try {
      localStorage.setItem('gontor_customer_profile', JSON.stringify(data))
    } catch (e) {
      console.warn('Failed to save profile to localStorage')
    }

    onSave({
      isAlumni: data.is_alumni,
      stambuk: data.is_alumni ? (data.stambuk || '-') : '-',
      name: data.full_name,
      district: data.district,
      generationYear: data.is_alumni ? String(data.generation_year || 0) : '0',
      whatsapp: normalized,
      email: data.email,
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
        <p className="text-sm text-gray-500 mt-1">Isi data diri Anda untuk keperluan pengiriman</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
        
        {/* Pilihan Alumni / Umum */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 font-display">
            Status Pemesan <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
            <label className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-4 sm:p-3 border-2 rounded-xl transition-all ${isAlumni ? 'border-green-800 bg-green-50' : 'border-gray-200 hover:border-green-200 bg-white'}`}>
              <input type="radio" {...register('is_alumni')} value="true" className="hidden" 
                onChange={() => setValue('is_alumni', true, { shouldValidate: true })} 
              />
              <GraduationCap className={`w-6 h-6 ${isAlumni ? 'text-green-800' : 'text-gray-400'}`} />
              <span className={`font-display font-bold text-sm ${isAlumni ? 'text-green-900' : 'text-gray-600'}`}>Alumni Gontor</span>
            </label>
            <label className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-4 sm:p-3 border-2 rounded-xl transition-all ${!isAlumni ? 'border-green-800 bg-green-50' : 'border-gray-200 hover:border-green-200 bg-white'}`}>
              <input type="radio" {...register('is_alumni')} value="false" className="hidden" 
                onChange={() => setValue('is_alumni', false, { shouldValidate: true })} 
              />
              <Users className={`w-6 h-6 ${!isAlumni ? 'text-green-800' : 'text-gray-400'}`} />
              <span className={`font-display font-bold text-sm ${!isAlumni ? 'text-green-900' : 'text-gray-600'}`}>Bukan Alumni / Umum</span>
            </label>
          </div>
        </div>

        <hr className="border-gray-100" />

        {isAlumni && (
          <>
            {/* Stambuk */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
                Stambuk <span className="text-red-400">*</span>
              </label>
              <input {...register('stambuk')} placeholder="Nomor stambuk Anda" className={inputCls(errors.stambuk)} />
              {errors.stambuk && <p className="text-xs text-red-500 mt-1">{errors.stambuk.message}</p>}
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
          </>
        )}

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
            Daerah Asal / Tinggal <span className="text-red-400">*</span>
          </label>
          <input {...register('district')} placeholder="Kota/Kabupaten tempat tinggal saat ini" className={inputCls(errors.district)} />
          {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
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
          <p className="text-xs text-gray-400 mt-1">Untuk komunikasi jika ada kendala pengiriman</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
            Email Aktif <span className="text-red-400">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="contoh: email@domain.com"
            className={inputCls(errors.email)}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          <p className="text-xs text-gray-400 mt-1">Digunakan untuk menerima bukti pembayaran & invoice</p>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full py-4 font-display font-bold flex items-center justify-center gap-2 text-base">
        Lanjut — Pilih Merchandise
        <ChevronRight className="w-5 h-5" />
      </button>
    </form>
  )
}
