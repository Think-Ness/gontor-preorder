'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, UploadCloud, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { broadcastOrderUpdate } from '@/lib/realtime'
import { toast } from 'sonner'

interface AdminReuploadProofModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderNumber: string
}

export default function AdminReuploadProofModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
}: AdminReuploadProofModalProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Format file harus berupa gambar (JPG, PNG, WebP)')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file melebihi 5 MB')
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Pilih file gambar bukti transfer terlebih dahulu')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/admin/orders/${orderId}/reupload-proof`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengupload bukti pembayaran')

      toast.success(data.message || 'Bukti pembayaran berhasil diupload ulang!')
      broadcastOrderUpdate()
      router.refresh()
      onClose()
      setFile(null)
      setPreviewUrl(null)
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat mengupload bukti')
    } finally {
      setIsUploading(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-gray-900">Re-upload Bukti Pembayaran</h2>
              <p className="text-xs font-semibold text-blue-700">#{orderNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Gunakan fitur ini jika file bukti pembayaran yang diupload pembeli terindikasi rusak (corrupt) atau pembeli mengirimkan bukti baru melalui WhatsApp.
          </p>

          {!previewUrl ? (
            <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
              <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm font-bold text-gray-700">Klik atau tarik gambar ke sini</span>
              <span className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WebP (Maks. 5 MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview bukti pembayaran"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium truncate max-w-[220px]">
                  {file?.name}
                </span>
                <label className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                  Ganti Gambar
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-200/70 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengupload to Drive...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload & Simpan
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
