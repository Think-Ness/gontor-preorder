'use client'

import { GraduationCap, Users, TrendingUp, Package as PackageIcon, ShoppingBag, Award, Crown, Flame, ArrowRight } from 'lucide-react'
import { ProductStat } from '@/app/page'

interface PurchaseStatsProps {
  productStats: ProductStat[]
  totalAlumni: number
  totalUmum: number
}

export default function CompetzyCategoryGrid({
  productStats,
  totalAlumni,
  totalUmum,
}: PurchaseStatsProps) {
  const totalOrders = totalAlumni + totalUmum

  if (totalOrders === 0 || !productStats || productStats.length === 0) return null

  // Sort stats by totalQty descending
  const sortedStats = [...productStats].sort((a, b) => b.totalQty - a.totalQty)

  const top1 = sortedStats[0]
  const top2 = sortedStats[1]
  const top3 = sortedStats[2]
  const restStats = sortedStats.slice(3)

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-50 py-12 lg:py-16 border-b border-emerald-100/80">
      <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10 space-y-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#063D2E] text-xs font-black uppercase tracking-widest font-display border border-emerald-200">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Most Wanted &bull; Live Ranking Terlaris
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-gray-950 tracking-tight">
              Produk Pilihan Alumni
            </h2>
            <p className="text-sm text-gray-600 font-body max-w-xl">
              Merchandise paling banyak dipesan dan direkomendasikan alumni. Amankan varian favorit Anda sebelum kuota habis!
            </p>
          </div>
          <a
            href="#catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#063D2E] hover:bg-[#095742] active:scale-98 text-white text-xs font-bold font-display shadow-md transition-all cursor-pointer shrink-0"
          >
            <span>Lihat Semua Katalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
          </a>
        </div>

        {/* TOP 3 PODIUM SHOWCASE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* TOP 1 - GOLD HERO CARD */}
          {top1 && (
            <a
              href="#catalog"
              className="group relative bg-gradient-to-b from-amber-500/10 via-white to-amber-50/60 rounded-3xl p-5 sm:p-6 border-2 border-amber-400 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden md:order-2 md:-translate-y-3"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-amber-950 font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-bl-2xl font-display flex items-center gap-1 shadow-xs">
                <Crown className="w-3.5 h-3.5 fill-amber-950" /> #1 Terfavorit
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400 text-amber-950 font-black font-display text-xl flex items-center justify-center shadow-md shrink-0 border border-amber-300">
                    🥇
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block font-display">RANK 1 &bull; JUARA UTAMA</span>
                    <span className="text-xs font-bold text-gray-500">Paling Banyak Dipesan</span>
                  </div>
                </div>

                <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 mb-4 border border-amber-200/80 group-hover:scale-102 transition-transform duration-300 shadow-inner">
                  {top1.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={top1.imageUrl} alt={top1.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-700">
                      <PackageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full font-display flex items-center gap-1.5 shadow-md">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{top1.totalQty} Pcs Terpesan</span>
                  </div>
                </div>

                <h3 className="font-display font-black text-lg sm:text-xl text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-2 mb-2">
                  {top1.productName}
                </h3>
              </div>

              <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between mt-2">
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg font-display">
                  🎓 {Math.round((top1.alumniQty / Math.max(top1.totalQty, 1)) * 100)}% Pemesan Alumni
                </span>
                <span className="text-xs font-black font-display text-[#063D2E] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Pesan &rarr;
                </span>
              </div>
            </a>
          )}

          {/* TOP 2 - SILVER CARD */}
          {top2 && (
            <a
              href="#catalog"
              className="group bg-white rounded-3xl p-5 border-2 border-slate-300 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between md:order-1"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-slate-200 text-slate-800 font-black font-display text-lg flex items-center justify-center shrink-0 border border-slate-300">
                      🥈
                    </div>
                    <span className="text-xs font-black text-slate-700 font-display">RANK 2 TERLARIS</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full font-display">
                    Sangat Laris
                  </span>
                </div>

                <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-200 group-hover:scale-102 transition-transform duration-300">
                  {top2.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={top2.imageUrl} alt={top2.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <PackageIcon className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-slate-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full font-display flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{top2.totalQty} Pcs Terpesan</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-base text-gray-900 group-hover:text-[#063D2E] transition-colors line-clamp-2 mb-2">
                  {top2.productName}
                </h3>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold">Pilihan Favorit Alumni</span>
                <span className="font-bold text-[#063D2E] group-hover:underline">Lihat Detail &rarr;</span>
              </div>
            </a>
          )}

          {/* TOP 3 - BRONZE CARD */}
          {top3 && (
            <a
              href="#catalog"
              className="group bg-white rounded-3xl p-5 border-2 border-amber-300/80 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between md:order-3"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 font-black font-display text-lg flex items-center justify-center shrink-0 border border-amber-200">
                      🥉
                    </div>
                    <span className="text-xs font-black text-amber-900 font-display">RANK 3 TERLARIS</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full font-display">
                    Terpopuler
                  </span>
                </div>

                <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-200 group-hover:scale-102 transition-transform duration-300">
                  {top3.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={top3.imageUrl} alt={top3.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <PackageIcon className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-amber-950/80 backdrop-blur-sm text-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full font-display flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{top3.totalQty} Pcs Terpesan</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-base text-gray-900 group-hover:text-[#063D2E] transition-colors line-clamp-2 mb-2">
                  {top3.productName}
                </h3>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold">Banyak Diminati</span>
                <span className="font-bold text-[#063D2E] group-hover:underline">Lihat Detail &rarr;</span>
              </div>
            </a>
          )}
        </div>

        {/* REST OF RANKINGS (#4 onwards) */}
        {restStats.length > 0 && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 font-display">
                <Award className="w-4 h-4 text-[#063D2E]" />
                <span>Peringkat Selanjutnya (#4 — #{sortedStats.length})</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">Berdasarkan Total Pcs Terpesan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {restStats.map((stat, idx) => {
                const rankNum = idx + 4
                return (
                  <a
                    key={stat.productId}
                    href="#catalog"
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50/90 hover:bg-emerald-50/60 border border-gray-200/80 hover:border-emerald-300 transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-200 text-gray-700 font-display font-black text-xs flex items-center justify-center shrink-0">
                      #{rankNum}
                    </div>

                    {stat.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={stat.imageUrl} alt={stat.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#063D2E] flex items-center justify-center shrink-0">
                        <PackageIcon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-xs sm:text-sm text-gray-900 truncate group-hover:text-[#063D2E] transition-colors">
                        {stat.productName}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                        <strong className="text-emerald-800">{stat.totalQty} Pcs</strong> Terpesan
                      </p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
