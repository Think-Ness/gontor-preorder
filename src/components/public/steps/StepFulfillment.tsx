'use client'

import { useState, useMemo } from 'react'
import { CheckoutDraft, FulfillmentMethod } from '@/types'
import { MapPin, ShoppingBag, ChevronLeft, ChevronRight, Truck, Navigation, CheckCircle2, ExternalLink, Search, Sparkles } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface Props {
  draft: CheckoutDraft | null
  onSave: (data: Partial<CheckoutDraft>) => void
  onBack: () => void
}

// Preset Indonesian Destination Cities & Provinces for Quick Auto-Fill & Zone Shipping Calculation
interface DestinationCity {
  city: string
  province: string
  postalCode: string
  zone: 'ZONA_1' | 'ZONA_2' | 'ZONA_3' | 'ZONA_4' | 'ZONA_5'
  zoneName: string
}

const DESTINATION_CITIES: DestinationCity[] = [
  // Zona 1: Jatim & Jateng
  { city: 'Kab. Ponorogo', province: 'Jawa Timur', postalCode: '63411', zone: 'ZONA_1', zoneName: 'Jawa Timur & Jawa Tengah' },
  { city: 'Kota Surabaya', province: 'Jawa Timur', postalCode: '60111', zone: 'ZONA_1', zoneName: 'Jawa Timur & Jawa Tengah' },
  { city: 'Kota Malang', province: 'Jawa Timur', postalCode: '65111', zone: 'ZONA_1', zoneName: 'Jawa Timur & Jawa Tengah' },
  { city: 'Kota Solo / Surakarta', province: 'Jawa Tengah', postalCode: '57111', zone: 'ZONA_1', zoneName: 'Jawa Timur & Jawa Tengah' },
  { city: 'Kota Semarang', province: 'Jawa Tengah', postalCode: '50111', zone: 'ZONA_1', zoneName: 'Jawa Timur & Jawa Tengah' },
  { city: 'Kab. Madiun', province: 'Jawa Timur', postalCode: '63111', zone: 'ZONA_1', zoneName: 'Jawa Timur & Jawa Tengah' },

  // Zona 2: Jabar, DKI, Banten, DIY, Bali
  { city: 'Kota Yogyakarta', province: 'DI Yogyakarta', postalCode: '55111', zone: 'ZONA_2', zoneName: 'DKI Jakarta, Jabar, DIY, Banten, Bali' },
  { city: 'Kota Bandung', province: 'Jawa Barat', postalCode: '40111', zone: 'ZONA_2', zoneName: 'DKI Jakarta, Jabar, DIY, Banten, Bali' },
  { city: 'Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12111', zone: 'ZONA_2', zoneName: 'DKI Jakarta, Jabar, DIY, Banten, Bali' },
  { city: 'Jakarta Barat / Pusat / Utara / Timur', province: 'DKI Jakarta', postalCode: '10111', zone: 'ZONA_2', zoneName: 'DKI Jakarta, Jabar, DIY, Banten, Bali' },
  { city: 'Kota Tangerang / Selatan', province: 'Banten', postalCode: '15111', zone: 'ZONA_2', zoneName: 'DKI Jakarta, Jabar, DIY, Banten, Bali' },
  { city: 'Kota Bekasi / Depok / Bogor', province: 'Jawa Barat', postalCode: '17111', zone: 'ZONA_2', zoneName: 'DKI Jakarta, Jabar, DIY, Banten, Bali' },
  { city: 'Kota Denpasar', province: 'Bali', postalCode: '80111', zone: 'ZONA_2', zoneName: 'DKI Jakarta, Jabar, DIY, Banten, Bali' },

  // Zona 3: Sumatera & NTB
  { city: 'Kota Medan', province: 'Sumatera Utara', postalCode: '20111', zone: 'ZONA_3', zoneName: 'Sumatera & NTB' },
  { city: 'Kota Palembang', province: 'Sumatera Selatan', postalCode: '30111', zone: 'ZONA_3', zoneName: 'Sumatera & NTB' },
  { city: 'Kota Pekanbaru', province: 'Riau', postalCode: '28111', zone: 'ZONA_3', zoneName: 'Sumatera & NTB' },
  { city: 'Kota Padang', province: 'Sumatera Barat', postalCode: '25111', zone: 'ZONA_3', zoneName: 'Sumatera & NTB' },
  { city: 'Kota Bandar Lampung', province: 'Lampung', postalCode: '35111', zone: 'ZONA_3', zoneName: 'Sumatera & NTB' },
  { city: 'Kota Mataram / Lombok', province: 'Nusa Tenggara Barat', postalCode: '83111', zone: 'ZONA_3', zoneName: 'Sumatera & NTB' },

  // Zona 4: Kalimantan, Sulawesi, NTT
  { city: 'Kota Banjarmasin', province: 'Kalimantan Selatan', postalCode: '70111', zone: 'ZONA_4', zoneName: 'Kalimantan, Sulawesi, NTT' },
  { city: 'Kota Balikpapan / Samarinda', province: 'Kalimantan Timur', postalCode: '75111', zone: 'ZONA_4', zoneName: 'Kalimantan, Sulawesi, NTT' },
  { city: 'Kota Pontianak', province: 'Kalimantan Barat', postalCode: '78111', zone: 'ZONA_4', zoneName: 'Kalimantan, Sulawesi, NTT' },
  { city: 'Kota Makassar', province: 'Sulawesi Selatan', postalCode: '90111', zone: 'ZONA_4', zoneName: 'Kalimantan, Sulawesi, NTT' },
  { city: 'Kota Manado', province: 'Sulawesi Utara', postalCode: '95111', zone: 'ZONA_4', zoneName: 'Kalimantan, Sulawesi, NTT' },
  { city: 'Kota Kupang', province: 'Nusa Tenggara Timur', postalCode: '85111', zone: 'ZONA_4', zoneName: 'Kalimantan, Sulawesi, NTT' },

  // Zona 5: Maluku & Papua
  { city: 'Kota Ambon', province: 'Maluku', postalCode: '97111', zone: 'ZONA_5', zoneName: 'Maluku & Papua' },
  { city: 'Kota Jayapura', province: 'Papua', postalCode: '99111', zone: 'ZONA_5', zoneName: 'Maluku & Papua' },
  { city: 'Kota Sorong', province: 'Papua Barat', postalCode: '98411', zone: 'ZONA_5', zoneName: 'Maluku & Papua' },
]

