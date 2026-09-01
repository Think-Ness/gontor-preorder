'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Save, User, MapPin, Loader2, Package, Truck, Search, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { broadcastOrderUpdate } from '@/lib/realtime'
import { toast } from 'sonner'
import MapPickerModal from '@/components/public/MapPickerModal'
import { PROVINCES_LIST, normalizeProvince } from '@/components/public/IndonesiaMapData'
import { formatRupiah } from '@/lib/utils'

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    order_number: string
    stambuk?: string | null
    full_name?: string | null
    district?: string | null
    generation_year?: number | null
    whatsapp?: string | null
    email?: string | null
    fulfillment_method?: 'PICKUP' | 'DELIVERY' | null
    shipping_address?: string | null
    shipping_village?: string | null
    shipping_district?: string | null
    shipping_city?: string | null
    shipping_province?: string | null
    shipping_postal_code?: string | null
    subtotal?: number | null
    shipping_cost?: number | null
    total_amount?: number | null
  } | null
}

const ZONE_BASE_RATES: Record<string, number> = {
  ZONA_1: 10000, // Jatim & Jateng
  ZONA_2: 15000, // DKI, Jabar, DIY, Banten, Bali
  ZONA_3: 25000, // Sumatera & NTB
  ZONA_4: 35000, // Kalimantan, Sulawesi, NTT
  ZONA_5: 48000, // Maluku & Papua
}

function determineZoneRate(province: string): number {
  const p = province.toLowerCase()
  if (p.includes('timur') && p.includes('jawa')) return ZONE_BASE_RATES.ZONA_1
  if (p.includes('tengah') && p.includes('jawa')) return ZONE_BASE_RATES.ZONA_1
  if (p.includes('barat') && p.includes('jawa')) return ZONE_BASE_RATES.ZONA_2
  if (p.includes('dki')) return ZONE_BASE_RATES.ZONA_2
  if (p.includes('banten')) return ZONE_BASE_RATES.ZONA_2
  if (p.includes('yogyakarta') || p.includes('diy')) return ZONE_BASE_RATES.ZONA_2
  if (p.includes('bali')) return ZONE_BASE_RATES.ZONA_2
  if (p.includes('sumatera') || p.includes('riau') || p.includes('lampung') || p.includes('aceh')) return ZONE_BASE_RATES.ZONA_3
  if (p.includes('nusa tenggara barat') || p.includes('ntb')) return ZONE_BASE_RATES.ZONA_3
  if (p.includes('kalimantan') || p.includes('sulawesi')) return ZONE_BASE_RATES.ZONA_4
  if (p.includes('nusa tenggara timur') || p.includes('ntt')) return ZONE_BASE_RATES.ZONA_4
  if (p.includes('maluku') || p.includes('papua')) return ZONE_BASE_RATES.ZONA_5
  return ZONE_BASE_RATES.ZONA_2
}

