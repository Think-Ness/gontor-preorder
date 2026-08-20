'use client'

import { useState, useRef, useCallback } from 'react'
import { CheckoutDraft, PaymentMethod, CartItem } from '@/types'
import { formatRupiah, formatNumber } from '@/lib/utils'
import {
  CreditCard, Copy, Check, Upload, X, ChevronLeft,
  Loader2, AlertTriangle, FileImage, Info
} from 'lucide-react'
import Image from 'next/image'

interface Cart { items: CartItem[]; subtotal: number }

interface ProofData {
  payment_proof_file_id: string
  payment_proof_filename: string
  payment_proof_mime_type: string
  payment_proof_size: number
  payment_proof_url: string
}

interface Props {
  draft: CheckoutDraft | null
  cart: Cart
  paymentMethods: PaymentMethod[]
  sessionId: string
  isSubmitting: boolean
  onSubmit: (proofData: ProofData) => Promise<void>
  onBack: () => void
}

const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 5)
const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function StepPayment({ draft, cart, paymentMethods, sessionId, isSubmitting, onSubmit, onBack }: Props) {
  const primaryMethod = paymentMethods[0] ?? null
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [proof, setProof] = useState<{ file: File; preview: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedProof, setUploadedProof] = useState<ProofData | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const shipping = draft?.fulfillmentMethod === 'DELIVERY' ? Number(draft?.address?.shippingCost || 0) : 0
  const total = cart.subtotal + shipping

  const copyAccount = () => {
    if (!primaryMethod) return
    navigator.clipboard.writeText(primaryMethod.account_number)
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  const copyAmount = () => {
    navigator.clipboard.writeText(formatNumber(total))
    setCopiedAmount(true)
    setTimeout(() => setCopiedAmount(false), 2000)
  }

  const handleFileChange = useCallback(async (file: File) => {
    setUploadError(null)
    setUploadedProof(null)

    if (!ACCEPTED.includes(file.type)) {
      setUploadError('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`Ukuran file melebihi ${MAX_MB} MB.`)
      return
    }

    const preview = URL.createObjectURL(file)
    setProof({ file, preview })

    // Upload to server
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('order_draft_id', draft?.draftId ?? 'unknown')
      if (draft?.name) {
        formData.append('customer_name', draft.name)
      }

      const res = await fetch('/api/upload/payment-proof', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload gagal')
      setUploadedProof(data)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload gagal. Coba lagi.')
      setProof(null)
    } finally {
      setUploading(false)
    }
  }, [draft])

  const canSubmit = !isSubmitting && !uploading && !!uploadedProof && cart.items.length > 0

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(13,74,43,0.1)' }}>
          <CreditCard className="w-6 h-6" style={{ color: 'var(--gontor-green)' }} />
        </div>
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--gontor-green-dark)' }}>Pembayaran</h2>
        <p className="text-sm text-gray-500 mt-1">Transfer dan upload bukti pembayaran</p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-display font-bold text-sm text-gray-700 mb-3">Ringkasan Pesanan</h3>
        <div className="space-y-2 mb-3">
          {cart.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600 truncate flex-1 mr-3">
                {item.name}{item.variantName ? ` — ${item.variantName}` : ''} ×{item.quantity}
              </span>
              <span className="font-semibold text-gray-800 flex-shrink-0">
                {formatRupiah(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold">{formatRupiah(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Ongkos Kirim</span>
            <span className="font-semibold text-green-600">{shipping === 0 ? 'Gratis' : formatRupiah(shipping)}</span>
          </div>
          <div className="flex justify-between font-display font-bold text-base pt-1 border-t border-gray-100">
            <span>TOTAL</span>
            <span style={{ color: 'var(--gontor-green)' }}>{formatRupiah(total)}</span>
          </div>
        </div>
      </div>

      {/* ATM Card */}
      {primaryMethod && (
        <div className="atm-card p-6 relative">
          <div className="relative z-10">
            {/* Bank name */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-white/70 text-xs font-display font-semibold tracking-widest uppercase">
                {primaryMethod.bank_name}
              </span>
              <div className="w-8 h-5 rounded bg-amber-400/30 border border-amber-400/50" />
            </div>

            {/* Account number */}
            <div className="mb-6">
              <div className="text-white/50 text-xs mb-1 font-display">Nomor Rekening</div>
              <div className="font-display font-black text-white text-2xl tracking-widest">
                {primaryMethod.account_number.replace(/(\d{4})(?=\d)/g, '$1 ')}
              </div>
            </div>

            {/* Account holder */}
            <div className="mb-5">
              <div className="text-white/50 text-xs mb-0.5 font-display">Atas Nama</div>
              <div className="text-white font-display font-bold text-sm">{primaryMethod.account_holder}</div>
            </div>

            {/* Copy button */}
            <button
              onClick={copyAccount}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}
            >
              {copiedAccount ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
              {copiedAccount ? 'Nomor Disalin ✓' : 'Copy Nomor Rekening'}
            </button>
          </div>
        </div>
      )}

      {/* Copy Amount */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">Total Pembayaran</div>
            <div className="font-display font-black text-2xl" style={{ color: 'var(--gontor-green)' }}>
              {formatRupiah(total)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Transfer tepat sejumlah ini</div>
          </div>
          <button
            onClick={copyAmount}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-display font-semibold text-sm transition-all"
            style={{
              background: copiedAmount ? 'rgba(22,163,74,0.1)' : 'rgba(13,74,43,0.08)',
              border: '1px solid rgba(13,74,43,0.15)',
              color: 'var(--gontor-green)',
            }}
          >
            {copiedAmount ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedAmount ? 'Disalin' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
        <h3 className="font-display font-bold text-sm text-amber-800 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Petunjuk Pembayaran
        </h3>
        <ol className="space-y-1.5 text-sm text-amber-700">
          {[
            'Copy nomor rekening di atas',
            'Copy nominal pembayaran',
            'Lakukan transfer melalui m-banking atau ATM',
            'Pastikan nominal transfer TEPAT sesuai',
            'Screenshot/foto bukti transfer',
            'Upload bukti di bawah ini',
            'Klik Submit Pesanan',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: 'rgba(245,158,11,0.2)', color: '#d97706' }}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Upload Proof */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-display font-bold text-sm text-gray-700 mb-3">
          Upload Bukti Pembayaran <span className="text-red-400">*</span>
        </h3>

        {!proof && !uploading && (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
          >
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-display font-semibold text-gray-500">Klik untuk upload bukti transfer</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — maks. {MAX_MB} MB</p>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED.join(',')}
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }}
            />
          </div>
        )}

        {uploading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--gontor-green)' }} />
            <p className="text-sm text-gray-500 font-display">Mengupload bukti pembayaran...</p>
          </div>
        )}

        {proof && !uploading && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-50">
              <Image src={proof.preview} alt="Bukti pembayaran" fill className="object-contain" />
              <button
                onClick={() => { setProof(null); setUploadedProof(null); setUploadError(null) }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadedProof ? (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-lg">
                <Check className="w-4 h-4 flex-shrink-0" />
                Bukti pembayaran berhasil disimpan
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2.5 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                Menyimpan...
              </div>
            )}
          </div>
        )}

        {uploadError && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg mt-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p>{uploadError}</p>
              <button
                onClick={() => { setUploadError(null); fileRef.current?.click() }}
                className="text-xs underline mt-1 font-semibold"
              >
                Coba upload ulang
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-display font-semibold hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => uploadedProof && onSubmit(uploadedProof)}
          disabled={!canSubmit}
          className={`flex-1 py-4 rounded-xl font-display font-bold flex items-center justify-center gap-2 text-base transition-all ${
            canSubmit
              ? 'btn-primary'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Submit Pesanan
            </>
          )}
        </button>
      </div>
    </div>
  )
}
