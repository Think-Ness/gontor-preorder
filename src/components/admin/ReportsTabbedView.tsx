'use client'

import { useState } from 'react'
import { Warehouse, Boxes, Package, Truck, FileSpreadsheet, Check, Factory, Store, BarChart3, Info } from 'lucide-react'
import Link from 'next/link'

interface VariantStats {
  total: number
  pickup: number
  delivery: number
}

interface ProductStats {
  total: number
  pickup: number
  delivery: number
  variants: Record<string, VariantStats>
}

interface Props {
  productRecap: Record<string, ProductStats>
}

type TabType = 'VENDOR' | 'PICKUP' | 'DELIVERY' | 'ALL'

export default function ReportsTabbedView({ productRecap }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('VENDOR')

  const tabList = [
    {
      id: 'VENDOR' as TabType,
      label: 'Vendor Konveksi',
      icon: Factory,
      desc: 'Khusus Rekap Total Produksi Majmuk',
      activeBorder: 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-sm',
      iconColor: 'text-blue-600',
    },
    {
      id: 'PICKUP' as TabType,
      label: 'PJ Stand Bazar',
      icon: Store,
      desc: 'Khusus Alokasi Ambil di Stand',
      activeBorder: 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-sm',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'DELIVERY' as TabType,
      label: 'PJ Kirim Alamat',
      icon: Truck,
      desc: 'Khusus Alokasi Pengiriman Kurir',
      activeBorder: 'border-purple-600 bg-purple-50/80 text-purple-950 shadow-sm',
      iconColor: 'text-purple-600',
    },
    {
      id: 'ALL' as TabType,
      label: 'Semuanya (Overview)',
      icon: BarChart3,
      desc: 'Tampilan Matriks Gabungan',
      activeBorder: 'border-gray-600 bg-gray-50/80 text-gray-950 shadow-sm',
      iconColor: 'text-gray-700',
    },
  ]

  // Filter products based on active tab
  const filteredProducts = Object.entries(productRecap)
    .map(([pName, stats]) => {
      // Filter variants based on tab
      const filteredVariants = Object.entries(stats.variants).filter(([_, vStat]) => {
        if (activeTab === 'PICKUP') return vStat.pickup > 0
        if (activeTab === 'DELIVERY') return vStat.delivery > 0
        return true
      })

      const hasRelevantQty = activeTab === 'PICKUP' 
        ? stats.pickup > 0 
        : activeTab === 'DELIVERY' 
        ? stats.delivery > 0 
        : true

      return {
        pName,
        stats,
        variants: filteredVariants,
        hasRelevantQty,
      }
    })
    .filter(p => p.hasRelevantQty && p.variants.length > 0)
    .sort((a, b) => {
      if (activeTab === 'PICKUP') return b.stats.pickup - a.stats.pickup
      if (activeTab === 'DELIVERY') return b.stats.delivery - a.stats.delivery
      return b.stats.total - a.stats.total
    })

  return (
    <div className="card-premium p-6 overflow-hidden space-y-5">
      {/* Header & Export Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-3">
        <div>
          <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-emerald-700" />
            Rekap Kebutuhan Barang Lapangan
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Pilih Tab sesuai dengan peran/tanggung jawab untuk tampilan laporan yang khusus dan tidak membingungkan.
          </p>
        </div>
        <Link 
          href="/admin/reports/export" 
          className="px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold font-display transition-all inline-flex items-center gap-1.5 shadow-2xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          Download Excel (.xlsx)
        </Link>
      </div>

      {/* Tabs Selection Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-gray-100/70 p-2 rounded-2xl border border-gray-200/60">
        {tabList.map(tab => {
          const isActive = activeTab === tab.id
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3.5 rounded-xl text-left transition-all relative ${
                isActive
                  ? `${tab.activeBorder} border-2 font-bold`
                  : 'bg-white/80 border-2 border-transparent text-gray-600 hover:bg-white hover:text-gray-900 font-semibold'
              }`}
            >
              <div className="font-display text-xs sm:text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TabIcon className={`w-4 h-4 ${tab.iconColor}`} />
                  {tab.label}
                </span>
                {isActive && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-gray-500 font-normal mt-1 leading-tight">
                {tab.desc}
              </p>
            </button>
          )
        })}
      </div>

      {/* Tab Context Banner Info */}
      <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
        activeTab === 'VENDOR' 
          ? 'bg-blue-50/80 border-blue-200 text-blue-950'
          : activeTab === 'PICKUP'
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : activeTab === 'DELIVERY'
          ? 'bg-purple-50/80 border-purple-200 text-purple-950'
          : 'bg-gray-50 border-gray-200 text-gray-800'
      }`}>
        <Info className="w-4 h-4 flex-shrink-0 opacity-80" />
        <div>
          {activeTab === 'VENDOR' && (
            <span><strong>Tampilan Khusus Vendor Konveksi:</strong> Menampilkan total Qty majmuk yang wajib diproduksi pabrik/konveksi tanpa alokasi pengiriman.</span>
          )}
          {activeTab === 'PICKUP' && (
            <span><strong>Tampilan Khusus PJ Stand Bazar (Gontor Pusat):</strong> Menampilkan hanya barang & varian yang dipilih pemesan untuk diambil langsung di Stand.</span>
          )}
          {activeTab === 'DELIVERY' && (
            <span><strong>Tampilan Khusus PJ Pengiriman (Ekspedisi/Kurir):</strong> Menampilkan hanya barang & varian yang perlu dipacking & dikirim via kurir ekspedisi.</span>
          )}
          {activeTab === 'ALL' && (
            <span><strong>Tampilan Matriks Gabungan:</strong> Menampilkan perbandingan utuh antara Total Vendor, Qty Stand Bazar, dan Qty Kirim Alamat.</span>
          )}
        </div>
      </div>

      {/* Tables View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50/80">
              <th className="py-3 px-3">Nama Produk / Katalog</th>
              <th className="py-3 px-2">Varian / Ukuran</th>
              
              {(activeTab === 'VENDOR' || activeTab === 'ALL') && (
                <th className="py-3 px-3 text-center bg-blue-50/70 text-blue-950 font-black">
                  <span className="inline-flex items-center gap-1.5 justify-center">
                    <Factory className="w-3.5 h-3.5 text-blue-700" />
                    Total Produksi Vendor
                  </span>
                </th>
              )}
              
              {(activeTab === 'PICKUP' || activeTab === 'ALL') && (
                <th className="py-3 px-3 text-center bg-emerald-50/70 text-emerald-950 font-black">
                  <span className="inline-flex items-center gap-1.5 justify-center">
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    Qty Ambil Stand
                  </span>
                </th>
              )}
              
              {(activeTab === 'DELIVERY' || activeTab === 'ALL') && (
                <th className="py-3 px-3 text-center bg-purple-50/70 text-purple-950 font-black">
                  <span className="inline-flex items-center gap-1.5 justify-center">
                    <Truck className="w-3.5 h-3.5 text-purple-700" />
                    Qty Kirim Alamat
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                  Tidak ada data barang untuk kategori ini.
                </td>
              </tr>
            ) : (
              filteredProducts.map(({ pName, stats, variants }) => (
                <tr key={pName} className="hover:bg-gray-50/50 align-top group transition-colors">
                  <td className="py-4 px-3">
                    <div className="font-display font-bold text-gray-900">{pName}</div>
                    <div className="text-xs text-gray-500 mt-1 space-x-2">
                      {activeTab === 'VENDOR' && (
                        <span>Total Produksi: <strong className="text-blue-700 font-black">{stats.total} pcs</strong></span>
                      )}
                      {activeTab === 'PICKUP' && (
                        <span>Untuk Stand: <strong className="text-emerald-700 font-black">{stats.pickup} pcs</strong></span>
                      )}
                      {activeTab === 'DELIVERY' && (
                        <span>Untuk Kirim: <strong className="text-purple-700 font-black">{stats.delivery} pcs</strong></span>
                      )}
                      {activeTab === 'ALL' && (
                        <>
                          <span>Total: <strong className="text-gray-900">{stats.total} pcs</strong></span>
                          <span>• Stand: <strong className="text-emerald-700">{stats.pickup}</strong></span>
                          <span>• Kirim: <strong className="text-purple-700">{stats.delivery}</strong></span>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-2">
                    <div className="space-y-1.5">
                      {variants.map(([vName]) => (
                        <div key={vName} className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700 inline-block sm:block">
                          {vName}
                        </div>
                      ))}
                    </div>
                  </td>

                  {(activeTab === 'VENDOR' || activeTab === 'ALL') && (
                    <td className="py-4 px-3 text-center font-bold text-blue-950 bg-blue-50/20">
                      <div className="space-y-1.5">
                        {variants.map(([vName, vStat]) => (
                          <div key={vName} className="py-1 text-xs font-black text-blue-900">
                            {vStat.total} pcs
                          </div>
                        ))}
                      </div>
                    </td>
                  )}

                  {(activeTab === 'PICKUP' || activeTab === 'ALL') && (
                    <td className="py-4 px-3 text-center font-semibold text-emerald-800 bg-emerald-50/20">
                      <div className="space-y-1.5">
                        {variants.map(([vName, vStat]) => (
                          <div key={vName} className="py-1 text-xs font-bold text-emerald-900">
                            {vStat.pickup} pcs
                          </div>
                        ))}
                      </div>
                    </td>
                  )}

                  {(activeTab === 'DELIVERY' || activeTab === 'ALL') && (
                    <td className="py-4 px-3 text-center font-semibold text-purple-800 bg-purple-50/20">
                      <div className="space-y-1.5">
                        {variants.map(([vName, vStat]) => (
                          <div key={vName} className="py-1 text-xs font-bold text-purple-900">
                            {vStat.delivery} pcs
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
