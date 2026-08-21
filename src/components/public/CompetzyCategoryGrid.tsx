'use client'

import { GraduationCap, Users, TrendingUp, Package as PackageIcon, ShoppingBag, Award } from 'lucide-react'
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

  if (totalOrders === 0) return null

  const maxQty = Math.max(...productStats.map(p => p.totalQty), 1)

  return (
    <section className="relative bg-slate-50 py-12 lg:py-16 border-b border-emerald-100">
      <div className="mx-auto max-w-[80rem] px-6 lg:px-10 space-y-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#063D2E] font-display flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Most Wanted
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-950 tracking-tight">
              Produk Pilihan Alumni
            </h2>
            <p className="text-sm text-gray-500 font-body">
              Merchandise paling diburu dan direkomendasikan. Amankan milik Anda sebelum kehabisan!
            </p>
          </div>
          <a href="#catalog" className="text-xs font-bold text-[#063D2E] hover:underline flex items-center gap-1 flex-shrink-0">
            Lihat semua katalog →
          </a>
        </div>



        {/* Per-Product Stats */}
        {productStats.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 font-display">
              <Award className="w-4 h-4 text-[#063D2E]" />
              Ranking Produk Terlaris
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {productStats.map((stat, idx) => {
                const alumniPct = stat.totalQty > 0 ? (stat.alumniQty / stat.totalQty) * 100 : 0
                const umumPct = 100 - alumniPct
                const barWidth = (stat.totalQty / maxQty) * 100

                return (
                  <div
                    key={stat.productId}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Rank badge */}
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-black text-sm ${
                        idx === 0 ? 'bg-amber-400 text-amber-900' :
                        idx === 1 ? 'bg-gray-300 text-gray-700' :
                        idx === 2 ? 'bg-orange-300 text-orange-900' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Product image */}
                      {stat.imageUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={stat.imageUrl} alt={stat.productName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                          <PackageIcon className="w-5 h-5 text-[#063D2E]" />
                        </div>
                      )}

                        <div className="flex-1 min-w-0 flex items-center h-full">
                        <div className="font-display font-bold text-sm text-gray-900 truncate group-hover:text-[#063D2E] transition-colors">
                          {stat.productName}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
