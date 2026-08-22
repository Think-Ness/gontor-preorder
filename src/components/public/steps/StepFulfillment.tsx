'use client'

import { useState, useMemo, useEffect } from 'react'
import { CheckoutDraft, FulfillmentMethod, Cart, CartItem } from '@/types'
import { Truck, Navigation, CheckCircle2, MapPin, Scale } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface Props {
  draft: CheckoutDraft | null
  cart?: Cart | null
  onSave: (data: Partial<CheckoutDraft>) => void
  onBack: () => void
}

// Calculate individual cart item weight in grams
function getItemWeightGram(item: CartItem): number {
  const nameLower = item.name.toLowerCase()
  if (item.itemType === 'PACKAGE' || nameLower.includes('paket') || nameLower.includes('bundling')) {
    return 1000 * item.quantity
  }
  if (nameLower.includes('jaket') || nameLower.includes('varsity') || nameLower.includes('hoodie')) {
    return 700 * item.quantity
  }
  if (nameLower.includes('kaos') || nameLower.includes('t-shirt') || nameLower.includes('baju')) {
    return 300 * item.quantity
  }
  if (nameLower.includes('peci') || nameLower.includes('topi') || nameLower.includes('songkok')) {
    return 150 * item.quantity
  }
  return 250 * item.quantity
}

// Base shipping rates per Kg for each zone
const ZONE_BASE_RATES_PER_KG: Record<string, { baseCostPerKg: number; zoneName: string }> = {
  ZONA_1: { baseCostPerKg: 10000, zoneName: 'Jawa Timur & Jawa Tengah' },
  ZONA_2: { baseCostPerKg: 15000, zoneName: 'DKI Jakarta, Jabar, DIY, Banten, Bali' },
  ZONA_3: { baseCostPerKg: 25000, zoneName: 'Sumatera & NTB' },
  ZONA_4: { baseCostPerKg: 35000, zoneName: 'Kalimantan, Sulawesi, NTT' },
  ZONA_5: { baseCostPerKg: 48000, zoneName: 'Maluku & Papua' },
}

const COURIER_MULTIPLIERS = [
  { id: 'pos', name: 'POS Indonesia — Kilat Khusus', est: '1–3 Hari', multiplier: 1.0, isDefault: true },
  { id: 'jne', name: 'JNE Express — REG', est: '2–3 Hari', multiplier: 1.2 },
  { id: 'jnt', name: 'J&T Express — Reguler', est: '1–3 Hari', multiplier: 1.15 },
  { id: 'sicepat', name: 'SiCepat — REG', est: '2–3 Hari', multiplier: 1.1 },
  { id: 'wahana', name: 'Wahana Express', est: '3–5 Hari', multiplier: 0.85 },
]

export default function StepFulfillment({ draft, cart, onSave, onBack }: Props) {
  const [method, setMethod] = useState<FulfillmentMethod>(draft?.fulfillmentMethod || 'PICKUP')
  
  // Calculate total cart weight (grams and rounded billable Kg)
  const cartWeight = useMemo(() => {
    const items = cart?.items || []
    const totalGrams = items.reduce((sum, item) => sum + getItemWeightGram(item), 0)
    const billableKg = Math.max(1, Math.ceil(totalGrams / 1000))
    return { totalGrams, billableKg }
  }, [cart?.items])

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

  const [activeZone, setActiveZone] = useState<keyof typeof ZONE_BASE_RATES_PER_KG>('ZONA_2')

  useEffect(() => {
    if (draft?.address?.province) {
      setActiveZone(determineZone(draft.address.province))
    }
  }, [draft?.address?.province])

  // Calculate dynamic weight-based tariff per courier
  const currentCouriers = useMemo(() => {
    const zoneInfo = ZONE_BASE_RATES_PER_KG[activeZone] || ZONE_BASE_RATES_PER_KG.ZONA_2
    return COURIER_MULTIPLIERS.map(c => {
      const calculatedCost = Math.round((zoneInfo.baseCostPerKg * c.multiplier * cartWeight.billableKg) / 1000) * 1000
      return {
        id: c.id,
        name: c.name,
        est: c.est,
        cost: calculatedCost,
        isDefault: c.isDefault || false,
      }
    })
  }, [activeZone, cartWeight.billableKg])

  // POS Indonesia is default courier
  const defaultPos = useMemo(() => {
    return currentCouriers.find(c => c.id === 'pos') || currentCouriers[0]
  }, [currentCouriers])

  const [selectedCourier, setSelectedCourier] = useState(draft?.address?.courierName || defaultPos.name)
  const [shippingCost, setShippingCost] = useState<number>(draft?.address?.shippingCost ?? defaultPos.cost)

  // Keep shipping cost updated with active zone tariff & total weight for selected courier
  useEffect(() => {
    const activeCourier = currentCouriers.find(c => c.name === selectedCourier)
    if (activeCourier) {
      setShippingCost(activeCourier.cost)
    } else {
      setSelectedCourier(defaultPos.name)
      setShippingCost(defaultPos.cost)
    }
  }, [activeZone, currentCouriers, defaultPos, selectedCourier])

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
            DIHITUNG PER BERAT (KG)
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

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-5">
            <p className="text-sm text-gray-700 font-semibold mb-1">{draft?.name}</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {draft?.address?.fullAddress}<br/>
              Kel/Desa {draft?.address?.village}, Kec. {draft?.address?.district}<br/>
              {draft?.address?.city}, {draft?.address?.province} - {draft?.address?.postalCode}
            </p>
            <p className="text-xs text-gray-500 mt-2 italic">*Diambil dari data Tahap 1</p>
          </div>

          {/* Weight & Zone Breakdown Card */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 mb-6 text-xs text-blue-900 space-y-1.5">
            <div className="flex justify-between items-center font-bold">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-600" /> Total Berat Paket:
              </span>
              <span className="text-blue-950 font-display font-black text-sm">{cartWeight.totalGrams} Gram ({cartWeight.billableKg} Kg)</span>
            </div>
            <div className="flex justify-between items-center text-blue-800">
              <span>📍 Zona Lokasi:</span>
              <span className="font-semibold">{ZONE_BASE_RATES_PER_KG[activeZone]?.zoneName}</span>
            </div>
            <p className="text-[11px] text-blue-700/80 pt-1 italic border-t border-blue-100/60 mt-1">
              *Tarif ongkir dihitung presisi berdasarkan berat paket ({cartWeight.billableKg} kg) &amp; tarif zona lokasi pengiriman.
            </p>
          </div>

          <h3 className="font-display font-bold text-gray-800 text-base mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Pilih Ekspedisi
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
                    <div className="font-bold text-sm text-gray-800 flex items-center gap-2">
                      <span>{c.name}</span>
                      {c.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Estimasi: {c.est} &bull; {cartWeight.billableKg} Kg</div>
                  </div>
                </div>
                <div className="font-display font-bold text-blue-700 text-sm sm:text-base">
                  {formatRupiah(c.cost)}
                </div>
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
        <button type="button" onClick={onBack} className="px-6 py-4 min-h-[48px] rounded-xl border border-gray-200 font-display font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center">
          Kembali
        </button>
        <button onClick={handleNext} className="flex-1 btn-primary py-4 min-h-[48px] font-display font-bold flex items-center justify-center">
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>
  )
}
