'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, Plus, Trash2, Upload, Shirt, Copy } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { buildDriveImageUrl } from '@/lib/drive-urls'

function NewProductFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const duplicateFrom = searchParams.get('duplicateFrom')

  const [loading, setLoading] = useState(false)
  const [fetchingDuplicate, setFetchingDuplicate] = useState(false)
  const [duplicatedSource, setDuplicatedSource] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    product_code: '',
    name: '',
    slug: '',
    description: '',
    product_type: 'SIMPLE' as 'SIMPLE' | 'VARIABLE',
    price: '',
    has_variants: false,
    stock_enabled: true,
    stock: '',
    is_active: true,
    display_order: 0,
    image_drive_file_id: '',
    image_url: '',
    image_filename: '',
  })

  const [variants, setVariants] = useState<Array<{ name: string; sku: string; price: string; stock: string }>>([
    { name: 'S', sku: '', price: '', stock: '50' },
    { name: 'M', sku: '', price: '', stock: '50' },
    { name: 'L', sku: '', price: '', stock: '50' },
    { name: 'XL', sku: '', price: '', stock: '50' },
  ])

  useEffect(() => {
    if (!duplicateFrom) return

    setFetchingDuplicate(true)
    fetch(`/api/admin/products/${duplicateFrom}`)
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          const prod = res.data
          setDuplicatedSource(prod.name)
          setForm({
            product_code: prod.product_code ? `${prod.product_code}-COPY` : '',
            name: prod.name ? `${prod.name} (Copy)` : '',
            slug: prod.slug ? `${prod.slug}-copy` : '',
            description: prod.description || '',
            product_type: prod.product_type || 'SIMPLE',
            price: prod.price ? String(prod.price) : '',
            has_variants: Boolean(prod.has_variants),
            stock_enabled: prod.stock_enabled ?? true,
            stock: prod.stock !== null && prod.stock !== undefined ? String(prod.stock) : '',
            is_active: prod.is_active ?? true,
            display_order: prod.display_order ?? 0,
            image_drive_file_id: prod.image_drive_file_id || '',
            image_url: prod.image_drive_file_id ? buildDriveImageUrl(prod.image_drive_file_id) : (prod.image_url || ''),
            image_filename: prod.image_filename || '',
          })

          if (prod.has_variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
            setVariants(
              prod.variants.map((v: any) => ({
                name: v.name || '',
                sku: '',
                price: v.price ? String(v.price) : '',
                stock: v.stock !== null && v.stock !== undefined ? String(v.stock) : '',
              }))
            )
          }
        }
      })
      .catch(err => {
        console.error('Gagal memuat data duplikat produk:', err)
        setError('Gagal memuat data produk yang ingin diduplikat')
      })
      .finally(() => {
        setFetchingDuplicate(false)
      })
  }, [duplicateFrom])

  const handleNameChange = (name: string) => {
    setForm(p => ({
      ...p,
      name,
      slug: slugify(name),
      product_code: p.product_code || name.substring(0, 3).toUpperCase() + '-100',
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
        image_url: data.thumbnail_url,
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
        stock: computedTotalStock,
        variants: form.has_variants ? variants.map(v => ({
          ...v,
          price: v.price ? Number(v.price) : Number(form.price),
          stock: v.stock !== '' ? Number(v.stock) : null,
        })) : [],
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat produk')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">
            {duplicatedSource ? 'Duplikat Produk' : 'Tambah Produk Baru'}
          </h1>
          <p className="text-gray-500 text-sm">
            {duplicatedSource ? `Menduplikat dari "${duplicatedSource}"` : 'Tambahkan official merchandise ke katalog pre-order'}
          </p>
        </div>
      </div>

      {fetchingDuplicate && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm p-4 rounded-xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Memuat data produk untuk diduplikat...</span>
        </div>
      )}

      {duplicatedSource && !fetchingDuplicate && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-xl flex items-start gap-3">
          <Copy className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold font-display">Mode Duplikat Produk</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Data, foto, dan varian telah diisi otomatis dari <strong>"{duplicatedSource}"</strong>. Silakan ubah nama (misal: Kaos Putih), varian, atau stok yang Anda inginkan lalu klik Simpan.
            </p>
          </div>
        </div>
      )}

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
                placeholder="Contoh: Kaos Polo 100 Tahun"
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
              placeholder="kaos-polo-100-tahun"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Deskripsi Produk</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Deskripsi produk, bahan, spesifikasi..."
              rows={3}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">Harga (Rp) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder="150000"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-display">
                Stok Total
                {form.has_variants && <span className="text-xs font-normal text-gray-400 ml-2">(Otomatis dari varian)</span>}
              </label>
              <input
                type="number"
                value={form.has_variants ? (computedTotalStock ?? '') : form.stock}
                onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                placeholder="100"
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
                {uploadingImage ? 'Uploading...' : 'Pilih Gambar Produk'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-1">Otomatis di-upload ke Google Drive</p>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="card-premium p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="font-display font-bold text-gray-900">Varian Produk (Ukuran/Warna)</h2>
              <p className="text-xs text-gray-500">Aktifkan jika produk memiliki pilihan ukuran seperti S, M, L, XL</p>
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
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {loading ? 'Menyimpan Produk...' : (duplicatedSource ? 'Simpan Produk Duplikat' : 'Simpan & Publis Produk')}
        </button>
      </form>
    </div>
  )
}

export default function NewProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    }>
      <NewProductFormContent />
    </Suspense>
  )
}
