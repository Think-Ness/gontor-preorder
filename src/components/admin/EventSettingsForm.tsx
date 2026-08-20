'use client'

import { useState } from 'react'
import { EventSettings } from '@/types'
import { Loader2, Save, Clock } from 'lucide-react'

interface Props { initialData: EventSettings | null }

export default function EventSettingsForm({ initialData }: Props) {
  const [form, setForm] = useState({
    event_name: initialData?.event_name ?? 'Reunion Kit 100 Tahun Gontor',
    event_description: initialData?.event_description ?? '',
    preorder_start: initialData?.preorder_start ? initialData.preorder_start.slice(0, 16) : '',
    preorder_end: initialData?.preorder_end ? initialData.preorder_end.slice(0, 16) : '',
    timezone: initialData?.timezone ?? 'Asia/Jakarta',
    is_active: initialData?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/admin/settings/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: initialData?.id }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100'

  return (
    <div className="card-premium p-6 space-y-5">
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {saved && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">✓ Pengaturan disimpan</div>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Nama Event</label>
        <input value={form.event_name} onChange={e => setForm(p => ({ ...p, event_name: e.target.value }))} className={inputCls} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Deskripsi</label>
        <textarea value={form.event_description} onChange={e => setForm(p => ({ ...p, event_description: e.target.value }))} rows={2} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Mulai Pre-Order
          </label>
          <input type="datetime-local" value={form.preorder_start}
            onChange={e => setForm(p => ({ ...p, preorder_start: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Berakhir Pre-Order
          </label>
          <input type="datetime-local" value={form.preorder_end}
            onChange={e => setForm(p => ({ ...p, preorder_end: e.target.value }))} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Timezone</label>
        <select value={form.timezone} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))} className={inputCls}>
          <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
          <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
          <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_active ? 'left-7' : 'left-1'}`} />
        </button>
        <label className="text-sm font-semibold text-gray-700 font-display">
          Pre-order {form.is_active ? 'AKTIF' : 'NONAKTIF'}
        </label>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="btn-primary w-full py-3 font-display font-bold flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>
    </div>
  )
}
