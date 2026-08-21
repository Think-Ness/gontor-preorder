'use client'

import { useState, useMemo, useEffect } from 'react'
import { CheckoutDraft, FulfillmentMethod } from '@/types'
import { Truck, Navigation, CheckCircle2, MapPin } from 'lucide-react'
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
  
  // Menentukan active zone berdasarkan provinsi yang diinput di Step 1
  const determineZone = (province: string) => {
    const p = province.toLowerCase()
    if (p.includes('timur') && p.includes('jawa')) return 'ZONA_1'
    if (p.includes('tengah') && p.includes('jawa')) return 'ZONA_1'
    
    if (p.includes('barat') && p.includes('jawa')) return 'ZONA_2'
    if (p.includes('dki')) return 'ZONA_2'
    if (p.includes('banten')) return 'ZONA_2'
    if (p.includes('yogyakarta') || p.includes('diy')) return 'ZONA_2'
    if (p.includes('bali')) return 'ZONA_2'
    
    if (p.includes('sumatera') || p.includes('riau') || p.includes('lampung') || p.includes('aceh')) return 'ZONA_3'
    if (p.includes('nusa tenggara barat') || p.includes('ntb')) return 'ZONA_3'
    
    if (p.includes('kalimantan') || p.includes('sulawesi')) return 'ZONA_4'
    if (p.includes('nusa tenggara timur') || p.includes('ntt')) return 'ZONA_4'
    
    if (p.includes('maluku') || p.includes('papua')) return 'ZONA_5'
    
    return 'ZONA_2' // default fallback
  }

  const [activeZone, setActiveZone] = useState<keyof typeof ZONE_RATES>('ZONA_2')

  useEffect(() => {
    if (draft?.address?.province) {
      setActiveZone(determineZone(draft.address.province))
    }
  }, [draft?.address?.province])

  // Dynamic Available Couriers based on Active Zone
  const currentCouriers = useMemo(() => ZONE_RATES[activeZone], [activeZone])

  const [selectedCourier, setSelectedCourier] = useState(draft?.address?.courierName || currentCouriers[0].name)
  const [shippingCost, setShippingCost] = useState<number>(draft?.address?.shippingCost ?? currentCouriers[0].cost)

  const handleNext = () => {
    onSave({
      fulfillmentMethod: method,
      address: {
        ...(draft?.address || {
          fullAddress: '',
          village: '',
          district: '',
          city: '',
          province: '',
          postalCode: ''
        }),
        courierName: method === 'DELIVERY' ? selectedCourier : undefined,
        shippingCost: method === 'DELIVERY' ? shippingCost : undefined,
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(13,74,43,0.1)' }}>
          <Truck className="w-6 h-6" style={{ color: 'var(--gontor-green)' }} />
        </div>
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--gontor-green-dark)' }}>Metode Pengiriman</h2>
        <p className="text-sm text-gray-500 mt-1">Pilih cara Anda menerima pesanan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PICKUP */}
        <div 
          onClick={() => setMethod('PICKUP')}
          className={`cursor-pointer border-2 rounded-2xl p-5 transition-all relative overflow-hidden ${
            method === 'PICKUP' 
              ? 'border-emerald-600 bg-emerald-50 shadow-md' 
              : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50'
          }`}
        >
          {method === 'PICKUP' && (
            <div className="absolute top-4 right-4 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${method === 'PICKUP' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className={`font-display font-bold text-lg mb-1 ${method === 'PICKUP' ? 'text-emerald-900' : 'text-gray-900'}`}>Ambil di Stand</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Ambil langsung di stand bazar 100 Tahun Gontor. Hemat ongkir, dan bisa langsung dipakai saat acara.
          </p>
          <div className="mt-4 inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full font-display tracking-wide">
            GRATIS ONGKIR
          </div>
        </div>

        {/* DELIVERY */}
        <div 
          onClick={() => setMethod('DELIVERY')}
          className={`cursor-pointer border-2 rounded-2xl p-5 transition-all relative overflow-hidden ${
            method === 'DELIVERY' 
              ? 'border-blue-600 bg-blue-50 shadow-md' 
              : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50'
          }`}
        >
          {method === 'DELIVERY' && (
            <div className="absolute top-4 right-4 text-blue-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${method === 'DELIVERY' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            <Truck className="w-6 h-6" />
          </div>
          <h3 className={`font-display font-bold text-lg mb-1 ${method === 'DELIVERY' ? 'text-blue-900' : 'text-gray-900'}`}>Kirim ke Alamat</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Barang dikirim ke alamat Anda melalui kurir ekspedisi. Cocok untuk yang berhalangan hadir.
          </p>
          <div className="mt-4 inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full font-display tracking-wide">
            SESUAI TARIF KURIR
          </div>
        </div>
      </div>

      {method === 'DELIVERY' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-display font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Alamat Pengiriman Anda
            </span>
          </h3>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <p className="text-sm text-gray-700 font-semibold mb-1">{draft?.name}</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {draft?.address?.fullAddress}<br/>
              Kel/Desa {draft?.address?.village}, Kec. {draft?.address?.district}<br/>
              {draft?.address?.city}, {draft?.address?.province} - {draft?.address?.postalCode}
            </p>
            <p className="text-xs text-gray-500 mt-2 italic">*Diambil dari data Tahap 1</p>
          </div>

          <h3 className="font-display font-bold text-gray-800 text-base mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Pilih Ekspedisi (Zona: {activeZone.replace('_', ' ')})
            </span>
          </h3>
          <div className="space-y-2.5">
            {currentCouriers.map(c => (
              <label 
                key={c.id} 
                className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedCourier === c.name ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedCourier === c.name ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedCourier === c.name && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-800">{c.name}</div>
                    <div className="text-xs text-gray-500">Estimasi: {c.est}</div>
                  </div>
                </div>
                <div className="font-display font-bold text-blue-700">
                  {formatRupiah(c.cost)}
                </div>
                {/* Hidden radio just for a11y & logical flow if needed */}
                <input 
                  type="radio" 
                  name="courier" 
                  value={c.name} 
                  checked={selectedCourier === c.name} 
                  className="hidden"
                  onChange={() => {
                    setSelectedCourier(c.name)
                    setShippingCost(c.cost)
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {method === 'PICKUP' && (
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 text-sm text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-300 flex items-start gap-3">
          <Navigation className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <p className="font-bold mb-1">Lokasi Stand Pengambilan:</p>
            <p>Pondok Modern Darussalam Gontor Pusat, Ponorogo, Jawa Timur.</p>
            <p className="mt-2 text-xs opacity-80">Detail jam buka & titik stand akan diinformasikan menjelang hari H melalui WhatsApp.</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onBack} className="px-6 py-4 rounded-xl border border-gray-200 font-display font-bold text-gray-600 hover:bg-gray-50 transition-all">
          Kembali
        </button>
        <button onClick={handleNext} className="flex-1 btn-primary py-4 font-display font-bold">
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>
  )
}
