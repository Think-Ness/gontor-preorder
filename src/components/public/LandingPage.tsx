'use client'

import { useState, useEffect, useCallback } from 'react'
import { EventSettings, PreorderStatus, Product, Package, PaymentMethod } from '@/types'
import CountdownTimer from './CountdownTimer'
import ProductCatalog from './ProductCatalog'
import CartDrawer from './CartDrawer'
import { useCart } from '@/hooks/useCart'
import { formatRupiah } from '@/lib/utils'
import { ShoppingBag, ChevronDown, Star, Clock, Package as PackageIcon, Search } from 'lucide-react'
import Link from 'next/link'

interface LandingPageProps {
  settings: EventSettings | null
  preorderStatus: PreorderStatus
  products: Product[]
  packages: Package[]
  primaryPayment: PaymentMethod | null
}

export default function LandingPage({
  settings,
  preorderStatus,
  products,
  packages,
  primaryPayment,
}: LandingPageProps) {
  const { cart, addItem, removeItem, updateQuantity, clearCart } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, var(--gontor-green), var(--gontor-green-light))' }}
            >
              G
            </div>
            <div>
              <div className="font-display font-bold text-sm" style={{ color: 'var(--gontor-green)' }}>
                Gontor 100 Tahun
              </div>
              <div className="text-xs text-gray-500">Official Merchandise</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Lacak Pesanan Button */}
            <Link
              href="/track"
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-display font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-green-700" />
              Lacak Pesanan
            </Link>
            {/* Pre-order status badge */}
            {preorderStatus === 'OPEN' && (
              <span className="badge-open px-3 py-1 rounded-full text-xs font-semibold font-display hidden sm:flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                OPEN
              </span>
            )}
            {preorderStatus === 'CLOSED' && (
              <span className="badge-closed px-3 py-1 rounded-full text-xs font-semibold font-display hidden sm:flex">
                CLOSED
              </span>
            )}
            {preorderStatus === 'SCHEDULED' && (
              <span className="badge-scheduled px-3 py-1 rounded-full text-xs font-semibold font-display hidden sm:flex items-center gap-1">
                <Clock className="w-3 h-3" />
                SEGERA
              </span>
            )}

            {/* Cart button */}
            {preorderStatus === 'OPEN' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative btn-primary px-4 py-2 flex items-center gap-2 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Keranjang</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="hero-bg relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div
          className={`max-w-4xl mx-auto px-4 text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Event tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 text-xs font-semibold font-display tracking-widest uppercase">
              Official Merchandise
            </span>
          </div>

          {/* Main title */}
          <h1 className="font-display font-black text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1.1 }}>
            <span className="block">OPEN PRE-ORDER</span>
            <span className="text-gradient-gold block">REUNION KIT</span>
            <span className="block">100 TAHUN GONTOR</span>
          </h1>

          <p className="text-green-100 text-base sm:text-lg mb-3 font-body">
            Official Merchandise Peringatan 100 Tahun Gontor
          </p>
          <p className="text-green-200 text-sm mb-10 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Hanya tersedia sampai Reuni Akbar Alumni Gontor &mdash; 19–20 September 2026
          </p>

          {/* Countdown */}
          {preorderStatus === 'OPEN' && settings?.preorder_end && (
            <div className="mb-10">
              <p className="text-green-300 text-xs font-semibold tracking-widest uppercase mb-4 font-display">
                PRE-ORDER BERAKHIR DALAM
              </p>
              <CountdownTimer endDate={settings.preorder_end} />
            </div>
          )}

          {preorderStatus === 'SCHEDULED' && settings?.preorder_start && (
            <div className="mb-10">
              <p className="text-amber-300 text-xs font-semibold tracking-widest uppercase mb-4 font-display">
                PRE-ORDER DIBUKA DALAM
              </p>
              <CountdownTimer endDate={settings.preorder_start} />
            </div>
          )}

          {/* CTA Buttons */}
          {preorderStatus === 'OPEN' ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#catalog"
                className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
              >
                <ShoppingBag className="w-5 h-5" />
                Pesan Sekarang
              </a>
              <a
                href="#catalog"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base rounded-md font-display font-semibold text-white"
                style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}
              >
                Lihat Katalog
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          ) : preorderStatus === 'CLOSED' ? (
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="text-2xl">🔒</span>
              <div className="text-left">
                <div className="text-white font-display font-bold">PRE-ORDER TELAH DITUTUP</div>
                <div className="text-green-200 text-sm">Terima kasih atas antusiasme Anda</div>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Clock className="w-6 h-6 text-amber-400" />
              <div className="text-left">
                <div className="text-amber-300 font-display font-bold">PRE-ORDER SEGERA DIBUKA</div>
                <div className="text-green-200 text-sm">Nantikan pengumuman selanjutnya</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          STATS BAR
          ============================================================ */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-display font-bold text-xl" style={{ color: 'var(--gontor-green)' }}>11</div>
            <div className="text-xs text-gray-500 mt-0.5">Produk Tersedia</div>
          </div>
          <div className="border-x border-gray-100">
            <div className="font-display font-bold text-xl" style={{ color: 'var(--gontor-green)' }}>5</div>
            <div className="text-xs text-gray-500 mt-0.5">Paket Promo</div>
          </div>
          <div>
            <div className="font-display font-bold text-xl" style={{ color: 'var(--gontor-green)' }}>2026</div>
            <div className="text-xs text-gray-500 mt-0.5">Gontor 100 Tahun</div>
          </div>
        </div>
      </div>

      {/* ============================================================
          PRODUCT CATALOG
          ============================================================ */}
      {preorderStatus !== 'CLOSED' && (
        <section id="catalog" className="flex-1 py-12 sm:py-16">
          <ProductCatalog
            products={products}
            packages={packages}
            onAddItem={addItem}
            cart={cart}
            isOpen={preorderStatus === 'OPEN'}
          />
        </section>
      )}

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="font-display font-bold text-white mb-1">
            Reunion Kit 100 Tahun Gontor
          </div>
          <p className="text-gray-500 text-xs">
            Official merchandise system — Reuni Akbar Alumni Gontor 19–20 September 2026
          </p>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={removeItem}
        onUpdateQty={updateQuantity}
        onClear={clearCart}
        isPreorderOpen={preorderStatus === 'OPEN'}
      />

      {/* Sticky cart button on mobile when items in cart */}
      {totalItems > 0 && preorderStatus === 'OPEN' && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn-primary w-full py-4 flex items-center justify-between px-5"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-display font-semibold">{totalItems} item</span>
            </div>
            <span className="font-display font-bold">{formatRupiah(cart.subtotal)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
