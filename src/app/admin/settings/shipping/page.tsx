'use client'

import { useState, useEffect } from 'react'
import { Truck, Package, Save, Loader2, MapPin, DollarSign } from 'lucide-react'

export default function ShippingSettingsPage() {
  const [form, setForm] = useState({
    allow_pickup: true,
    allow_delivery: true,
    default_shipping_fee: 0,
    pickup_location_note: 'Stand Merchandise Utama 100 Tahun Gontor (Depan Balai Pertemuan)',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Pengaturan Pengiriman & Fulfillment</h1>
        <p className="text-gray-500 text-sm">Kelola metode pengambilan di stand & opsi pengiriman alamat</p>
      </div>

      <div className="card-premium p-6 space-y-6">
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

        {/* Option 2: Delivery */}
        <div className="p-4 rounded-xl bg-gray-50 space-y-3">
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

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Biaya Ongkir Flat (Rp):</label>
            <input
              type="number"
              value={form.default_shipping_fee}
              onChange={e => setForm(p => ({ ...p, default_shipping_fee: Number(e.target.value) }))}
              placeholder="0 (Gratis Ongkir)"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">* Masukkan 0 jika ongkos kirim ditanggung panitia / gratis.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full py-3.5 font-display font-bold text-sm flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan Pengiriman'}
        </button>
      </div>
    </div>
  )
}
