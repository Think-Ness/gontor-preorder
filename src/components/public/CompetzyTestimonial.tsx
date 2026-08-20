'use client'

import { useState, useEffect } from 'react'
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface Testimonial {
  id: number
  quote: string
  name: string
  stambuk: string
  district: string
  avatar: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: 'Kehadiran Reunion Kit 100 Tahun ini sangat emosional bagi kami para alumni. Kualitas bahan kaos dan jaketnya sangat premium, standar distro!',
    name: 'Ustadz Ahmad Fauzi',
    stambuk: 'Alumni 2012 (Consulat Jakarta)',
    district: 'DKI Jakarta',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    quote: 'Proses pemesanannya serba praktis. Pengirimannya bisa langsung ke rumah atau pilih opsi Ambil di Stand saat hari Reuni Akbar 2026.',
    name: 'Muhammad Hidayat',
    stambuk: 'Alumni 2018 (Consulat Surabaya)',
    district: 'Jawa Timur',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    quote: 'Desainnya sangat gagah dan melambangkan kebanggaan 1 Abad Gontor. Wajib punya untuk segenap keluarga besar alumni!',
    name: 'Rahmat Syarifuddin',
    stambuk: 'Alumni 2015 (Consulat Medan)',
    district: 'Sumatera Utara',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  },
]

export default function CompetzyTestimonial() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % TESTIMONIALS.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  const active = TESTIMONIALS[current]

  return (
    <section className="relative bg-[#ece7f6]/50 py-16 lg:py-24 border-t border-purple-100/60">
      <div className="mx-auto max-w-[80rem] px-6 lg:px-10 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#5627ff] font-display">
              SUARA ALUMNI &amp; SANTRI
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-gray-950">
              Setiap Cenderamata, Menyatu dalam Ukhuwah.
            </h2>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-purple-50 text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrent((current + 1) % TESTIMONIALS.length)}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-purple-50 text-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonial Card (Competzy Signature Component) */}
        <div className="relative rounded-[2rem] bg-white p-6 sm:p-10 shadow-[0_20px_50px_-20px_rgba(86,39,255,0.15)] border border-purple-100/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Photo Avatar */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden shadow-xl ring-4 ring-purple-100">
                <img src={active.avatar} alt={active.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Middle Quote Text */}
            <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
              <Quote className="w-8 h-8 text-[#5627ff] opacity-40 mx-auto lg:mx-0" />
              <p className="font-display font-bold text-lg sm:text-xl text-gray-900 leading-relaxed italic">
                &ldquo;{active.quote}&rdquo;
              </p>
              <div>
                <div className="font-display font-black text-base text-gray-950">{active.name}</div>
                <div className="text-xs text-[#5627ff] font-bold">{active.stambuk}</div>
                <div className="text-xs text-gray-400 font-medium">{active.district}</div>
              </div>
            </div>

            {/* Right Social Rating & Proof */}
            <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8 text-center lg:text-left space-y-3">
              <div className="font-display font-black text-3xl text-gray-950">50K+</div>
              <div className="text-xs text-gray-500 font-medium">Alumni &amp; Simpatisan Gontor di Seluruh Dunia</div>
              
              <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                ✓ Verified Reunion Kit
              </div>
            </div>

          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? 'w-6 bg-[#5627ff]' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}
