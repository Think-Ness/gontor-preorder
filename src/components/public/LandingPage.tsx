'use client'

import { useState, useEffect } from 'react'
import { EventSettings, PreorderStatus, Product, Package, PaymentMethod } from '@/types'
import CountdownTimer from './CountdownTimer'
import ProductCatalog from './ProductCatalog'
import CartDrawer from './CartDrawer'
import PromoBannerSlider from './PromoBannerSlider'
import { useCart } from '@/hooks/useCart'
import { formatRupiah } from '@/lib/utils'
import { ShoppingBag, ChevronRight, Star, Clock, Search, ArrowRight, ShieldCheck, Sparkles, Award, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen flex flex-col bg-[#f8faf9] text-gray-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ============================================================
          COMPETZY FLOATING TOP HEADER
          ============================================================ */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:px-8 lg:pt-5">
        <div className="relative mx-auto flex max-w-[80rem] items-center justify-between">
          
          {/* Logo & Event Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {faviconUrl ? (
              <img 
                src={faviconUrl} 
                alt="Gontor Logo" 
                className="w-9 h-9 object-contain rounded-full shadow-sm ring-2 ring-emerald-500/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#063D2E] to-emerald-700 text-white font-black flex items-center justify-center text-sm shadow-md">
                G
              </div>
            )}
            <div>
              <div className="font-display font-black text-sm text-[#063D2E] leading-none">
                {settings?.event_name || 'Gontor 100 Tahun'}
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                Official Merchandise
              </div>
            </div>
          </Link>

          {/* Centered Floating Pill Navigation Bar (Competzy Style) */}
          <nav aria-label="Main Navigation" className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <div className="relative flex items-center gap-1 rounded-full px-2 py-1.5 bg-white/90 ring-1 ring-black/5 shadow-[0_16px_46px_-18px_rgba(6,61,46,0.2)] backdrop-blur-2xl">
              <a href="#" className="px-4 py-2 rounded-full text-xs font-bold text-emerald-900 bg-emerald-50 transition-colors">
                Beranda
              </a>
              <a href="#catalog" className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:text-emerald-900 transition-colors">
                Katalog
              </a>
              <a href="#banners" className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:text-emerald-900 transition-colors">
                Promo & Info
              </a>
              <Link href="/track" className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:text-emerald-900 transition-colors">
                Lacak Order
              </Link>
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/track"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all"
            >
              <Search className="w-3.5 h-3.5 text-emerald-700" />
              Lacak Pesanan
            </Link>

            {preorderStatus === 'OPEN' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="group relative inline-flex items-center gap-2 rounded-full bg-[#063D2E] hover:bg-[#08523e] text-white px-4 py-2 text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Keranjang</span>
                {totalItems > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-950 text-[11px] font-black flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          COMPETZY STYLE HERO SECTION
          ============================================================ */}
      <section className="competzy-hero-bg relative isolate overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-gray-200/60">
        
        {/* Floating Animated Symbols Background */}
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

        {/* Soft Radial Glow Mask Overlay */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-radial from-white/80 via-white/40 to-transparent" />

        <div className="relative z-10 mx-auto max-w-[80rem] px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] items-center gap-12 lg:gap-14">
          
          {/* Left Hero Content */}
          <div className="text-center lg:text-left space-y-6">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-emerald-200/80 shadow-2xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-extrabold font-display tracking-widest uppercase text-emerald-900">
                Official Merchandise 100 Tahun Gontor
              </span>
            </div>

            {/* Giant Headline (Competzy Style) */}
            <h1 className="font-display font-black leading-[1.08] tracking-tight text-gray-950" style={{ fontSize: 'clamp(2.3rem, 4.8vw, 3.8rem)' }}>
              <span className="block bg-gradient-to-r from-[#063D2E] via-emerald-800 to-green-700 bg-clip-text text-transparent">
                Satu Platform untuk
              </span>
              <span className="block text-[#063D2E] mt-1">
                Pemesanan Reunion Kit
              </span>
            </h1>

            {/* Subtitle & Tagline with Curved SVG Underline Accent */}
            <p className="mx-auto lg:mx-0 max-w-xl text-base sm:text-lg leading-relaxed text-gray-600 font-body">
              <span>Merchandise resmi peringatan 1 Abad Pondok Modern Darussalam Gontor. </span>
              <span className="font-bold text-gray-900">100 Tahun Mengabdi, </span>
              <span>menjalin </span>
              <span className="relative inline-block font-black italic text-emerald-800 mx-1">
                UKHUWAH ABADI
                {/* SVG Curve Underline */}
                <svg aria-hidden="true" viewBox="0 0 200 14" preserveAspectRatio="none" className="pointer-events-none absolute left-0 right-0 -bottom-1.5 h-2 w-full">
                  <path d="M4,11 Q90,2 196,6" fill="none" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              <span>seluruh alumni & santri.</span>
            </p>

            {/* Countdown or Status Alert */}
            {preorderStatus === 'OPEN' && settings?.preorder_end && (
              <div className="pt-2 max-w-md mx-auto lg:mx-0">
                <div className="p-4 rounded-2xl bg-white/90 border border-emerald-100 shadow-xl backdrop-blur-md">
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center justify-center lg:justify-start gap-1.5">
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
                  className="group relative inline-flex items-center gap-3 rounded-full font-bold font-display tracking-tight text-base pl-7 pr-2.5 py-3.5 bg-[#063D2E] hover:bg-[#08523e] text-white shadow-[0_16px_36px_-12px_rgba(6,61,46,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Pesan Merchandise Sekarang</span>
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

              <a
                href="#banners"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-emerald-900 px-4 py-2 rounded-full transition-colors"
              >
                <span>Lihat Promo & Event</span>
                <ChevronRight className="w-4 h-4" />
              </a>
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
            <div className="relative rounded-[2.2rem] bg-white p-4 sm:p-6 shadow-[0_24px_60px_-20px_rgba(6,61,46,0.25)] border border-emerald-100/80">
              
              {/* Top Banner Tag */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="font-display font-black text-sm text-[#063D2E]">REUNION KIT 100 THN</span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300/60">
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
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#063D2E] flex items-center justify-center text-amber-300 font-bold shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 font-display">Peringatan 100 Tahun Gontor</div>
                  <div className="text-[11px] text-emerald-800">Cenderamata kenangan Reuni Akbar 19-20 September 2026.</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          PROMO BANNER SLIDER SECTION
          ============================================================ */}
      <section id="banners" className="py-6">
        <PromoBannerSlider />
      </section>

      {/* ============================================================
          PRODUCT CATALOG SECTION
          ============================================================ */}
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

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="bg-gray-950 text-gray-400 py-10 text-center text-sm border-t border-gray-900">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          {faviconUrl && (
            <img src={faviconUrl} alt="Logo" className="w-8 h-8 object-contain mx-auto opacity-80" />
          )}
          <div className="font-display font-bold text-white text-base">
            {settings?.event_name || 'Reunion Kit 100 Tahun Gontor'}
          </div>
          <p className="text-gray-500 text-xs max-w-md mx-auto leading-relaxed">
            System Pre-Order Official Merchandise Peringatan 100 Tahun Gontor &mdash; Reuni Akbar 19–20 September 2026.
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

      {/* Mobile Sticky Cart Button */}
      {totalItems > 0 && preorderStatus === 'OPEN' && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 bg-[#063D2E] text-white rounded-full flex items-center justify-between px-6 shadow-2xl font-display"
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
