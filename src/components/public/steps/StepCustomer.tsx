import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, CustomerFormData } from '@/lib/validations/schemas'
import { CheckoutDraft } from '@/types'
import { normalizeWhatsApp } from '@/lib/utils'
import { ChevronRight, User, GraduationCap, Users, MapPin, Navigation, Search, CheckCircle } from 'lucide-react'
import MapPickerModal from '../MapPickerModal'
import { normalizeProvince, PROVINCES_LIST } from '../IndonesiaMapData'

interface Props {
  draft: CheckoutDraft | null
  onSave: (data: Partial<CheckoutDraft>) => void
}

export default function StepCustomer({ draft, onSave }: Props) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationSuccess, setLocationSuccess] = useState(false)

  const { register, handleSubmit, setValue, watch, control, clearErrors, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      is_alumni: draft?.isAlumni !== undefined ? draft.isAlumni : true,
      stambuk: draft?.stambuk && draft.stambuk !== '-' ? draft.stambuk : '',
      full_name: draft?.name || '',
      generation_year: draft?.generationYear && draft.generationYear !== '0' ? Number(draft.generationYear) : undefined,
      whatsapp: draft?.whatsapp || '',
      email: draft?.email || '',
      shipping_address: draft?.address?.fullAddress || '',
      shipping_village: draft?.address?.village || '',
      shipping_district: draft?.address?.district || '',
      shipping_city: draft?.address?.city || '',
      shipping_province: draft?.address?.province || '',
      shipping_postal_code: draft?.address?.postalCode || '',
      shipping_latitude: draft?.address?.latitude,
      shipping_longitude: draft?.address?.longitude,
      shipping_google_maps_url: draft?.address?.googleMapsUrl || '',
    },
  })

  const isAlumni = watch('is_alumni')
  const mapUrl = watch('shipping_google_maps_url')

  const handleStatusChange = (statusAlumni: boolean) => {
    setValue('is_alumni', statusAlumni, { shouldValidate: true })
    if (!statusAlumni) {
      setValue('stambuk', '-', { shouldValidate: true })
      setValue('generation_year', undefined, { shouldValidate: true })
      clearErrors(['stambuk', 'generation_year'])
    } else {
      if (watch('stambuk') === '-') {
        setValue('stambuk', '', { shouldValidate: false })
      }
    }
  }

  // Auto-fill from localStorage if available and form is empty
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('gontor_customer_profile')
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        if (draft?.isAlumni === undefined && profile.is_alumni !== undefined) setValue('is_alumni', profile.is_alumni)
        if (!draft?.stambuk && profile.stambuk) setValue('stambuk', profile.stambuk)
        if (!draft?.name && profile.full_name) setValue('full_name', profile.full_name)
        if (!draft?.generationYear && profile.generation_year) setValue('generation_year', Number(profile.generation_year))
        if (!draft?.whatsapp && profile.whatsapp) setValue('whatsapp', profile.whatsapp)
        if (!draft?.email && profile.email) setValue('email', profile.email)
        
        if (!draft?.address?.fullAddress && profile.shipping_address) setValue('shipping_address', profile.shipping_address)
        if (!draft?.address?.village && profile.shipping_village) setValue('shipping_village', profile.shipping_village)
        if (!draft?.address?.district && profile.shipping_district) setValue('shipping_district', profile.shipping_district)
        if (!draft?.address?.city && profile.shipping_city) setValue('shipping_city', profile.shipping_city)
        if (!draft?.address?.province && profile.shipping_province) setValue('shipping_province', profile.shipping_province)
        if (!draft?.address?.postalCode && profile.shipping_postal_code) setValue('shipping_postal_code', profile.shipping_postal_code)
        if (!draft?.address?.latitude && profile.shipping_latitude) setValue('shipping_latitude', profile.shipping_latitude)
        if (!draft?.address?.longitude && profile.shipping_longitude) setValue('shipping_longitude', profile.shipping_longitude)
        if (!draft?.address?.googleMapsUrl && profile.shipping_google_maps_url) setValue('shipping_google_maps_url', profile.shipping_google_maps_url)
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
      generationYear: data.is_alumni ? String(data.generation_year || 0) : '0',
      whatsapp: normalized,
      email: data.email,
      address: {
        fullAddress: data.shipping_address,
        village: data.shipping_village,
        district: data.shipping_district,
        city: data.shipping_city,
        province: data.shipping_province,
        postalCode: data.shipping_postal_code,
        latitude: data.shipping_latitude,
        longitude: data.shipping_longitude,
        googleMapsUrl: data.shipping_google_maps_url,
      }
    })
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung geolokasi")
      return
    }
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setValue('shipping_latitude', lat, { shouldValidate: true })
        setValue('shipping_longitude', lng, { shouldValidate: true })
        setValue('shipping_google_maps_url', `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, { shouldValidate: true })
        
        setLocationSuccess(true)
        setTimeout(() => setLocationSuccess(false), 3000)
        setGettingLocation(false)
      },
      (err) => {
        alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.")
        setGettingLocation(false)
      }
    )
  }

  const inputCls = (err?: { message?: string }) =>
    `w-full px-4 py-3 min-h-[44px] rounded-xl border text-sm outline-none transition-all font-body ${
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
        <p className="text-sm text-gray-500 mt-1">Isi data diri Anda beserta alamat pengiriman</p>
      </div>

      {/* Identitas Diri */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
        <h3 className="font-display font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          Informasi Pribadi
        </h3>
        
        {/* Pilihan Alumni / Umum */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 font-display">
            Status Pemesan <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
            <label className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-4 sm:p-3 min-h-[52px] border-2 rounded-xl transition-all ${isAlumni ? 'border-green-800 bg-green-50' : 'border-gray-200 hover:border-green-200 bg-white'}`}>
              <input type="radio" {...register('is_alumni')} value="true" className="hidden" 
                onChange={() => handleStatusChange(true)} 
              />
              <GraduationCap className={`w-6 h-6 ${isAlumni ? 'text-green-800' : 'text-gray-400'}`} />
              <span className={`font-display font-bold text-sm ${isAlumni ? 'text-green-900' : 'text-gray-600'}`}>Alumni Gontor</span>
            </label>
            <label className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-4 sm:p-3 min-h-[52px] border-2 rounded-xl transition-all ${!isAlumni ? 'border-green-800 bg-green-50' : 'border-gray-200 hover:border-green-200 bg-white'}`}>
              <input type="radio" {...register('is_alumni')} value="false" className="hidden" 
                onChange={() => handleStatusChange(false)} 
              />
              <Users className={`w-6 h-6 ${!isAlumni ? 'text-green-800' : 'text-gray-400'}`} />
              <span className={`font-display font-bold text-sm ${!isAlumni ? 'text-green-900' : 'text-gray-600'}`}>Bukan Alumni / Umum</span>
            </label>
          </div>
        </div>

        {isAlumni && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stambuk */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
                Stambuk <span className="text-red-400">*</span>
              </label>
              <input {...register('stambuk')} placeholder="Contoh: 66820" className={inputCls(errors.stambuk)} />
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
                placeholder="Tahun: 2005"
                min={1926}
                max={2026}
                className={inputCls(errors.generation_year)}
              />
              {errors.generation_year && <p className="text-xs text-red-500 mt-1">{errors.generation_year.message}</p>}
            </div>
          </div>
        )}

        {/* Nama */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
            Nama Lengkap <span className="text-red-400">*</span>
          </label>
          <input {...register('full_name')} placeholder="Nama lengkap Anda" className={inputCls(errors.full_name)} />
          {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
              Nomor WhatsApp <span className="text-red-400">*</span>
            </label>
            <input
              {...register('whatsapp')}
              type="tel"
              placeholder="08xxxxxxxxxx"
              className={inputCls(errors.whatsapp)}
            />
            {errors.whatsapp && <p className="text-xs text-red-500 mt-1">{errors.whatsapp.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="email@domain.com"
              className={inputCls(errors.email)}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
        </div>
      </div>

      {/* Alamat Pengiriman */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
          <h3 className="font-display font-bold text-gray-800 text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Titik Lokasi Peta & Alamat Lengkap
          </h3>
        </div>

        {/* Google Maps Embed / Link Result */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 font-display">
            Pin Lokasi (Google Maps) <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={gettingLocation}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 py-3 px-4 rounded-xl font-semibold text-sm transition-all min-h-[44px]"
            >
              {gettingLocation ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin border-2 border-emerald-700 border-t-transparent rounded-full w-4 h-4" />
                  Mencari...
                </span>
              ) : locationSuccess ? (
                <span className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="w-4 h-4" /> Ditemukan!
                </span>
              ) : (
                <>
                  <Navigation className="w-4 h-4" /> Gunakan Lokasi Saat Ini
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsMapModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl font-semibold text-sm transition-all min-h-[44px]"
            >
              <Search className="w-4 h-4" />
              Cari di Peta Google
            </button>
          </div>
          
          <input type="hidden" {...register('shipping_latitude')} />
          <input type="hidden" {...register('shipping_longitude')} />
          <input type="hidden" {...register('shipping_google_maps_url')} />
          
          {mapUrl && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-900 break-all leading-tight pr-2">
                <span className="font-semibold block mb-1">Lokasi Peta Tersimpan:</span>
                <a href={mapUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{mapUrl}</a>
              </div>
            </div>
          )}
          {errors.shipping_latitude && <p className="text-xs text-red-500 mt-2">Titik lokasi peta wajib diisi</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
            Alamat Detail (Jalan, RT/RW, Patokan) <span className="text-red-400">*</span>
          </label>
          <textarea
            {...register('shipping_address')}
            rows={3}
            placeholder="Contoh: Jl. Pondok Modern Gontor No.1, RT 01/RW 02, Kec. Mlarak (Depan minimarket A)"
            className={inputCls(errors.shipping_address)}
          />
          {errors.shipping_address && <p className="text-xs text-red-500 mt-1">{errors.shipping_address.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
              Desa/Kelurahan <span className="text-red-400">*</span>
            </label>
            <input {...register('shipping_village')} className={inputCls(errors.shipping_village)} placeholder="Desa" />
            {errors.shipping_village && <p className="text-xs text-red-500 mt-1">{errors.shipping_village.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
              Kecamatan <span className="text-red-400">*</span>
            </label>
            <input {...register('shipping_district')} className={inputCls(errors.shipping_district)} placeholder="Kecamatan" />
            {errors.shipping_district && <p className="text-xs text-red-500 mt-1">{errors.shipping_district.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
              Kab/Kota <span className="text-red-400">*</span>
            </label>
            <input {...register('shipping_city')} className={inputCls(errors.shipping_city)} placeholder="Kota" />
            {errors.shipping_city && <p className="text-xs text-red-500 mt-1">{errors.shipping_city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
              Provinsi <span className="text-red-400">*</span>
            </label>
            <select
              {...register('shipping_province')}
              className={inputCls(errors.shipping_province)}
            >
              <option value="">Pilih Provinsi...</option>
              {PROVINCES_LIST.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.shipping_province && <p className="text-xs text-red-500 mt-1">{errors.shipping_province.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
              Kode Pos <span className="text-red-400">*</span>
            </label>
            <input
              {...register('shipping_postal_code')}
              type="text"
              maxLength={5}
              placeholder="12345"
              className={inputCls(errors.shipping_postal_code)}
            />
            {errors.shipping_postal_code && <p className="text-xs text-red-500 mt-1">{errors.shipping_postal_code.message}</p>}
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full py-4 min-h-[48px] font-display font-bold flex items-center justify-center gap-2 text-base">
        Lanjut — Pilih Merchandise
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelect={(res) => {
          setValue('shipping_address', res.addressName, { shouldValidate: true })
          setValue('shipping_latitude', res.lat, { shouldValidate: true })
          setValue('shipping_longitude', res.lng, { shouldValidate: true })
          setValue('shipping_google_maps_url', res.mapsUrl, { shouldValidate: true })
          
          if (res.village) setValue('shipping_village', res.village, { shouldValidate: true })
          if (res.district) setValue('shipping_district', res.district, { shouldValidate: true })
          if (res.city) setValue('shipping_city', res.city, { shouldValidate: true })
          if (res.postalCode) setValue('shipping_postal_code', res.postalCode, { shouldValidate: true })
          
          if (res.province) {
             const p = normalizeProvince(res.province)
             if (p) setValue('shipping_province', p, { shouldValidate: true })
          }
          setIsMapModalOpen(false)
        }}
      />
    </form>
  )
}
