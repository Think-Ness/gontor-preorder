'use client'

import { useState } from 'react'
import { CheckoutDraft, FulfillmentMethod } from '@/types'
import { MapPin, ShoppingBag, ChevronLeft, ChevronRight, Truck, Navigation, CheckCircle2, ExternalLink, Compass } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface Props {
  draft: CheckoutDraft | null
  onSave: (data: Partial<CheckoutDraft>) => void
  onBack: () => void
}

const COURIER_OPTIONS = [
  { id: 'jnt', name: 'J&T Express — Reguler', est: '1–2 Hari', cost: 15000 },
  { id: 'jne', name: 'JNE Express — REG', est: '1–3 Hari', cost: 18000 },
  { id: 'pos', name: 'POS Indonesia — Kilat Khusus', est: '2–3 Hari', cost: 12000 },
  { id: 'sicepat', name: 'SiCepat — REG', est: '1–2 Hari', cost: 16000 },
  { id: 'wahana', name: 'Wahana Express', est: '3–4 Hari', cost: 10000 },
]

export default function StepFulfillment({ draft, onSave, onBack }: Props) {
  const [method, setMethod] = useState<FulfillmentMethod>(draft?.fulfillmentMethod || 'PICKUP')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Shipping & Pin Location State
  const [selectedCourier, setSelectedCourier] = useState(draft?.address?.courierName || COURIER_OPTIONS[0].name)
  const [shippingCost, setShippingCost] = useState<number>(draft?.address?.shippingCost ?? COURIER_OPTIONS[0].cost)

  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationSuccess, setLocationSuccess] = useState(false)

  const [address, setAddress] = useState({
    fullAddress: draft?.address?.fullAddress || '',
    village: draft?.address?.village || '',
    district: draft?.address?.district || '',
    city: draft?.address?.city || '',
    province: draft?.address?.province || '',
    postalCode: draft?.address?.postalCode || '',
    googleMapsUrl: draft?.address?.googleMapsUrl || '',
    latitude: draft?.address?.latitude || undefined as number | undefined,
    longitude: draft?.address?.longitude || undefined as number | undefined,
  })

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-body ${
      err
        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200'
        : 'border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
    }`

  // GPS Geolocation Handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung GPS Geolocation.')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`

        setAddress(p => ({
          ...p,
          latitude: lat,
          longitude: lng,
          googleMapsUrl: mapsUrl,
        }))

        setGettingLocation(false)
        setLocationSuccess(true)
        setTimeout(() => setLocationSuccess(false), 4000)
      },
      (err) => {
        setGettingLocation(false)
        alert(`Gagal mengambil koordinat lokasi: ${err.message}. Anda dapat menempelkan link Google Maps secara manual.`)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleCourierSelect = (courier: typeof COURIER_OPTIONS[0]) => {
    setSelectedCourier(courier.name)
    setShippingCost(courier.cost)
  }

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

    onSave({
      fulfillmentMethod: method,
      address: {
        ...address,
        courierName: method === 'DELIVERY' ? selectedCourier : undefined,
        shippingCost: method === 'DELIVERY' ? shippingCost : 0,
      },
    })
  }

  return (
    <div className="space-y-5">
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

      {/* Pickup Info */}
      {method === 'PICKUP' && (
        <div className="bg-green-50 rounded-2xl p-5 mb-5 border border-green-100">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-display font-bold text-sm text-green-800 mb-1">Stand Merchandise Utama</div>
              <p className="text-xs text-green-700">
                Merchandise dapat diambil di stand resmi panitia saat Reuni Akbar Alumni 100 Tahun Gontor (19–20 September 2026).
              </p>
              <p className="text-xs text-green-600 mt-2 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tidak ada biaya pengiriman (Gratis)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Form */}
      {method === 'DELIVERY' && (
        <div className="space-y-5">
          {/* Section 1: Alamat Text & Google Maps GPS Pin */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-700" />
                Detail Alamat Pengiriman
              </h3>

              {/* GPS Geolocation Button */}
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 text-xs font-display font-bold border border-green-200 transition-all shadow-xs"
              >
                <Navigation className={`w-3.5 h-3.5 ${gettingLocation ? 'animate-spin' : 'text-green-700'}`} />
                {gettingLocation ? 'Mengambil GPS...' : 'Tag Lokasi Peta / GPS'}
              </button>
            </div>

            {locationSuccess && (
              <div className="p-3 rounded-xl bg-green-100 border border-green-300 text-green-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
                Koordinat GPS presisi berhasil didapatkan & tersimpan!
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
                Alamat Lengkap (Jalan, No. Rumah, RT/RW) <span className="text-red-400">*</span>
              </label>
              <textarea
                value={address.fullAddress}
                onChange={e => { setAddress(p => ({ ...p, fullAddress: e.target.value })); setErrors(p => ({ ...p, fullAddress: '' })) }}
                placeholder="Contoh: Jl. Diponegoro No. 45, RT 02/RW 03 (Depan Masjid)"
                rows={2}
                className={inputCls(errors.fullAddress)}
              />
              {errors.fullAddress && <p className="text-xs text-red-500 mt-1">{errors.fullAddress}</p>}
            </div>

            {/* Optional Google Maps Share Link input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 font-display flex items-center justify-between">
                <span>Link Google Maps / Pin Lokasi (Opsional):</span>
                {address.googleMapsUrl && (
                  <a
                    href={address.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline text-[11px] font-bold flex items-center gap-1"
                  >
                    Buka Peta <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </label>
              <input
                type="text"
                value={address.googleMapsUrl}
                onChange={e => setAddress(p => ({ ...p, googleMapsUrl: e.target.value }))}
                placeholder="https://maps.google.com/?q=-7.89,111.45 atau https://maps.app.goo.gl/..."
                className={inputCls()}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Klik tombol "Tag Lokasi Peta / GPS" di atas untuk otomatis mengisi titik lokasi rumah Anda.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
                  Desa / Kelurahan <span className="text-red-400">*</span>
                </label>
                <input
                  value={address.village}
                  onChange={e => { setAddress(p => ({ ...p, village: e.target.value })); setErrors(p => ({ ...p, village: '' })) }}
                  placeholder="Nama desa"
                  className={inputCls(errors.village)}
                />
                {errors.village && <p className="text-xs text-red-500 mt-1">{errors.village}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
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
                <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
                  Kabupaten / Kota <span className="text-red-400">*</span>
                </label>
                <input
                  value={address.city}
                  onChange={e => { setAddress(p => ({ ...p, city: e.target.value })); setErrors(p => ({ ...p, city: '' })) }}
                  placeholder="Nama kota/kab"
                  className={inputCls(errors.city)}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
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
              <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
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

          {/* Section 2: Courier & Shipping Fee Estimator */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Pilihan Jasa Ekspedisi & Estimasi Ongkir
            </h3>

            <div className="space-y-2">
              {COURIER_OPTIONS.map(c => {
                const isSelected = selectedCourier === c.name
                return (
                  <div
                    key={c.id}
                    onClick={() => handleCourierSelect(c)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-green-600 bg-green-50/70 shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-green-600 bg-green-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className={`text-xs font-display font-bold ${isSelected ? 'text-green-900' : 'text-gray-800'}`}>
                          {c.name}
                        </p>
                        <p className="text-[11px] text-gray-500">Estimasi Tiba: {c.est}</p>
                      </div>
                    </div>

                    <span className={`text-xs font-display font-bold ${isSelected ? 'text-green-800' : 'text-gray-900'}`}>
                      {formatRupiah(c.cost)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex gap-3 pt-2">
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
