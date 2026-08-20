'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatRupiah } from '@/lib/utils'
import {
  Search, CheckCircle, Clock, Truck, Package,
  Copy, Check, AlertTriangle, ChevronLeft, ArrowRight, Info
} from 'lucide-react'
import Link from 'next/link'

interface TrackedOrder {
  id: string
  order_number: string
  stambuk: string
  full_name: string
  district: string
  generation_year: number
  fulfillment_method: 'PICKUP' | 'DELIVERY'
  shipping_address?: string
  shipping_city?: string
  shipping_province?: string
  subtotal: number
  shipping_cost: number
  total_amount: number
  payment_status: string
  order_status: string
  admin_note?: string
  created_at: string
  items: Array<{
    id: string
    name: string
    variantName?: string
    unitPrice: number
    quantity: number
    subtotal: number
  }>
}

function TrackingContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('order') || searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<TrackedOrder[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const order = orders[selectedIndex] ?? null

  const fetchTrack = async (searchVal: string) => {
    if (!searchVal.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/track?order=${encodeURIComponent(searchVal.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Pesanan tidak ditemukan')
      setOrders(data.orders || [data.order])
      setSelectedIndex(0)
    } catch (err) {
      setOrders([])
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      fetchTrack(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTrack(query)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate status steps
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PROOF_UPLOADED':
      case 'PAYMENT_REVIEW':
        return 1
      case 'PAID':
      case 'PROCESSING':
        return 2
      case 'READY_FOR_PICKUP':
      case 'SHIPPED':
        return 3
      case 'COMPLETED':
        return 4
      default:
        return 1
    }
  }

  const currentStep = order ? getStatusStep(order.order_status) : 1

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ChevronLeft className="w-4 h-4" />
            Beranda
          </Link>
          <div className="font-display font-bold text-sm" style={{ color: 'var(--gontor-green)' }}>
            Lacak Pesanan — 100 Tahun Gontor
          </div>
          <Link href="/order" className="btn-primary px-3 py-1.5 text-xs font-display font-semibold rounded-lg flex items-center gap-1">
            Pesan Kit
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-8">
        {/* Search Box */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(13,74,43,0.1)' }}>
              <Search className="w-6 h-6" style={{ color: 'var(--gontor-green)' }} />
            </div>
            <h1 className="font-display font-bold text-xl text-gray-900">Lacak Status Pesanan</h1>
            <p className="text-sm text-gray-500 mt-1">Masukkan Stambuk, Nomor Order, atau No. WhatsApp Anda</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: Stambuk (66820), No. WA, atau MCH-2026-00011"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 font-display"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-3 rounded-xl font-display font-bold text-sm flex items-center gap-2"
            >
              {loading ? 'Mencari...' : 'Cari'}
            </button>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm mb-6">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Multi-order Selector if user has multiple orders */}
        {orders.length > 1 && (
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-6">
            <p className="text-xs font-semibold text-gray-500 mb-2">Ditemukan {orders.length} pesanan untuk pencarian ini:</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {orders.map((ord, idx) => (
                <button
                  key={ord.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold whitespace-nowrap transition-all ${
                    selectedIndex === idx
                      ? 'bg-green-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {ord.order_number}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order Details Result */}
        {order && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div>
                  <div className="text-xs text-gray-400 font-display font-semibold uppercase tracking-wider mb-0.5">Nomor Order</div>
                  <div className="font-display font-black text-xl flex items-center gap-2" style={{ color: 'var(--gontor-green)' }}>
                    {order.order_number}
                    <button
                      onClick={() => handleCopy(order.order_number)}
                      className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy Nomor Order"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-0.5">Pemesan</div>
                  <div className="font-display font-bold text-sm text-gray-800">{order.full_name}</div>
                  <div className="text-xs text-gray-400">Stambuk: {order.stambuk}</div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="py-2">
                <div className="text-xs font-display font-bold text-gray-700 uppercase tracking-wider mb-4">Progres Pesanan</div>
                
                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                  {/* Step 1: Proof Uploaded */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      1
                    </div>
                    <div>
                      <p className={`text-sm font-display font-bold ${currentStep >= 1 ? 'text-green-800' : 'text-gray-400'}`}>
                        Bukti Pembayaran Diterima
                      </p>
                      <p className="text-xs text-gray-500">Bukti transfer berhasil di-upload dan tersimpan di sistem.</p>
                    </div>
                  </div>

                  {/* Step 2: Payment Review / Verified */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      2
                    </div>
                    <div>
                      <p className={`text-sm font-display font-bold ${currentStep >= 2 ? 'text-green-800' : 'text-gray-400'}`}>
                        {currentStep >= 2 ? 'Pembayaran Terverifikasi & Diproses' : 'Verifikasi Pembayaran Panitia'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentStep >= 2
                          ? 'Pembayaran valid! Pesanan sedang disiapkan oleh tim panitia.'
                          : 'Panitia keuangan sedang memverifikasi bukti pembayaran Anda.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Fulfillment */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      3
                    </div>
                    <div>
                      <p className={`text-sm font-display font-bold ${currentStep >= 3 ? 'text-green-800' : 'text-gray-400'}`}>
                        {order.fulfillment_method === 'PICKUP' ? 'Siap Diambil di Stand Acara' : 'Dikirim ke Alamat'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.fulfillment_method === 'PICKUP'
                          ? 'Dapat diambil mandiri di stand merchandise 100 Tahun Gontor.'
                          : `Dikirimkan ke: ${order.shipping_address || 'Alamat pendaftaran'}`}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Complete */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep >= 4 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      4
                    </div>
                    <div>
                      <p className={`text-sm font-display font-bold ${currentStep >= 4 ? 'text-green-800' : 'text-gray-400'}`}>
                        Pesanan Selesai
                      </p>
                      <p className="text-xs text-gray-500">Merchandise telah diserahterimakan secara lengkap.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Note if any */}
              {order.admin_note && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <p className="font-bold mb-1">Catatan Panitia:</p>
                  <p>{order.admin_note}</p>
                </div>
              )}
            </div>

            {/* Rincian Item */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-display font-bold text-sm text-gray-800 mb-3">Rincian Barang yang Dipesan</h3>
              <div className="space-y-2 mb-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      {item.variantName && <p className="text-xs text-gray-400">Varian: {item.variantName}</p>}
                      <p className="text-xs text-gray-500">{item.quantity} x {formatRupiah(item.unitPrice)}</p>
                    </div>
                    <span className="font-display font-bold text-sm" style={{ color: 'var(--gontor-green)' }}>
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center font-display font-bold text-base">
                <span>TOTAL PEMBAYARAN</span>
                <span style={{ color: 'var(--gontor-green)' }}>{formatRupiah(order.total_amount)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm font-display text-gray-400">Memuat halaman lacak pesanan...</p>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  )
}
