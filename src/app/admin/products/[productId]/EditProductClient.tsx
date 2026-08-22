'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, Plus, Save, Trash2, Upload, Shirt, Copy } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { Product, ProductVariant } from '@/types'
import { buildDriveImageUrl } from '@/lib/drive-urls'

interface Props {
  initialProduct: Product & { variants?: ProductVariant[] }
}

export default function EditProductClient({ initialProduct }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    product_code: initialProduct.product_code ?? '',
    name: initialProduct.name ?? '',
    slug: initialProduct.slug ?? '',
    description: initialProduct.description ?? '',
    product_type: initialProduct.product_type ?? 'SIMPLE',
    price: initialProduct.price ? String(initialProduct.price) : '',
    weight_gram: initialProduct.weight_gram !== null && initialProduct.weight_gram !== undefined ? String(initialProduct.weight_gram) : '',
    has_variants: initialProduct.has_variants ?? false,
    stock_enabled: initialProduct.stock_enabled ?? true,
    stock: initialProduct.stock !== null ? String(initialProduct.stock) : '',
    is_active: initialProduct.is_active ?? true,
    display_order: initialProduct.display_order ?? 0,
    image_drive_file_id: initialProduct.image_drive_file_id ?? '',
    image_url: initialProduct.image_drive_file_id ? buildDriveImageUrl(initialProduct.image_drive_file_id) : (initialProduct.image_url ?? ''),
    image_filename: initialProduct.image_filename ?? '',
  })

  const [variants, setVariants] = useState<Array<{ id?: string; name: string; sku: string; price: string; stock: string }>>(
    (initialProduct.variants ?? []).map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku ?? '',
      price: String(v.price),
      stock: v.stock !== null ? String(v.stock) : '',
    }))
  )

  const handleNameChange = (name: string) => {
    setForm(p => ({
      ...p,
      name,
      slug: slugify(name),
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('file', file)
      if (form.name) {
        fd.append('product_name', form.name)
      }

      const res = await fetch('/api/upload/product-image', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal upload gambar')

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

  const computedTotalStock = form.has_variants 
    ? variants.reduce((acc, v) => acc + (v.stock ? Number(v.stock) : 0), 0)
    : (form.stock !== '' ? Number(form.stock) : null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.product_code || !form.price) {
      setError('Mohon lengkapi data produk')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        weight_gram: form.weight_gram !== '' ? Number(form.weight_gram) : null,
        stock: computedTotalStock,
        variants: form.has_variants ? variants.map(v => ({
          ...v,
          price: v.price ? Number(v.price) : Number(form.price),
          stock: v.stock !== '' ? Number(v.stock) : null,
        })) : [],
      }

      const res = await fetch(`/api/admin/products/${initialProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui produk')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Hapus produk "${initialProduct.name}" secara permanen?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${initialProduct.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus produk')
    } finally {
      setDeleting(false)
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Edit Produk</h1>
            <p className="text-gray-500 text-sm">{initialProduct.product_code} — {initialProduct.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/products/new?duplicateFrom=${initialProduct.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4 text-gray-600" />
            Duplikat Produk
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Hapus Produk
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card-premium p-6 space-y-4">
          <h2 className="font-display font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Shirt className="w-4 h-4 text-green-600" />
            Informasi Produk
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Nama Produk *</label>
              <input
                value={form.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Nama Produk"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Kode Produk (SKU) *</label>
              <input
                value={form.product_code}
                onChange={e => setForm(p => ({ ...p, product_code: e.target.value.toUpperCase() }))}
                placeholder="PROD-001"
                required
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Slug URL</label>
            <input
              value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              placeholder="slug-produk"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Deskripsi Produk</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Harga (Rp) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">
                Berat (Gram)
                <span className="text-xs font-normal text-gray-400 ml-1">(Opsional)</span>
              </label>
              <input
                type="number"
                value={form.weight_gram}
                onChange={e => setForm(p => ({ ...p, weight_gram: e.target.value }))}
                placeholder="Auto Estimasi"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">
                Stok Total
                {form.has_variants && <span className="text-xs font-normal text-gray-400 ml-2">(Otomatis)</span>}
              </label>
              <input
                type="number"
                value={form.has_variants ? (computedTotalStock ?? '') : form.stock}
                onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                disabled={form.has_variants}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Product Image */}
        <div className="card-premium p-6 space-y-4">
          <h2 className="font-display font-bold text-gray-900 border-b border-gray-100 pb-3">Foto Produk (Google Drive)</h2>
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
                {uploadingImage ? 'Uploading...' : 'Ganti Gambar Produk'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-1">Otomatis tersimpan di Google Drive</p>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="card-premium p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="font-display font-bold text-gray-900">Varian Produk (Ukuran/Warna)</h2>
              <p className="text-xs text-gray-500">Kelola ukuran S, M, L, XL dan stok masing-masing</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, has_variants: !p.has_variants }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.has_variants ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.has_variants ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {form.has_variants && (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    value={v.name}
                    onChange={e => {
                      const newV = [...variants]
                      newV[idx].name = e.target.value
                      setVariants(newV)
                    }}
                    placeholder="Ukuran (misal: S)"
                    className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={v.stock}
                    onChange={e => {
                      const newV = [...variants]
                      newV[idx].stock = e.target.value
                      setVariants(newV)
                    }}
                    placeholder="Stok"
                    className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setVariants([...variants, { name: '', sku: '', price: '', stock: '50' }])}
                className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Varian
              </button>
            </div>
          )}
        </div>

        {/* Action Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 font-display font-bold flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Produk'}
        </button>
      </form>
    </div>
  )
}
