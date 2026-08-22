'use client'

import { useState, useEffect } from 'react'
import { Truck, Package, Save, Loader2, MapPin, DollarSign } from 'lucide-react'

export default function ShippingSettingsPage() {
  const [form, setForm] = useState({
    allow_pickup: true,
    allow_delivery: true,
    default_shipping_fee: 0,
    pickup_location_note: 'Stand Merchandise Utama 100 Tahun Gontor (Depan Balai Pertemuan)',
    couriers: {
      pos: true,      // POS Indonesia (Default)
      jne: true,      // JNE Express
      jnt: true,      // J&T Express
      sicepat: true,  // SiCepat Express
      wahana: true,   // Wahana Express
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings/shipping')
        if (res.ok) {
          const data = await res.json()
          setForm(prev => ({
            ...prev,
            allow_pickup: data.allow_pickup ?? true,
            allow_delivery: data.allow_delivery ?? true,
            default_shipping_fee: data.default_shipping_fee ?? 0,
            pickup_location_note: data.pickup_location_note || prev.pickup_location_note,
            couriers: data.couriers ? { ...prev.couriers, ...data.couriers } : prev.couriers,
          }))
        }
      } catch (err) {
        console.error('Failed to load shipping settings', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 font-display'

  const COURIER_LIST = [
    { id: 'pos', name: 'POS Indonesia — Kilat Khusus', tag: 'Default Utama', default: true },
    { id: 'jne', name: 'JNE Express — REG', tag: 'Ekspedisi Reguler' },
    { id: 'jnt', name: 'J&T Express — Reguler', tag: 'Ekspedisi Reguler' },
    { id: 'sicepat', name: 'SiCepat — REG', tag: 'Ekspedisi Reguler' },
    { id: 'wahana', name: 'Wahana Express', tag: 'Ekspedisi Hemat' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Pengaturan Pengiriman &amp; Fulfillment</h1>
        <p className="text-gray-500 text-sm">Kelola metode pengambilan di stand, ekspedisi kurir, &amp; opsi pengiriman alamat</p>
      </div>

      <div className="card-premium p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
            <span className="text-sm font-medium">Memuat pengaturan...</span>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
            {saved && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">✓ Pengaturan pengiriman berhasil disimpan</div>}

        {/* Option 1: Pickup */}
        <div className="p-4 rounded-xl bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-700" />
              <span className="font-display font-bold text-sm text-gray-900">Ambil Mandiri di Stand (Pickup)</span>
            </div>
            <button
              onClick={() => setForm(p => ({ ...p, allow_pickup: !p.allow_pickup }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.allow_pickup ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.allow_pickup ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lokasi Stand Pengambilan:</label>
            <input
              type="text"
              value={form.pickup_location_note}
              onChange={e => setForm(p => ({ ...p, pickup_location_note: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>

        {/* Option 2: Delivery & Couriers Selection */}
        <div className="p-4 rounded-xl bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="font-display font-bold text-sm text-gray-900">Dikirim ke Alamat Rumah (Delivery)</span>
            </div>
            <button
              onClick={() => setForm(p => ({ ...p, allow_delivery: !p.allow_delivery }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.allow_delivery ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.allow_delivery ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          {form.allow_delivery && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Pilih Ekspedisi Kurir yang Disediakan Panitia:
              </label>

              <div className="space-y-2">
                {COURIER_LIST.map(c => {
                  const isEnabled = form.couriers[c.id as keyof typeof form.couriers] ?? true
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-xs text-gray-800">{c.name}</span>
                        {c.default && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {c.tag}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setForm(p => ({
                            ...p,
                            couriers: { ...p.couriers, [c.id]: !isEnabled },
                          }))
                        }
                        className={`relative w-9 h-5 rounded-full transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isEnabled ? 'left-4.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full py-3.5 font-display font-bold text-sm flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan Pengiriman'}
        </button>
          </>
        )}
      </div>
    </div>
  )
}
