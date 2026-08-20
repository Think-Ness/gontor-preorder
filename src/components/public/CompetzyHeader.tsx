'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, Menu, X, ArrowRight, Globe } from 'lucide-react'

interface CompetzyHeaderProps {
  faviconUrl?: string | null
  eventName?: string
  totalItems: number
  isPreorderOpen: boolean
  onOpenCart: () => void
}

export default function CompetzyHeader({
  faviconUrl,
  eventName = 'Gontor 100 Tahun',
  totalItems,
  isPreorderOpen,
  onOpenCart,
}: CompetzyHeaderProps) {
  const [lang, setLang] = useState<'id' | 'en'>('id')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:px-8 lg:pt-5">
      <div className="relative mx-auto flex max-w-[80rem] items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 transition-transform duration-300 hover:scale-105">
          {faviconUrl ? (
            <img 
              src={faviconUrl} 
              alt="Logo" 
              className="h-9 w-9 object-contain rounded-full ring-2 ring-emerald-500/20 shadow-xs"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#5627ff] to-[#7b3fe4] text-white font-black flex items-center justify-center text-sm shadow-md">
              G
            </div>
          )}
          <span className="flex flex-col leading-none">
            <span className="font-display font-black text-sm text-[#063D2E] tracking-tight">
              {eventName}
            </span>
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider mt-0.5">
              Official Kit
            </span>
          </span>
        </Link>

        {/* Center Floating Pill Navigation (Competzy Signature Component) */}
        <nav aria-label="Beranda" className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
          <div className="relative flex items-center gap-1 rounded-[1.25rem] px-2 py-1.5 bg-white/[0.92] ring-1 ring-black/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_16px_46px_-18px_rgba(24,18,25,0.42)] backdrop-blur-2xl">
            <a href="#" className="relative flex items-center rounded-xl px-4 py-2 text-[0.88rem] font-bold text-[#5627ff] bg-purple-50/80 transition-all">
              Beranda
            </a>
            <a href="#catalog" className="relative flex items-center rounded-xl px-4 py-2 text-[0.88rem] font-semibold text-gray-600 hover:text-[#5627ff] transition-all">
              Merchandise
            </a>
            <a href="#features" className="relative flex items-center rounded-xl px-4 py-2 text-[0.88rem] font-semibold text-gray-600 hover:text-[#5627ff] transition-all">
              Keunggulan
            </a>
            <a href="#stats" className="relative flex items-center rounded-xl px-4 py-2 text-[0.88rem] font-semibold text-gray-600 hover:text-[#5627ff] transition-all">
              Statistik
            </a>
            <Link href="/track" className="relative flex items-center rounded-xl px-4 py-2 text-[0.88rem] font-semibold text-gray-600 hover:text-[#5627ff] transition-all">
              Lacak Order
            </Link>
          </div>
        </nav>

        {/* Right Actions (Language Toggle & Cart Button) */}
        <div className="flex shrink-0 items-center gap-3">
          
          {/* Language Toggle Pill (ID / EN) */}
          <div className="hidden sm:inline-flex items-center rounded-full px-1.5 py-1 border border-gray-200 bg-white text-gray-900 shadow-2xs" role="group" aria-label="Bahasa">
            <button
              type="button"
              onClick={() => setLang('id')}
              className={`relative cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[0.7rem] font-extrabold tracking-[0.14em] transition-colors duration-200 ${
                lang === 'id' ? 'bg-[#5627ff] text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`relative cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[0.7rem] font-extrabold tracking-[0.14em] transition-colors duration-200 ${
                lang === 'en' ? 'bg-[#5627ff] text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              EN
            </button>
          </div>

          {/* Action Button Competzy Style ("Buka Arena" -> "Pesan Kit →") */}
          {isPreorderOpen && (
            <button
              onClick={onOpenCart}
              className="group inline-flex items-center gap-2 rounded-full bg-[#7b3fe4] hover:bg-[#6a2fd0] text-white pl-4 pr-3 py-2 shadow-[0_8px_24px_-8px_rgba(123,63,228,0.6)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.88rem' }}
            >
              <span>Keranjang ({totalItems})</span>
              <span className="inline-flex items-center justify-center rounded-full bg-white/20 w-5 h-5 text-xs transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-white/[0.92] ring-1 ring-black/[0.06] shadow-md backdrop-blur-2xl rounded-2xl p-2.5 text-gray-800 lg:hidden"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 max-w-[80rem] mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col gap-2 font-display font-bold text-sm">
            <a href="#" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl bg-purple-50 text-[#5627ff]">
              Beranda
            </a>
            <a href="#catalog" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700">
              Katalog Merchandise
            </a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700">
              Keunggulan Sistem
            </a>
            <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700">
              Statistik 100 Tahun
            </a>
            <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 flex items-center justify-between">
              <span>Lacak Pesanan</span>
              <Search className="w-4 h-4 text-emerald-700" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