// Dynamic Zone Rates per Courier
const ZONE_RATES = {
  ZONA_1: [
    { id: 'jnt', name: 'J&T Express — Reguler', est: '1 Hari', cost: 12000 },
    { id: 'jne', name: 'JNE Express — REG', est: '1–2 Hari', cost: 14000 },
    { id: 'pos', name: 'POS Indonesia — Kilat Khusus', est: '1–2 Hari', cost: 10000 },
    { id: 'sicepat', name: 'SiCepat — REG', est: '1–2 Hari', cost: 12000 },
    { id: 'wahana', name: 'Wahana Express', est: '2–3 Hari', cost: 8000 },
  ],
  ZONA_2: [
    { id: 'jnt', name: 'J&T Express — Reguler', est: '1–2 Hari', cost: 18000 },
    { id: 'jne', name: 'JNE Express — REG', est: '2 Hari', cost: 20000 },
    { id: 'pos', name: 'POS Indonesia — Kilat Khusus', est: '2–3 Hari', cost: 15000 },
    { id: 'sicepat', name: 'SiCepat — REG', est: '2 Hari', cost: 17000 },
    { id: 'wahana', name: 'Wahana Express', est: '3 Hari', cost: 12000 },
  ],
  ZONA_3: [
    { id: 'jnt', name: 'J&T Express — Reguler', est: '2–3 Hari', cost: 28000 },
    { id: 'jne', name: 'JNE Express — REG', est: '3 Hari', cost: 32000 },
    { id: 'pos', name: 'POS Indonesia — Kilat Khusus', est: '3–4 Hari', cost: 25000 },
    { id: 'sicepat', name: 'SiCepat — REG', est: '2–3 Hari', cost: 27000 },
    { id: 'wahana', name: 'Wahana Express', est: '4 Hari', cost: 22000 },
  ],
  ZONA_4: [
    { id: 'jnt', name: 'J&T Express — Reguler', est: '3–4 Hari', cost: 38000 },
    { id: 'jne', name: 'JNE Express — REG', est: '3–4 Hari', cost: 42000 },
    { id: 'pos', name: 'POS Indonesia — Kilat Khusus', est: '4–5 Hari', cost: 35000 },
    { id: 'sicepat', name: 'SiCepat — REG', est: '3–4 Hari', cost: 36000 },
    { id: 'wahana', name: 'Wahana Express', est: '5 Hari', cost: 30000 },
  ],
  ZONA_5: [
    { id: 'jnt', name: 'J&T Express — Reguler', est: '4–5 Hari', cost: 55000 },
    { id: 'jne', name: 'JNE Express — REG', est: '4–6 Hari', cost: 60000 },
    { id: 'pos', name: 'POS Indonesia — Kilat Khusus', est: '5–7 Hari', cost: 48000 },
    { id: 'sicepat', name: 'SiCepat — REG', est: '4–5 Hari', cost: 52000 },
    { id: 'wahana', name: 'Wahana Express', est: '6–8 Hari', cost: 45000 },
  ],
}

