'use client'

import { useState, useEffect } from 'react'
import { EventSettings, PreorderStatus, Product, Package, PaymentMethod } from '@/types'
import CountdownTimer from './CountdownTimer'
import ProductCatalog from './ProductCatalog'
import CartDrawer from './CartDrawer'
import PromoBannerSlider from './PromoBannerSlider'
import { useCart } from '@/hooks/useCart'
import { formatRupiah } from '@/lib/utils'
import { ShoppingBag, ChevronDown, Star, Clock, Search, ShieldCheck, Sparkles, Award } from 'lucide-react'
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
  const faviconUrl = settings?.favicon_url

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {faviconUrl ? (
              <img 
                src={faviconUrl} 
                alt="Gontor 100 Tahun Logo" 
                className="w-9 h-9 object-contain rounded-full border border-amber-400/40 shadow-sm"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-white text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg, var(--gontor-green), var(--gontor-green-light))' }}
              >
                G
              </div>
            )}
            <div>
              <div className="font-display font-bold text-sm text-green-900 leading-tight">
                {settings?.event_name || 'Gontor 100 Tahun'}
              </div>
              <div className="text-[11px] text-gray-500 font-medium">Official Merchandise</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Lacak Pesanan Button */}
            <Link
              href="/track"
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-display font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-all shadow-2xs"
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
                className="relative btn-primary px-4 py-2 flex items-center gap-2 text-sm shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Keranjang</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400 text-gray-950 text-xs font-black flex items-center justify-center shadow">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO SECTION (2-Column Desktop Grid with Rich Copy & Images)
          ============================================================ */}
      <section className="hero-bg relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24">
        {/* Decorative circles & gradients */}
        <div 
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} 
        />
        <div 
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} 
        />

        <div
          className={`max-w-6xl mx-auto px-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Hero Text & CTA */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              {/* Badges */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div 
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-md"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 text-xs font-bold font-display tracking-widest uppercase">
                    Official Merchandise 100 Tahun
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/15 backdrop-blur-md">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Edisi Terbatas Reuni Akbar</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="font-display font-black text-white" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', lineHeight: 1.15 }}>
                <span>PRE-ORDER OFFICIAL</span> <br />
                <span className="text-gradient-gold">REUNION KIT</span> <br />
                <span className="text-white">100 TAHUN GONTOR</span>
              </h1>

              {/* Inspiring Tagline & Description */}
              <div className="space-y-2">
                <p className="text-amber-300 font-display font-bold text-base sm:text-xl italic tracking-wide">
                  &ldquo;100 Tahun Mengabdi, Menjalin Ukhuwah Abadi&rdquo;
                </p>
                <p className="text-green-100 text-sm sm:text-base font-body max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Sambut peringatan 1 Abad Pondok Modern Darussalam Gontor dengan koleksi cenderamata resmi. Kualitas terbaik khusus untuk para alumni & santri seluruh nusantara.
                </p>
              </div>

              {/* Date reminder */}
              <div className="inline-flex items-center gap-2 text-green-200 text-xs sm:text-sm bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Reuni Akbar Alumni: <strong>19–20 September 2026</strong></span>
              </div>

              {/* Countdown Timer */}
              {preorderStatus === 'OPEN' && settings?.preorder_end && (
                <div className="pt-2">
                  <p className="text-amber-300 text-xs font-bold tracking-widest uppercase mb-3 font-display">
                    PRE-ORDER BERAKHIR DALAM:
                  </p>
                  <CountdownTimer endDate={settings.preorder_end} />
                </div>
              )}

              {preorderStatus === 'SCHEDULED' && settings?.preorder_start && (
                <div className="pt-2">
                  <p className="text-amber-300 text-xs font-bold tracking-widest uppercase mb-3 font-display">
                    PRE-ORDER DIBUKA DALAM:
                  </p>
                  <CountdownTimer endDate={settings.preorder_start} />
                </div>
              )}

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {preorderStatus === 'OPEN' ? (
                  <>
                    <a
                      href="#catalog"
                      className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 text-base shadow-xl shadow-amber-500/20"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Pesan Merchandise Sekarang
                    </a>
                    <a
                      href="#catalog"
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 text-base rounded-md font-display font-semibold text-white hover:bg-white/10 transition-all border border-white/20 backdrop-blur-md"
                    >
                      Lihat Katalog
                      <ChevronDown className="w-4 h-4" />
                    </a>
                  </>
                ) : preorderStatus === 'CLOSED' ? (
                  <div className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md">
                    <span className="text-2xl">🔒</span>
                    <div className="text-left">
                      <div className="text-white font-display font-bold">PRE-ORDER TELAH DITUTUP</div>
                      <div className="text-green-200 text-xs">Terima kasih atas antusiasme para Alumni</div>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-amber-500/20 border border-amber-400/30 backdrop-blur-md">
                    <Clock className="w-6 h-6 text-amber-400" />
                    <div className="text-left">
                      <div className="text-amber-300 font-display font-bold">PRE-ORDER SEGERA DIBUKA</div>
                      <div className="text-green-200 text-xs">Nantikan jadwal pendaftaran resmi</div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Visual Merchandise Image Gallery Showcase */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                
                {/* Main Hero Card Container */}
                <div className="relative z-10 bg-gradient-to-b from-white/15 to-white/5 border border-white/20 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-bold font-display border-b border-white/10 pb-3">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      MERCHANDISE REUNI 100 THN
                    </span>
                    <span className="bg-amber-400/20 px-2.5 py-0.5 rounded-full text-[10px] text-amber-200 border border-amber-400/30">
                      LIMITED KIT
                    </span>
                  </div>

                  {/* Image Grid Showcase */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative group overflow-hidden rounded-2xl bg-black/20 aspect-square border border-white/15 shadow-md">
                      <img 
                        src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" 
                        alt="Kaos 100 Tahun Gontor"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">T-Shirt Official</span>
                        <span className="text-xs font-semibold text-white truncate">Kaos Cotton 30s</span>
                      </div>
                    </div>

                    <div className="relative group overflow-hidden rounded-2xl bg-black/20 aspect-square border border-white/15 shadow-md">
                      <img 
                        src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=500&q=80" 
                        alt="Varsity Jacket 100 Tahun"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Jacket Special</span>
                        <span className="text-xs font-semibold text-white truncate">Varsity Premium</span>
                      </div>
                    </div>
                  </div>

                  {/* Feature Highlight Badge */}
                  <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-display">100% Produk Original Gontor</div>
                      <div className="text-[11px] text-gray-300 font-body">Kualitas bahan standar distro & sablon sablon tahan lama.</div>
                    </div>
                  </div>
                </div>

                {/* Floating Glow elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          INTERACTIVE PROMO BANNER AD SLIDER
          ============================================================ */}
      <PromoBannerSlider />

      {/* ============================================================
          STATS BAR
          ============================================================ */}
      <div className="bg-white border-y border-gray-200/80 py-5 my-2">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-display font-black text-2xl text-green-950">11+</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">Produk Tersedia</div>
          </div>
          <div className="border-x border-gray-200">
            <div className="font-display font-black text-2xl text-green-950">5</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">Paket Promo Hemat</div>
          </div>
          <div>
            <div className="font-display font-black text-2xl text-amber-600">100 THN</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">Peringatan Gontor</div>
          </div>
        </div>
      </div>

      {/* ============================================================
          PRODUCT CATALOG
          ============================================================ */}
      {preorderStatus !== 'CLOSED' && (
        <section id="catalog" className="flex-1 py-10 sm:py-16">
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
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          {faviconUrl && (
            <img src={faviconUrl} alt="Logo" className="w-8 h-8 object-contain mx-auto mb-2 opacity-80" />
          )}
          <div className="font-display font-bold text-white text-base">
            {settings?.event_name || 'Reunion Kit 100 Tahun Gontor'}
          </div>
          <p className="text-gray-500 text-xs max-w-md mx-auto">
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

      {/* Sticky cart button on mobile when items in cart */}
      {totalItems > 0 && preorderStatus === 'OPEN' && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn-primary w-full py-4 flex items-center justify-between px-5 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-display font-semibold">{totalItems} item dalam keranjang</span>
            </div>
            <span className="font-display font-bold">{formatRupiah(cart.subtotal)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
