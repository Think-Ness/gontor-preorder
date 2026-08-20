'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckoutDraft, FulfillmentMethod } from '@/types'
import { MapPin, ShoppingBag, ChevronLeft, ChevronRight, Truck } from 'lucide-react'

const pickupSchema = z.object({ fulfillment_method: z.literal('PICKUP') })
const deliverySchema = z.object({
  fulfillment_method: z.literal('DELIVERY'),
  shipping_address: z.string().min(5, 'Alamat lengkap wajib diisi'),
  shipping_village: z.string().min(1, 'Desa/Kelurahan wajib'),
  shipping_district: z.string().min(1, 'Kecamatan wajib'),
  shipping_city: z.string().min(1, 'Kabupaten/Kota wajib'),
  shipping_province: z.string().min(1, 'Provinsi wajib'),
  shipping_postal_code: z.string().regex(/^\d{5}$/, 'Kode pos harus 5 digit'),
})

interface Props {
  draft: CheckoutDraft | null
  onSave: (data: Partial<CheckoutDraft>) => void
  onBack: () => void
}

export default function StepFulfillment({ draft, onSave, onBack }: Props) {
  const [method, setMethod] = useState<FulfillmentMethod>(draft?.fulfillmentMethod || 'PICKUP')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [address, setAddress] = useState({
    fullAddress: draft?.address?.fullAddress || '',
    village: draft?.address?.village || '',
    district: draft?.address?.district || '',
    city: draft?.address?.city || '',
    province: draft?.address?.province || '',
    postalCode: draft?.address?.postalCode || '',
  })

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-body ${
      err
        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200'
        : 'border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
    }`

  const handleNext = () => {
    const newErrors: Record<string, string> = {}
    if (method === 'DELIVERY') {
      if (!address.fullAddress || address.fullAddress.length < 5) newErrors.fullAddress = 'Alamat lengkap wajib diisi'
      if (!address.village) newErrors.village = 'Desa/Kelurahan wajib'
      if (!address.district) newErrors.district = 'Kecamatan wajib'
      if (!address.city) newErrors.city = 'Kabupaten/Kota wajib'
      if (!address.province) newErrors.province = 'Provinsi wajib'
      if (!/^\d{5}$/.test(address.postalCode)) newErrors.postalCode = 'Kode pos harus 5 digit'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSave({ fulfillmentMethod: method, address })
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(13,74,43,0.1)' }}>
          <Truck className="w-6 h-6" style={{ color: 'var(--gontor-green)' }} />
        </div>
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--gontor-green-dark)' }}>Metode Pengiriman</h2>
        <p className="text-sm text-gray-500 mt-1">Pilih cara pengambilan merchandise Anda</p>
      </div>

      {/* Method Selection */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setMethod('PICKUP')}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            method === 'PICKUP'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <ShoppingBag className={`w-6 h-6 mb-2 ${method === 'PICKUP' ? 'text-green-600' : 'text-gray-400'}`} />
          <div className={`font-display font-bold text-sm ${method === 'PICKUP' ? 'text-green-800' : 'text-gray-700'}`}>
            Ambil di Stand
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Reuni Akbar 19–20 Sep 2026</div>
        </button>

        <button
          onClick={() => setMethod('DELIVERY')}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            method === 'DELIVERY'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <Truck className={`w-6 h-6 mb-2 ${method === 'DELIVERY' ? 'text-green-600' : 'text-gray-400'}`} />
          <div className={`font-display font-bold text-sm ${method === 'DELIVERY' ? 'text-green-800' : 'text-gray-700'}`}>
            Kirim ke Rumah
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Alamat pengiriman diperlukan</div>
        </button>
      </div>

      {/* Pickup info */}
      {method === 'PICKUP' && (
        <div className="bg-green-50 rounded-2xl p-5 mb-5 border border-green-100">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-display font-bold text-sm text-green-800 mb-1">Stand Merchandise</div>
              <p className="text-xs text-green-700">
                Merchandise dapat diambil di stand resmi panitia saat pelaksanaan Reuni Akbar Alumni Gontor
                tanggal 19–20 September 2026.
              </p>
              <p className="text-xs text-green-600 mt-2 font-semibold">
                ✓ Tidak ada ongkos kirim
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery form */}
      {method === 'DELIVERY' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 mb-5">
          <h3 className="font-display font-bold text-sm text-gray-700">Alamat Pengiriman</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
              Alamat Lengkap <span className="text-red-400">*</span>
            </label>
            <textarea
              value={address.fullAddress}
              onChange={e => { setAddress(p => ({ ...p, fullAddress: e.target.value })); setErrors(p => ({ ...p, fullAddress: '' })) }}
              placeholder="Nama jalan, nomor rumah, RT/RW"
              rows={3}
              className={inputCls(errors.fullAddress)}
            />
            {errors.fullAddress && <p className="text-xs text-red-500 mt-1">{errors.fullAddress}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
                Desa/Kelurahan <span className="text-red-400">*</span>
              </label>
              <input
                value={address.village}
                onChange={e => { setAddress(p => ({ ...p, village: e.target.value })); setErrors(p => ({ ...p, village: '' })) }}
                placeholder="Nama desa/kelurahan"
                className={inputCls(errors.village)}
              />
              {errors.village && <p className="text-xs text-red-500 mt-1">{errors.village}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
                Kecamatan <span className="text-red-400">*</span>
              </label>
              <input
                value={address.district}
                onChange={e => { setAddress(p => ({ ...p, district: e.target.value })); setErrors(p => ({ ...p, district: '' })) }}
                placeholder="Nama kecamatan"
                className={inputCls(errors.district)}
              />
              {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
                Kabupaten/Kota <span className="text-red-400">*</span>
              </label>
              <input
                value={address.city}
                onChange={e => { setAddress(p => ({ ...p, city: e.target.value })); setErrors(p => ({ ...p, city: '' })) }}
                placeholder="Kab/Kota"
                className={inputCls(errors.city)}
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
                Kode Pos <span className="text-red-400">*</span>
              </label>
              <input
                value={address.postalCode}
                onChange={e => { setAddress(p => ({ ...p, postalCode: e.target.value })); setErrors(p => ({ ...p, postalCode: '' })) }}
                placeholder="5 digit"
                maxLength={5}
                className={inputCls(errors.postalCode)}
              />
              {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
              Provinsi <span className="text-red-400">*</span>
            </label>
            <input
              value={address.province}
              onChange={e => { setAddress(p => ({ ...p, province: e.target.value })); setErrors(p => ({ ...p, province: '' })) }}
              placeholder="Nama provinsi"
              className={inputCls(errors.province)}
            />
            {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-display font-semibold hover:bg-gray-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={handleNext} className="btn-primary flex-1 py-3 font-display font-bold flex items-center justify-center gap-2">
          Lanjut — Pembayaran
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
