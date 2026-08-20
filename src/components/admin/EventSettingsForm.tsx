'use client'

import { useState } from 'react'
import { EventSettings } from '@/types'
import { Loader2, Save, Clock, Image as ImageIcon, Upload, Globe, Link2 } from 'lucide-react'

interface Props { initialData: EventSettings | null }

export default function EventSettingsForm({ initialData }: Props) {
  const [form, setForm] = useState({
    event_name: initialData?.event_name ?? 'Reunion Kit 100 Tahun Gontor',
    event_description: initialData?.event_description ?? '',
    preorder_start: initialData?.preorder_start ? initialData.preorder_start.slice(0, 16) : '',
    preorder_end: initialData?.preorder_end ? initialData.preorder_end.slice(0, 16) : '',
    timezone: initialData?.timezone ?? 'Asia/Jakarta',
    is_active: initialData?.is_active ?? true,
    favicon_url: initialData?.favicon_url ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Utility to parse Google Drive URLs into proxy preview URLs
  const parseFaviconUrl = (inputUrl: string) => {
    let url = inputUrl.trim()
    if (!url) return ''

    // Google Drive share link detection
    if (url.includes('drive.google.com')) {
      const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
      const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
      const fileId = matchFileD?.[1] || matchIdParam?.[1]
      if (fileId) {
        return `/api/drive/public-preview/${fileId}`
      }
    }
    return url
  }

  const handleFaviconInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    const parsed = parseFaviconUrl(rawVal)
    setForm(p => ({ ...p, favicon_url: parsed }))
  }

  const handleFaviconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('product_name', 'Website-Favicon')

      const res = await fetch('/api/upload/product-image', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengupload favicon')

      if (data.file_id) {
        setForm(p => ({ ...p, favicon_url: `/api/drive/public-preview/${data.file_id}` }))
      } else if (data.url) {
        setForm(p => ({ ...p, favicon_url: data.url }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupload gambar')
    } finally {
      setUploading(false)
    }
  }

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

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all'

  return (
    <div className="card-premium p-6 space-y-6">
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">{error}</div>}
      {saved && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-200">✓ Pengaturan berhasil disimpan</div>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Nama Event</label>
        <input value={form.event_name} onChange={e => setForm(p => ({ ...p, event_name: e.target.value }))} className={inputCls} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Deskripsi Event</label>
        <textarea value={form.event_description} onChange={e => setForm(p => ({ ...p, event_description: e.target.value }))} rows={2} className={inputCls} />
      </div>

      {/* Favicon Settings */}
      <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-800 font-display flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-700" />
            Favicon Website (Ikon Tab Browser)
          </label>
          {form.favicon_url && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 shadow-2xs">
              <span>Preview:</span>
              <img 
                src={form.favicon_url} 
                alt="Favicon Preview" 
                className="w-5 h-5 object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Link Google Drive Sharing atau URL Gambar Langsung:</div>
            <div className="relative">
              <Link2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="https://drive.google.com/file/d/FILE_ID/view atau URL gambar..."
                value={form.favicon_url}
                onChange={handleFaviconInputChange}
                className={`${inputCls} pl-10`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Atau Upload dari Komputer:</div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all shadow-2xs">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin text-green-600" /> : <Upload className="w-4 h-4 text-green-600" />}
              {uploading ? 'Mengunggah...' : 'Pilih File Gambar'}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFaviconFileUpload} 
                className="hidden" 
                disabled={uploading}
              />
            </label>
          </div>
        </div>
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

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_active ? 'left-7' : 'left-1'}`} />
        </button>
        <label className="text-sm font-semibold text-gray-700 font-display">
          Status Pre-Order: <span className={form.is_active ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>{form.is_active ? 'AKTIF' : 'NONAKTIF'}</span>
        </label>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="btn-primary w-full py-3.5 font-display font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-green-900/20">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>
    </div>
  )
}
