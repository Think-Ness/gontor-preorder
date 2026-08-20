'use client'

import { useState, useEffect } from 'react'
import { EventSettings, PreorderStatus, Product, Package, PaymentMethod } from '@/types'
import CompetzyHeader from './CompetzyHeader'
import CompetzyCategoryGrid from './CompetzyCategoryGrid'
import ProductCatalog from './ProductCatalog'
import CompetzyFeatures from './CompetzyFeatures'
import CompetzyStats from './CompetzyStats'
import CompetzyTestimonial from './CompetzyTestimonial'
import CompetzyCallToAction from './CompetzyCallToAction'
import CompetzyFooter from './CompetzyFooter'
import CartDrawer from './CartDrawer'
import CountdownTimer from './CountdownTimer'
import { useCart } from '@/hooks/useCart'
import { formatRupiah } from '@/lib/utils'
import { ShoppingBag, ArrowRight, Clock, ShieldCheck, Sparkles, Award, CheckCircle2 } from 'lucide-react'

interface LandingPageProps {
  settings: EventSettings | null
  preorderStatus: PreorderStatus
  products: Product[]
  packages: Package[]
  primaryPayment: PaymentMethod | null
}

const FALLING_GLYPHS = [
  { symbol: '★', left: '6%', color: '#d97706', size: '36px', duration: '18s', delay: '-5s' },
  { symbol: '⚜', left: '15%', color: '#063D2E', size: '42px', duration: '22s', delay: '-12s' },
  { symbol: '100', left: '26%', color: '#059669', size: '32px', duration: '19s', delay: '-3s' },
  { symbol: '✨', left: '38%', color: '#d97706', size: '30px', duration: '16s', delay: '-9s' },
  { symbol: '☪', left: '52%', color: '#063D2E', size: '38px', duration: '25s', delay: '-15s' },
  { symbol: '📜', left: '64%', color: '#047857', size: '35px', duration: '21s', delay: '-7s' },
  { symbol: '⭐', left: '76%', color: '#d97706', size: '40px', duration: '17s', delay: '-2s' },
  { symbol: '🎓', left: '88%', color: '#063D2E', size: '44px', duration: '24s', delay: '-11s' },
]

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
  const faviconUrl = settings?.favicon_url

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] text-gray-900 antialiased selection:bg-purple-100 selection:text-[#5627ff]">
      
      {/* 1. COMPETZY FLOATING TOP HEADER */}
      <CompetzyHeader
        faviconUrl={faviconUrl}
        eventName={settings?.event_name}
        totalItems={totalItems}
        isPreorderOpen={preorderStatus === 'OPEN'}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 2. COMPETZY HERO SECTION */}
      <section className="competzy-hero-bg relative isolate overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-gray-200/60">
        
        {/* Animated Falling Symbols Background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {FALLING_GLYPHS.map((g, idx) => (
            <span
              key={idx}
              className="cz-fall-glyph font-mono font-bold"
              style={{
                left: g.left,
                color: g.color,
                fontSize: g.size,
                animationDuration: g.duration,
                animationDelay: g.delay,
              }}
            >
              {g.symbol}
            </span>
          ))}
        </div>

        {/* Soft Mask Overlay */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-radial from-white/80 via-white/40 to-transparent" />

        <div className="relative z-10 mx-auto max-w-[80rem] px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] items-center gap-12 lg:gap-14">
          
          {/* Left Hero Content */}
          <div className="text-center lg:text-left space-y-6">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-purple-200/80 shadow-2xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#5627ff] animate-pulse" />
              <span className="text-[11px] font-extrabold font-display tracking-widest uppercase text-[#5627ff]">
                Official Merchandise 100 Tahun Gontor
              </span>
            </div>

            {/* Giant Headline (Competzy Style) */}
            <h1 className="font-display font-black leading-[1.08] tracking-tight text-gray-950" style={{ fontSize: 'clamp(2.3rem, 4.8vw, 3.8rem)' }}>
              <span className="block bg-gradient-to-r from-[#5627ff] via-purple-700 to-indigo-800 bg-clip-text text-transparent">
                Satu Platform untuk
              </span>
              <span className="block text-[#181219] mt-1">
                Pemesanan Reunion Kit
              </span>
            </h1>

            {/* Subtitle & Tagline with Curved SVG Underline Accent */}
            <p className="mx-auto lg:mx-0 max-w-xl text-base sm:text-lg leading-relaxed text-gray-600 font-body">
              <span>Merchandise resmi peringatan 1 Abad Pondok Modern Darussalam Gontor. </span>
              <span className="font-bold text-gray-900">100 Tahun Mengabdi, </span>
              <span>menjalin </span>
              <span className="relative inline-block font-black italic text-[#d9277b] mx-1">
                UKHUWAH ABADI
                {/* SVG Curve Underline */}
                <svg aria-hidden="true" viewBox="0 0 200 14" preserveAspectRatio="none" className="pointer-events-none absolute left-0 right-0 -bottom-1.5 h-2 w-full">
                  <path d="M4,11 Q90,2 196,6" fill="none" stroke="#d9277b" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              <span>seluruh alumni &amp; santri.</span>
            </p>

            {/* Countdown or Status Alert */}
            {preorderStatus === 'OPEN' && settings?.preorder_end && (
              <div className="pt-2 max-w-md mx-auto lg:mx-0">
                <div className="p-4 rounded-2xl bg-white/90 border border-purple-100 shadow-xl backdrop-blur-md">
                  <div className="text-xs font-bold text-[#5627ff] uppercase tracking-wider mb-3 flex items-center justify-center lg:justify-start gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>PRE-ORDER BERAKHIR DALAM:</span>
                  </div>
                  <CountdownTimer endDate={settings.preorder_end} />
                </div>
              </div>
            )}

            {/* Primary Action CTA (Competzy Style Pill Button) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {preorderStatus === 'OPEN' ? (
                <a
                  href="#catalog"
                  className="group relative inline-flex items-center gap-3 rounded-full font-bold font-display tracking-tight text-base pl-7 pr-2.5 py-3.5 bg-[#d9277b] hover:bg-[#c01d6a] text-white shadow-[0_16px_36px_-12px_rgba(217,39,123,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Jelajahi Katalog Merchandise</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </a>
              ) : (
                <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-white border border-gray-200 shadow-md">
                  <span className="text-xl">🔒</span>
                  <span className="text-sm font-bold text-gray-800">Pre-Order Saat Ini Ditutup</span>
                </div>
              )}
            </div>

            {/* Feature Highlights Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-600 font-medium border-t border-gray-200/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Merchandise Resmi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bisa Kirim / Ambil Stand</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Kualitas Distro Premium</span>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Showcase (Competzy Inspired Floating Card Frame) */}
          <div className="relative mx-auto w-full max-w-[36rem] lg:max-w-none">
            <div className="relative rounded-[2.2rem] bg-white p-4 sm:p-6 shadow-[0_24px_60px_-20px_rgba(86,39,255,0.25)] border border-purple-100/80">
              
              {/* Top Banner Tag */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="font-display font-black text-sm text-gray-900">REUNION KIT 100 THN</span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-[#5627ff] border border-purple-200">
                  OFFICIAL KIT
                </span>
              </div>

              {/* Grid Images Mockup */}
              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="relative group overflow-hidden rounded-2xl bg-gray-100 aspect-square shadow-sm border border-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80" 
                    alt="Kaos Official 100 Tahun Gontor"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent p-3 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">T-Shirt Edition</span>
                    <span className="text-xs font-bold text-white">Kaos Premium 30s</span>
                  </div>
                </div>

                <div className="relative group overflow-hidden rounded-2xl bg-gray-100 aspect-square shadow-sm border border-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80" 
                    alt="Varsity Jacket 100 Tahun Gontor"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent p-3 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Varsity Jacket</span>
                    <span className="text-xs font-bold text-white">Jaket Reuni Akbar</span>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Card */}
              <div className="bg-purple-50/60 rounded-2xl p-3.5 border border-purple-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5627ff] flex items-center justify-center text-white font-bold shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-950 font-display">Peringatan 100 Tahun Gontor</div>
                  <div className="text-[11px] text-gray-600">Cenderamata kenangan Reuni Akbar 19-20 September 2026.</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. COMPETZY CATEGORY GRID ("Baru & Populer" 3-Card Group List) */}
      <CompetzyCategoryGrid
        products={products}
        packages={packages}
        onAddItem={addItem}
        cartItems={cart.items}
      />

      {/* 4. COMPETZY CATALOG SECTION ("Jelajahi Semua Merchandise") */}
      {preorderStatus !== 'CLOSED' && (
        <section id="catalog" className="flex-1 py-12 lg:py-16">
          <ProductCatalog
            products={products}
            packages={packages}
            onAddItem={addItem}
            cart={cart}
            isOpen={preorderStatus === 'OPEN'}
          />
        </section>
      )}

      {/* 5. COMPETZY FEATURES ("Platform Lengkap") */}
      <CompetzyFeatures />

      {/* 6. COMPETZY STATS COUNTER ("Lebih Dari Satu Abad") */}
      <CompetzyStats />

      {/* 7. COMPETZY ALUMNI TESTIMONIAL SHOWCASE */}
      <CompetzyTestimonial />

      {/* 8. COMPETZY CALL TO ACTION ("Koleksimu Menunggu." Full-Width Gold Banner) */}
      <CompetzyCallToAction
        isPreorderOpen={preorderStatus === 'OPEN'}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 9. COMPETZY DARK FOOTER */}
      <CompetzyFooter
        faviconUrl={faviconUrl}
        eventName={settings?.event_name}
      />

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

      {/* Mobile Sticky Cart Button */}
      {totalItems > 0 && preorderStatus === 'OPEN' && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 bg-[#5627ff] text-white rounded-full flex items-center justify-between px-6 shadow-2xl font-display"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span className="font-bold text-sm">{totalItems} item dalam keranjang</span>
            </div>
            <span className="font-black text-amber-300 text-sm">{formatRupiah(cart.subtotal)}</span>
          </button>
        </div>
      )}

    </div>
  )
}