export default function EditOrderModal({ isOpen, onClose, order }: EditOrderModalProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)

  // Form states
  const [stambuk, setStambuk] = useState('')
  const [fullName, setFullName] = useState('')
  const [district, setDistrict] = useState('')
  const [generationYear, setGenerationYear] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingVillage, setShippingVillage] = useState('')
  const [shippingDistrict, setShippingDistrict] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingProvince, setShippingProvince] = useState('')
  const [shippingPostalCode, setShippingPostalCode] = useState('')
  const [shippingCost, setShippingCost] = useState<number>(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (order) {
      setStambuk(order.stambuk || '')
      setFullName(order.full_name || '')
      setDistrict(order.district || '')
      setGenerationYear(order.generation_year ? String(order.generation_year) : '')
      setWhatsapp(order.whatsapp || '')
      setEmail(order.email || '')
      setFulfillmentMethod(order.fulfillment_method === 'PICKUP' ? 'PICKUP' : 'DELIVERY')
      setShippingAddress(order.shipping_address || '')
      setShippingVillage(order.shipping_village || '')
      setShippingDistrict(order.shipping_district || '')
      setShippingCity(order.shipping_city || '')
      setShippingProvince(order.shipping_province || '')
      setShippingPostalCode(order.shipping_postal_code || '')
      setShippingCost(order.shipping_cost ? Number(order.shipping_cost) : 0)
    }
  }, [order])

  if (!isOpen || !order || !mounted) return null

  const subtotal = Number(order.subtotal || 0)
  const calculatedShippingCost = fulfillmentMethod === 'PICKUP' ? 0 : shippingCost
  const calculatedTotalAmount = subtotal + calculatedShippingCost

  const handleFulfillmentChange = (method: 'PICKUP' | 'DELIVERY') => {
    setFulfillmentMethod(method)
    if (method === 'PICKUP') {
      setShippingCost(0)
    } else {
      if (shippingProvince) {
        setShippingCost(determineZoneRate(shippingProvince))
      } else {
        setShippingCost(15000)
      }
    }
  }

  const handleProvinceChange = (prov: string) => {
    setShippingProvince(prov)
    if (fulfillmentMethod === 'DELIVERY' && prov) {
      const rate = determineZoneRate(prov)
      setShippingCost(rate)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stambuk: stambuk.trim(),
          full_name: fullName.trim(),
          district: district.trim(),
          generation_year: generationYear ? parseInt(generationYear, 10) : null,
          whatsapp: whatsapp.trim(),
          email: email.trim() || null,
          fulfillment_method: fulfillmentMethod,
          shipping_address: shippingAddress.trim() || null,
          shipping_village: shippingVillage.trim() || null,
          shipping_district: shippingDistrict.trim() || null,
          shipping_city: shippingCity.trim() || null,
          shipping_province: shippingProvince.trim() || null,
          shipping_postal_code: shippingPostalCode.trim() || null,
          shipping_cost: calculatedShippingCost,
          total_amount: calculatedTotalAmount,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui detail pesanan')

      toast.success('Detail pesanan & total biaya berhasil diperbarui!')
      broadcastOrderUpdate()
      router.refresh()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan data')
    } finally {
      setIsSubmitting(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900">Edit Detail Pesanan</h2>
            <p className="text-xs font-semibold text-gray-500">#{order.order_number}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form id="edit-order-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Section: Data Pemesan */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
              <User className="w-4 h-4 text-emerald-600" />
              Data Pemesan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Stambuk *</label>
                <input
                  type="text"
                  required
                  value={stambuk}
                  onChange={(e) => setStambuk(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Daerah / Konsulat *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Angkatan (Tahun) *</label>
                <input
                  type="number"
                  required
                  value={generationYear}
                  onChange={(e) => setGenerationYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">No. WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section: Pengiriman & Alamat */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Metode & Alamat Pengiriman
              </h3>
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-all"
              >
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                Cari di Peta Google
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Metode Pengiriman</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleFulfillmentChange('PICKUP')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    fulfillmentMethod === 'PICKUP'
                      ? 'bg-green-50 border-green-500 text-green-800 shadow-sm ring-1 ring-green-400'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Ambil di Stand (Pickup)
                </button>
                <button
                  type="button"
                  onClick={() => handleFulfillmentChange('DELIVERY')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    fulfillmentMethod === 'DELIVERY'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm ring-1 ring-blue-400'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  Kirim ke Rumah (Delivery)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap / Jalan</label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Jl. Merdeka No. 123..."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Desa / Kelurahan</label>
                  <input
                    type="text"
                    value={shippingVillage}
                    onChange={(e) => setShippingVillage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={shippingDistrict}
                    onChange={(e) => setShippingDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Provinsi (Zona Ongkir)</label>
                  <select
                    value={shippingProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all bg-white"
                  >
                    <option value="">Pilih Provinsi...</option>
                    {PROVINCES_LIST.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={shippingPostalCode}
                    onChange={(e) => setShippingPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium text-gray-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Biaya Ongkir (Rp)</label>
                  <input
                    type="number"
                    disabled={fulfillmentMethod === 'PICKUP'}
                    value={calculatedShippingCost}
                    onChange={(e) => setShippingCost(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-bold text-gray-900 transition-all disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Total calculation preview box */}
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1.5 text-xs text-emerald-950">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal Item:</span>
                <span className="font-semibold">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Pengiriman (Ongkir):</span>
                <span className="font-semibold">
                  {calculatedShippingCost === 0 ? 'Gratis' : formatRupiah(calculatedShippingCost)}
                </span>
              </div>
              <div className="flex justify-between border-t border-emerald-200/80 pt-2 font-display font-bold text-sm text-emerald-900">
                <span>Total Akhir Pesanan:</span>
                <span className="text-emerald-800">{formatRupiah(calculatedTotalAmount)}</span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-200/70 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="edit-order-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>

      </div>

      {/* Google Map Picker Modal */}
      <MapPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelect={(res) => {
          if (res.addressName) setShippingAddress(res.addressName)
          if (res.village) setShippingVillage(res.village)
          if (res.district) setShippingDistrict(res.district)
          if (res.city) setShippingCity(res.city)
          if (res.postalCode) setShippingPostalCode(res.postalCode)
          if (res.province) {
            const p = normalizeProvince(res.province)
            if (p) {
              setShippingProvince(p)
              if (fulfillmentMethod === 'DELIVERY') {
                setShippingCost(determineZoneRate(p))
              }
            }
          }
          setIsMapOpen(false)
        }}
      />
    </div>
  )

  return createPortal(modalContent, document.body)
}
