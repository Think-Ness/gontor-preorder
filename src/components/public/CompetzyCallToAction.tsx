'use client'

import Link from 'next/link'
import { ArrowRight, Search, ShoppingBag } from 'lucide-react'

interface CompetzyCallToActionProps {
  isPreorderOpen: boolean
  onOpenCart?: () => void
}

export default function CompetzyCallToAction({ isPreorderOpen }: CompetzyCallToActionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-gray-950 py-16 lg:py-24">
      {/* Decorative Glow Background Overlay */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-radial from-white/20 via-transparent to-transparent opacity-60" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[80rem] px-6 lg:px-10 text-center space-y-6">
        
        {/* Main Headline */}
        <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-gray-950">
          Koleksimu Menunggu.
        </h2>

        {/* Subtitle */}
        <p className="max-w-xl mx-auto text-base sm:text-xl font-bold font-body text-amber-950/80">
          Official Merchandise Peringatan 100 Tahun Pondok Modern Darussalam Gontor.
        </p>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isPreorderOpen ? (
            <a
              href="#catalog"
              className="group inline-flex items-center gap-3 rounded-full font-black font-display text-base px-8 py-4 bg-gray-950 text-white shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>Pesan Sekarang</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-white group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>
          ) : (
            <div className="px-8 py-4 rounded-full bg-gray-950 text-white font-bold text-base shadow-xl">
              🔒 Pre-Order Ditutup
            </div>
          )}

          <Link
            href="/track"
            className="inline-flex items-center gap-2 rounded-full font-bold font-display text-base px-7 py-4 bg-white/20 hover:bg-white/30 text-gray-950 border border-black/10 backdrop-blur-md transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Lacak Order Pesanan</span>
          </Link>
        </div>

      </div>
    </section>
  )
}
