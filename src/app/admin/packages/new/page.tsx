'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, PackageIcon, Plus, Upload } from 'lucide-react'
import { compressImageFile, safeParseJsonResponse } from '@/lib/image-compression'

export default function NewPackagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    package_code: '',
    name: '',
    description: '',
    price: '',
    is_active: true,
    display_order: 0,
    image_drive_file_id: '',
    image_url: '',
    image_filename: '',
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return
    setUploadingImage(true)
    setError('')

    try {
      const file = await compressImageFile(rawFile)
      const fd = new FormData()
      fd.append('file', file)
      if (form.name) {
        fd.append('product_name', form.name)
      }

      const res = await fetch('/api/upload/product-image', {
        method: 'POST',
        body: fd,
      })

      const data = await safeParseJsonResponse(res)

      setForm(p => ({
        ...p,
        image_drive_file_id: data.file_id,
        image_url: data.url,
        image_filename: data.filename,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal upload gambar')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.package_code || !form.price) {
      setError('Mohon lengkapi data paket')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        items: [],
      }

      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push('/admin/packages')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat paket')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/packages" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Tambah Paket Promo Baru</h1>
          <p className="text-gray-500 text-sm">Buat bundel merchandise spesial Reunion Kit</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-premium p-6 space-y-4">
          <h2 className="font-display font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <PackageIcon className="w-4 h-4 text-amber-500" />
            Informasi Paket
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Nama Paket *</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Contoh: Paket Sultan 100 Tahun"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Kode Paket *</label>
              <input
                value={form.package_code}
                onChange={e => setForm(p => ({ ...p, package_code: e.target.value.toUpperCase() }))}
                placeholder="PKG-SULTAN"
                required
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Deskripsi Isi Paket</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Contoh: Termasuk 1 Kaos Polo, 1 Tumbler Stainless, 1 Pin Emas..."
              rows={3}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Harga Paket (Rp) *</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              placeholder="350000"
              required
              className={inputCls}
            />
          </div>
        </div>

        {/* Banner Paket */}
        <div className="card-premium p-6 space-y-4">
          <h2 className="font-display font-bold text-gray-900 border-b border-gray-100 pb-3">Banner Paket (Google Drive)</h2>
          <div className="flex items-center gap-4">
            {form.image_url ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                <Upload className="w-6 h-6 opacity-40" />
              </div>
            )}

            <div>
              <label className="btn-primary cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-sm">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingImage ? 'Uploading...' : 'Pilih Gambar Paket'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-1">Gambar bundel paket promo</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 font-display font-bold flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {loading ? 'Menyimpan Paket...' : 'Simpan & Publis Paket'}
        </button>
      </form>
    </div>
  )
}
