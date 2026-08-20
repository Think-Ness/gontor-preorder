'use client'

export default function CompetzyStats() {
  const STATS = [
    { label: 'Peringatan Sejarah', value: '100 THN', color: 'text-[#5627ff]' },
    { label: 'Alumni & Santri', value: '50.000+', color: 'text-blue-600' },
    { label: 'Pilihan Merchandise', value: '11+', color: 'text-[#d9277b]' },
    { label: 'Terverifikasi Official', value: '100%', color: 'text-emerald-600' },
  ]

  return (
    <section id="stats" className="relative bg-[#f8faf9] py-16 lg:py-24 border-t border-gray-200/60">
      <div className="mx-auto max-w-[80rem] px-6 lg:px-10 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-widest text-[#5627ff] font-display">
            REKAM JEJAK 1 ABAD
          </div>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-gray-950 leading-tight">
            Satu Abad Panggung Ukhuwah &amp; Pengabdian.
          </h2>
        </div>

        {/* 4 Big Stats Counters (Competzy Signature Component) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {STATS.map((s, idx) => (
            <div key={idx} className="space-y-1.5 p-6 rounded-3xl bg-white border border-gray-100 shadow-[0_10px_30px_rgb(0,0,0,0.03)] hover:-translate-y-1 transition-transform">
              <div className={`font-display font-black text-3xl sm:text-5xl ${s.color} tracking-tight`}>
                {s.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-500 font-body">
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