export default function StepFulfillment({ draft, onSave, onBack }: Props) {
  const [method, setMethod] = useState<FulfillmentMethod>(draft?.fulfillmentMethod || 'PICKUP')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Current Destination Zone (Default Zona 2)
  const [activeZone, setActiveZone] = useState<keyof typeof ZONE_RATES>('ZONA_2')
  const [searchQuery, setSearchQuery] = useState('')

  // Address State
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

  // Dynamic Available Couriers based on Active Zone
  const currentCouriers = useMemo(() => ZONE_RATES[activeZone], [activeZone])

  const [selectedCourier, setSelectedCourier] = useState(draft?.address?.courierName || currentCouriers[0].name)
  const [shippingCost, setShippingCost] = useState<number>(draft?.address?.shippingCost ?? currentCouriers[0].cost)

  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationSuccess, setLocationSuccess] = useState(false)

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-body ${
      err
        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200'
        : 'border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
    }`

  // Quick Select Destination City Handler
  const handleSelectCity = (dest: DestinationCity) => {
    setAddress(p => ({
      ...p,
      city: dest.city,
      province: dest.province,
      postalCode: dest.postalCode,
    }))
    setActiveZone(dest.zone)

    // Reset selected courier rate to new zone defaults
    const newCouriers = ZONE_RATES[dest.zone]
    setSelectedCourier(newCouriers[0].name)
    setShippingCost(newCouriers[0].cost)

    setErrors(p => ({ ...p, city: '', province: '', postalCode: '' }))
    setSearchQuery('')
  }

  // Filtered Cities for Search Box
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return DESTINATION_CITIES
    const q = searchQuery.toLowerCase()
    return DESTINATION_CITIES.filter(
      c => c.city.toLowerCase().includes(q) || c.province.toLowerCase().includes(q)
    )
  }, [searchQuery])

  // GPS Geolocation Handler (For pinpointing exact doorstep)
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

  const handleCourierSelect = (courier: (typeof currentCouriers)[0]) => {
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

          {/* Quick Location Search & Auto-Fill Box */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-green-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-700" />
                Pilih Kota Tujuan Pengiriman (Auto-Fill Form & Cek Tarif)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-200 text-green-800">
                Cepat & Otomatis
              </span>
            </div>

            <p className="text-xs text-green-700">
              Pilih kota tujuan Anda dari daftar di bawah untuk mengisi Kota, Provinsi, dan secara otomatis menghitung ongkos kirim ekspedisi ke lokasi tersebut!
            </p>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari Kota / Kabupaten / Provinsi tujuan (e.g. Surabaya, Jakarta, Medan)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-green-300 bg-white text-xs outline-none focus:ring-2 focus:ring-green-400 font-display"
              />
            </div>

            {/* Quick Pick Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1 pr-1 custom-scrollbar">
              {filteredCities.map((c, idx) => {
                const isSelected = address.city === c.city
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                      isSelected
                        ? 'bg-green-700 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-green-200 hover:bg-green-100 hover:border-green-300'
                    }`}
                  >
                    📍 {c.city} ({c.province})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 1: Detailed Address Form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-700" />
                Detail Alamat Rumah Pengiriman
              </h3>

              {/* GPS Geolocation Button */}
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 text-xs font-display font-bold border border-green-200 transition-all shadow-xs"
              >
                <Navigation className={`w-3.5 h-3.5 ${gettingLocation ? 'animate-spin' : 'text-green-700'}`} />
                {gettingLocation ? 'Mengambil GPS...' : 'Tag Pin Rumah di Peta GPS'}
              </button>
            </div>

            {locationSuccess && (
              <div className="p-3 rounded-xl bg-green-100 border border-green-300 text-green-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
                Koordinat GPS presisi lokasi rumah Anda berhasil didapatkan!
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
                Alamat Lengkap (Jalan, No. Rumah, RT/RW, Patokan) <span className="text-red-400">*</span>
              </label>
              <textarea
                value={address.fullAddress}
                onChange={e => { setAddress(p => ({ ...p, fullAddress: e.target.value })); setErrors(p => ({ ...p, fullAddress: '' })) }}
                placeholder="Contoh: Jl. Ahmad Yani No. 88, RT 01/RW 04 (Samping Masjid Al-Hidayah)"
                rows={2}
                className={inputCls(errors.fullAddress)}
              />
              {errors.fullAddress && <p className="text-xs text-red-500 mt-1">{errors.fullAddress}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
                  Kabupaten / Kota <span className="text-red-400">*</span>
                </label>
                <input
                  value={address.city}
                  onChange={e => { setAddress(p => ({ ...p, city: e.target.value })); setErrors(p => ({ ...p, city: '' })) }}
                  placeholder="e.g. Kota Surabaya"
                  className={inputCls(errors.city)}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
                  Provinsi <span className="text-red-400">*</span>
                </label>
                <input
                  value={address.province}
                  onChange={e => { setAddress(p => ({ ...p, province: e.target.value })); setErrors(p => ({ ...p, province: '' })) }}
                  placeholder="e.g. Jawa Timur"
                  className={inputCls(errors.province)}
                />
                {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
                  Kecamatan <span className="text-red-400">*</span>
                </label>
                <input
                  value={address.district}
                  onChange={e => { setAddress(p => ({ ...p, district: e.target.value })); setErrors(p => ({ ...p, district: '' })) }}
                  placeholder="Nama kec"
                  className={inputCls(errors.district)}
                />
                {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 font-display">
                  Desa / Kel. <span className="text-red-400">*</span>
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

            {/* Optional Google Maps Share Link input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 font-display flex items-center justify-between">
                <span>Link Google Maps Rumah (Opsional):</span>
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
                placeholder="https://maps.google.com/?q=-7.89,111.45 atau paste link Google Maps..."
                className={inputCls()}
              />
            </div>
          </div>

          {/* Section 2: Courier & Shipping Fee Estimator */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Pilihan Ekspedisi & Tarif Ongkir ({address.city || 'Tujuan Pengiriman'})
              </h3>
              <span className="text-[11px] font-semibold text-gray-500">
                Tarif Wilayah: {activeZone.replace('ZONA_', 'Zona ')}
              </span>
            </div>

            <div className="space-y-2">
              {currentCouriers.map(c => {
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
