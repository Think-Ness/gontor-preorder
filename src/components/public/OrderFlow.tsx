'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { EventSettings, PreorderStatus, Product, Package, PaymentMethod, CartItem } from '@/types'
import { useCart } from '@/hooks/useCart'
import { useCheckoutDraft } from '@/hooks/useCheckoutDraft'
import { formatRupiah } from '@/lib/utils'
import {
  User, ShoppingBag, Truck, CreditCard, CheckCircle,
  ChevronLeft, ChevronRight, AlertTriangle, Copy, Check, Search, Info
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Steps
import StepCustomer from './steps/StepCustomer'
import StepMerchandise from './steps/StepMerchandise'
import StepFulfillment from './steps/StepFulfillment'
import StepPayment from './steps/StepPayment'

interface OrderFlowProps {
  settings: EventSettings | null
  preorderStatus: PreorderStatus
  products: Product[]
  packages: Package[]
  paymentMethods: PaymentMethod[]
}

const STEPS = [
  { id: 1, label: 'Data', icon: User },
  { id: 2, label: 'Merchandise', icon: ShoppingBag },
  { id: 3, label: 'Pengiriman', icon: Truck },
  { id: 4, label: 'Pembayaran', icon: CreditCard },
  { id: 5, label: 'Selesai', icon: CheckCircle },
]

export default function OrderFlow({
  settings, preorderStatus, products: initialProducts, packages, paymentMethods
}: OrderFlowProps) {
  const [step, setStep] = useState(1)
  const [localProducts, setLocalProducts] = useState<Product[]>(initialProducts)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { cart, addItem, removeItem, updateQuantity, clearCart } = useCart()
  const { draft, saveDraft, clearDraft, sessionId, isLoaded } = useCheckoutDraft()
  const [showResume, setShowResume] = useState(false)
  const [copiedOrder, setCopiedOrder] = useState(false)
  const router = useRouter()

  const hasCheckedResume = useRef(false)

  // Realtime Stock Updates
  useEffect(() => {
    setLocalProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('public-stock-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          const updated = payload.new as Product
          setLocalProducts(prev => prev.map(p => p.id === updated.id ? { ...p, stock: updated.stock, stock_enabled: updated.stock_enabled } : p))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'product_variants' },
        (payload) => {
          const updatedVar = payload.new as any
          setLocalProducts(prev => prev.map(p => {
            if (!p.variants) return p
            const hasVar = p.variants.some(v => v.id === updatedVar.id)
            if (!hasVar) return p
            const updatedVariants = p.variants.map(v => v.id === updatedVar.id ? { ...v, stock: updatedVar.stock } : v)
            const sumStock = updatedVariants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
            return {
              ...p,
              stock: sumStock,
              variants: updatedVariants,
            }
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Check for existing draft on load
  useEffect(() => {
    if (isLoaded && !hasCheckedResume.current) {
      hasCheckedResume.current = true
      if (draft && draft.stambuk) {
        setShowResume(true)
      }
    }
  }, [isLoaded, draft])

  // Guard: pre-order must be OPEN
  if (preorderStatus !== 'OPEN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--gontor-green)' }}>
            {preorderStatus === 'CLOSED' ? 'Pre-Order Ditutup' : 'Pre-Order Belum Dibuka'}
          </h1>
          <p className="text-gray-500 mb-6">Pemesanan tidak dapat dilakukan saat ini.</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  // Resume dialog
  if (showResume && draft) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(13,74,43,0.1)' }}>
              <ShoppingBag className="w-8 h-8" style={{ color: 'var(--gontor-green)' }} />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Pesanan Sebelumnya Ditemukan</h2>
            <p className="text-sm text-gray-500 mb-1">
              Atas nama: <strong>{draft.name}</strong>
            </p>
            {draft.cart.length > 0 && (
              <p className="text-xs text-gray-400">{draft.cart.reduce((s, i) => s + i.quantity, 0)} item di keranjang</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                // Restore cart from draft
                if (draft.cart.length > 0) {
                  clearCart()
                  draft.cart.forEach(item => addItem(item))
                }
                setStep(draft.paymentStep || 1)
                setShowResume(false)
              }}
              className="btn-primary w-full py-3 font-display font-semibold"
            >
              Lanjutkan Pesanan
            </button>
            <button
              onClick={() => {
                clearDraft()
                clearCart()
                setShowResume(false)
              }}
              className="w-full py-3 rounded-lg border border-gray-200 text-gray-600 font-semibold font-display hover:bg-gray-50"
            >
              Mulai Baru
            </button>
          </div>
        </div>
      </div>
    )
  }

  const copyOrder = () => {
    if (!orderNumber) return
    navigator.clipboard.writeText(orderNumber)
    setCopiedOrder(true)
    setTimeout(() => setCopiedOrder(false), 2000)
  }

  // Success screen
  if (step === 5 && orderNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(22,163,74,0.1)' }}>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2 text-green-800">Pesanan Berhasil!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Terima kasih. Pesanan Anda telah diterima dan sedang diproses oleh tim panitia.
          </p>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6 text-center relative">
            <p className="text-xs text-green-700 font-semibold mb-1 uppercase tracking-widest font-display">Nomor Order Anda</p>
            <p className="font-display font-black text-3xl text-green-900 mb-3">{orderNumber}</p>
            <button
              onClick={copyOrder}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold bg-white text-green-800 border border-green-200 hover:bg-green-100 transition-all shadow-sm mx-auto"
            >
              {copiedOrder ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-green-600" />}
              {copiedOrder ? 'Nomor Order Disalin ✓' : 'Copy Nomor Order'}
            </button>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-left text-xs text-amber-800 mb-6 flex items-start gap-2.5">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 mb-0.5">PENTING: Simpan Nomor Order Ini!</p>
              <p>Nomor order berguna untuk melacak status pesanan Anda (verifikasi pembayaran, status pengerjaan, dan pengiriman) kapan saja.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <Link
              href={`/track?order=${orderNumber}`}
              className="btn-primary inline-flex items-center justify-center gap-2 w-full py-3.5 text-sm font-display font-bold"
            >
              <Search className="w-4 h-4" />
              Lacak Status Pesanan Saya
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 text-sm font-display font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </Link>
          <div className="font-display font-bold text-sm" style={{ color: 'var(--gontor-green)' }}>
            Pre-Order Reunion Kit
          </div>
          <div className="text-xs text-gray-400 font-semibold">
            {step}/4
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex items-center justify-between">
            {STEPS.slice(0, 4).map((s, i) => {
              const Icon = s.icon
              const isDone = step > s.id
              const isActive = step === s.id
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isDone ? 'step-done' : isActive ? 'step-active' : 'step-pending'
                    }`}>
                      {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-1 font-display font-semibold hidden sm:block ${
                      isActive ? 'text-green-700' : isDone ? 'text-green-600' : 'text-gray-400'
                    }`}>{s.label}</span>
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-1 sm:mb-5 rounded ${
                      step > s.id ? 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {step === 1 && (
          <StepCustomer
            draft={draft}
            onSave={(data) => {
              saveDraft({ ...data, paymentStep: 2 })
              setStep(2)
            }}
          />
        )}
        {step === 2 && (
          <StepMerchandise
            products={localProducts}
            packages={packages}
            cart={cart}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateQty={updateQuantity}
            onNext={() => {
              saveDraft({ cart: cart.items, paymentStep: 3 })
              setStep(3)
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepFulfillment
            draft={draft}
            onSave={(data) => {
              saveDraft({ ...data, paymentStep: 4 })
              setStep(4)
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepPayment
            draft={draft}
            cart={cart}
            paymentMethods={paymentMethods}
            sessionId={sessionId}
            isSubmitting={isSubmitting}
            onSubmit={async (proofData) => {
              setIsSubmitting(true)
              setError(null)
              try {
                const response = await fetch('/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    stambuk: draft?.stambuk,
                    full_name: draft?.name,
                    district: draft?.district,
                    generation_year: Number(draft?.generationYear),
                    whatsapp: draft?.whatsapp,
                    email: draft?.email,
                    fulfillment_method: draft?.fulfillmentMethod,
                    shipping_address: (draft?.address?.fullAddress || '') + (draft?.address?.courierName ? ` [Kurir: ${draft?.address?.courierName}]` : '') + (draft?.address?.googleMapsUrl ? ` [Map Pin: ${draft?.address?.googleMapsUrl}]` : ''),
                    shipping_village: draft?.address?.village,
                    shipping_district: draft?.address?.district,
                    shipping_city: draft?.address?.city,
                    shipping_province: draft?.address?.province,
                    shipping_postal_code: draft?.address?.postalCode,
                    shipping_cost: draft?.fulfillmentMethod === 'DELIVERY' ? Number(draft?.address?.shippingCost || 0) : 0,
                    items: cart.items.map(i => ({
                      productId: i.productId,
                      variantId: i.variantId,
                      packageId: i.packageId,
                      itemType: i.itemType,
                      quantity: i.quantity,
                    })),
                    ...proofData,
                    checkout_session_id: sessionId,
                  }),
                })
                const result = await response.json()
                if (!response.ok) throw new Error(result.error || 'Terjadi kesalahan')
                clearDraft()
                clearCart()
                setOrderNumber(result.order_number)
                setStep(5)
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.')
              } finally {
                setIsSubmitting(false)
              }
            }}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  )
}
