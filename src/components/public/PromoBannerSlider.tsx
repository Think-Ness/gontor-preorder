'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Tag, ShieldCheck, Truck, Sparkles, ArrowRight } from 'lucide-react'

interface Banner {
  id: number
  title: string
  subtitle: string
  tag: string
  tagBg: string
  gradient: string
  buttonText: string
  buttonHref: string
  icon: any
  bgDecoration: string
}

const BANNERS: Banner[] = [
  {
    id: 1,
    tag: 'SPESIAL REUNI AKBAR',
    tagBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    title: 'Paket Bundling Reunion Kit 100 Tahun',
    subtitle: 'Dapatkan kombinasi Kaos, Jaket, Peci, dan Accessories 100 Tahun dengan harga lebih hemat!',
    gradient: 'from-green-900 via-emerald-900 to-green-950',
    buttonText: 'Lihat Paket Promo',
    buttonHref: '#catalog',
    icon: Sparkles,
    bgDecoration: 'from-amber-500/20 to-emerald-500/20'
  },
  {
    id: 2,
    tag: 'PENGIRIMAN & PICKUP',
    tagBg: 'bg-blue-400/20 text-blue-300 border-blue-400/40',
    title: 'Bisa Kirim ke Rumah atau Ambil di Stand',
    subtitle: 'Kemudahan opsi pengiriman langsung ke alamat Anda atau kumpulkan di Stand Reuni Akbar Gontor 2026.',
    gradient: 'from-emerald-900 via-teal-900 to-slate-950',
    buttonText: 'Pesan Sekarang',
    buttonHref: '#catalog',
    icon: Truck,
    bgDecoration: 'from-blue-500/20 to-teal-500/20'
  },
  {
    id: 3,
    tag: 'EDISI TERBATAS 1 ABAD',
    tagBg: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
    title: '100 Tahun Peringatan Pondok Modern Gontor',
    subtitle: '"100 Tahun Mengabdi, Menjalin Ukhuwah Abadi". Miliki cenderamata eksklusif peringatan sejarah 1 abad.',
    gradient: 'from-amber-950 via-green-900 to-emerald-950',
    buttonText: 'Jelajahi Katalog',
    buttonHref: '#catalog',
    icon: ShieldCheck,
    bgDecoration: 'from-amber-400/20 to-yellow-600/20'
  }
]

export default function PromoBannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % BANNERS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentIndex((currentIndex + 1) % BANNERS.length)
  const prevSlide = () => setCurrentIndex((currentIndex - 1 + BANNERS.length) % BANNERS.length)

  const activeBanner = BANNERS[currentIndex]
  const BannerIcon = activeBanner.icon

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/10 group">
        {/* Banner Card Container */}
        <div 
          className={`relative bg-gradient-to-r ${activeBanner.gradient} text-white p-6 sm:p-10 transition-all duration-700 min-h-[220px] flex flex-col justify-between`}
        >
          {/* Decorative Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-tr ${activeBanner.bgDecoration} opacity-40 pointer-events-none`} />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          {/* Content Top */}
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border backdrop-blur-md">
              <Tag className="w-3.5 h-3.5" />
              <span>{activeBanner.tag}</span>
            </div>
            
            <h2 className="text-xl sm:text-3xl font-black font-display leading-tight tracking-tight">
              {activeBanner.title}
            </h2>

            <p className="text-gray-200 text-xs sm:text-base font-body line-clamp-2">
              {activeBanner.subtitle}
            </p>
          </div>

          {/* Content Bottom (CTA + Navigation Controls) */}
          <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-4">
            <a
              href={activeBanner.buttonHref}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black font-display text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95"
            >
              <span>{activeBanner.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {/* Slider Navigation Dots */}
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {BANNERS.map((banner, idx) => (
                <button
                  key={banner.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to banner ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
