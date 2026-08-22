'use client'

import { useState, useEffect } from 'react'
import { EventSettings, PreorderStatus, Product, Package, PaymentMethod } from '@/types'
import CompetzyHeader from './CompetzyHeader'
import CompetzyCategoryGrid from './CompetzyCategoryGrid'
import IndonesiaMapSection from './IndonesiaMapSection'
import ProductCatalog from './ProductCatalog'
import CompetzyCallToAction from './CompetzyCallToAction'
import CompetzyFooter from './CompetzyFooter'
import CartDrawer from './CartDrawer'
import CountdownTimer from './CountdownTimer'
import { useCart } from '@/hooks/useCart'
import { formatRupiah } from '@/lib/utils'
import { ShoppingBag, ArrowRight, Clock, ShieldCheck, Sparkles, Award, CheckCircle2 } from 'lucide-react'
import { ProductStat, MapPinData } from '@/app/page'

interface LandingPageProps {
  settings: EventSettings | null
  preorderStatus: PreorderStatus
  products: Product[]
  packages: Package[]
  primaryPayment: PaymentMethod | null
  productStats: ProductStat[]
  mapPins: MapPinData[]
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
  productStats,
  mapPins,
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
    <div className="min-h-screen flex flex-col bg-[#f8faf9] text-gray-900 antialiased selection:bg-emerald-100 selection:text-[#063D2E]">
      
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-emerald-200/80 shadow-2xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#063D2E] animate-pulse" />
              <span className="text-[11px] font-extrabold font-display tracking-widest uppercase text-[#063D2E]">
                Official Merchandise 100 Tahun Gontor
              </span>
            </div>

            {/* Giant Headline (Competzy Style) */}
            <h1 className="font-display font-black leading-[1.08] tracking-tight text-gray-950" style={{ fontSize: 'clamp(2.3rem, 4.8vw, 3.8rem)' }}>
              <span className="block bg-gradient-to-r from-[#063D2E] via-emerald-800 to-emerald-950 bg-clip-text text-transparent">
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
              <span className="relative inline-block font-black italic text-amber-500 mx-1">
                UKHUWAH ABADI
                {/* SVG Curve Underline */}
                <svg aria-hidden="true" viewBox="0 0 200 14" preserveAspectRatio="none" className="pointer-events-none absolute left-0 right-0 -bottom-1.5 h-2 w-full">
                  <path d="M4,11 Q90,2 196,6" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              <span>seluruh alumni &amp; santri.</span>
            </p>


            {/* Primary Action CTA (Competzy Style Pill Button) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {preorderStatus === 'OPEN' ? (
                <a
                  href="#catalog"
                  className="group relative inline-flex items-center gap-3 rounded-full font-bold font-display tracking-tight text-base pl-7 pr-2.5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
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

          {/* Right Hero Visual Showcase (Countdown Timer Card) */}
          <div className="relative mx-auto w-full max-w-[28rem] lg:max-w-[32rem]">
            {preorderStatus === 'OPEN' && settings?.preorder_end ? (
              <div className="relative rounded-[2.2rem] bg-white p-6 sm:p-8 shadow-[0_24px_60px_-20px_rgba(6,61,46,0.2)] border border-emerald-100/80 text-center space-y-6 overflow-hidden">
                
                {/* Glowing Accents */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border border-amber-100 mb-2 shadow-sm">
                    <Clock className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-gray-950 uppercase tracking-tight">
                    Waktu Terbatas!
                  </h3>
                  <p className="text-sm text-gray-500 font-body">
                    Pre-order akan segera ditutup. Jangan lewatkan kesempatan emas memiliki merchandise eksklusif ini.
                  </p>
                </div>

                <div className="relative z-10 py-4">
                  <CountdownTimer endDate={settings.preorder_end} />
                </div>

                <div className="relative z-10 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-bold text-gray-600 font-display">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Edisi Terbatas</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Resmi 100Th Gontor</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="relative rounded-[2.2rem] bg-white p-8 shadow-xl border border-gray-200 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 border border-gray-100 mb-2">
                  <span className="text-4xl">🔒</span>
                </div>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-gray-950 uppercase tracking-tight">
                  Pre-Order Ditutup
                </h3>
                <p className="text-sm text-gray-500 font-body">
                  Mohon maaf, sesi pemesanan saat ini telah berakhir. Terima kasih atas partisipasi Anda.
                </p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. PURCHASE STATISTICS SECTION */}
      <CompetzyCategoryGrid
        productStats={productStats}
        totalAlumni={mapPins.filter(p => p.isAlumni).length}
        totalUmum={mapPins.filter(p => !p.isAlumni).length}
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
            productStats={productStats}
          />
        </section>
      )}

      {/* 5. INDONESIA MAP SECTION */}
      <IndonesiaMapSection mapPins={mapPins} />

      {/* 6. COMPETZY CALL TO ACTION */}
      <CompetzyCallToAction
        isPreorderOpen={preorderStatus === 'OPEN'}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 7. COMPETZY DARK FOOTER */}
      <CompetzyFooter
        faviconUrl={faviconUrl}
        eventName={settings?.event_name}
        footerTagline={settings?.footer_tagline}
        footerHashtags={settings?.footer_hashtags}
        contactWhatsapp={settings?.contact_whatsapp}
        socialInstagram={settings?.social_instagram}
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
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden pb-[env(safe-area-inset-bottom,0px)]">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 bg-[#063D2E] text-white rounded-full flex items-center justify-between px-6 shadow-2xl font-display min-h-[48px] active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-300 flex-shrink-0" />
              <span className="font-bold text-sm truncate">{totalItems} item dalam keranjang</span>
            </div>
            <span className="font-black text-amber-300 text-sm flex-shrink-0">{formatRupiah(cart.subtotal)}</span>
          </button>
        </div>
      )}

    </div>
  )
}

