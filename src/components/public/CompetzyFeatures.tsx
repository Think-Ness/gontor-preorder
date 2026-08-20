'use client'

import { Package, Truck, ShieldCheck, CheckCircle2, Sparkles, Award } from 'lucide-react'

export default function CompetzyFeatures() {
  const FEATURES = [
    {
      id: 1,
      title: 'Satu Pintu Order',
      desc: 'Proses memilih produk, varian ukuran, dan checkout dibuat ringkas dan transparan.',
      icon: Package,
      iconBg: 'bg-purple-100 text-[#5627ff]',
    },
    {
      id: 2,
      title: 'Opsi Pengiriman',
      desc: 'Pilihan fleksibel pengiriman langsung ke alamat Anda atau ambil gratis di Stand Reuni.',
      icon: Truck,
      iconBg: 'bg-[#dcfce7] text-[#16a34a]',
    },
    {
      id: 3,
      title: 'Verifikasi Sistematis',
      desc: 'Upload bukti pembayaran cepat dengan sistem pelacakan order yang akurat.',
      icon: CheckCircle2,
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      id: 4,
      title: 'Garansi Official',
      desc: '100% merchandise resmi yang disetujui panitia Peringatan 100 Tahun Gontor.',
      icon: Award,
      iconBg: 'bg-amber-100 text-amber-600',
    },
  ]

  return (
    <section id="features" className="relative bg-[#fdfcff] py-16 lg:py-24 border-t border-gray-100">
      <div className="mx-auto max-w-[80rem] px-6 lg:px-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Title */}
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#5627ff] text-xs font-extrabold uppercase tracking-widest border border-purple-100 font-display">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem Terintegrasi
            </div>
            
            <h2 className="font-display font-black text-2xl sm:text-4xl text-gray-950 leading-tight tracking-tight">
              Sistem Lengkap <br />
              <span className="bg-gradient-to-r from-[#5627ff] to-blue-600 bg-clip-text text-transparent">
                Mendukung Peringatan 100 Tahun
              </span>
            </h2>

            <p className="text-gray-600 text-sm sm:text-base font-body max-w-md mx-auto lg:mx-0 leading-relaxed">
              Didesain khusus untuk memudahkan ribuan Alumni & Santri dari seluruh penjuru daerah saat memesan Reunion Kit resmi.
            </p>
          </div>

          {/* Right 4 Horizontal Feature Cards (Competzy Signature Component) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <div
                  key={f.id}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${f.iconBg} transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-base text-gray-900 group-hover:text-[#5627ff] transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-body leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>

      </div>
    </section>
  )
}
