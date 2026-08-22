'use client'

import { useState, useEffect } from 'react'
import { Factory, Download, RefreshCw, Maximize, Minimize, Clock, CheckCircle2, Warehouse, Boxes, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function DisplayVendorPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/display?type=vendor', { cache: 'no-store' })
      const json = await res.json()
      if (json.success) {
        setData(json)
        setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      fetchData()
    }, 8000) // Auto-refresh every 8 seconds for TV screens
    return () => clearInterval(interval)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const handleDownloadExcel = () => {
    window.open('/api/admin/export?type=recap', '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      
      {/* Top Header Bar for TV Screen */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/90 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl gap-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Factory className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold font-mono tracking-widest uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                Live Monitor Produksi Vendor
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Rekapitulasi Majmuk Produksi Pabrik
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 text-blue-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Memuat...' : 'Refresh Live'}</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
              title="Toggle Fullscreen TV Mode"
            >
              {isFullscreen ? <Minimize className="w-5 h-5 text-amber-400" /> : <Maximize className="w-5 h-5 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Realtime KPI Display Cards (Giant Numbers for TV View) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-800/40 p-6 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-widest font-mono">
                Total Majmuk Produksi Wajib
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-white mt-2 tracking-tight">
                {data?.summary?.totalItemsQty ?? 0} <span className="text-2xl text-blue-400">Pcs</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Seluruh item pesanan lunas</p>
            </div>
            <Boxes className="w-14 h-14 text-blue-500/30" />
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                Alokasi Stand Bazar Gontor
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-emerald-400 mt-2 tracking-tight">
                {data?.summary?.pickupItemsQty ?? 0} <span className="text-2xl text-emerald-500/60">Pcs</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Diserap tim stand bazar</p>
            </div>
            <Warehouse className="w-14 h-14 text-emerald-500/20" />
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">
                Alokasi Kirim Ekspedisi
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-purple-400 mt-2 tracking-tight">
                {data?.summary?.deliveryItemsQty ?? 0} <span className="text-2xl text-purple-500/60">Pcs</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Diserap tim packing pengiriman</p>
            </div>
            <Warehouse className="w-14 h-14 text-purple-500/20" />
          </div>
        </div>
      </div>

      {/* Vendor Live Table (Huge Text & High Contrast) */}
      <div className="my-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex-1">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Factory className="w-6 h-6 text-blue-400" />
            Rincian Barang Produksi Konveksi
          </h2>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Update Otomatis: <span className="text-blue-300 font-bold">{lastUpdated || 'Menghubungkan...'}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-10 h-10 animate-spin mx-auto text-blue-500" />
            <p className="text-sm font-mono">Mengambil data produksi realtime...</p>
          </div>
        ) : !data?.recap || data.recap.length === 0 ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <ShieldAlert className="w-12 h-12 mx-auto text-slate-600" />
            <p className="font-bold text-lg text-slate-300">Belum Ada Pesanan Lunas</p>
            <p className="text-xs text-slate-500">Data produksi akan otomatis muncul ketika ada pembayaran terverifikasi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-950/60">
                  <th className="py-4 px-4">Katalog Merchandise</th>
                  <th className="py-4 px-4">Ukuran / Varian</th>
                  <th className="py-4 px-6 text-center bg-blue-950/60 text-blue-300 font-black text-base border-l border-r border-blue-900/40">
                    Jumlah Majmuk Wajib Produksi (Pcs)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-base">
                {data.recap.map((item: any) => {
                  const variantEntries = Object.entries(item.variants).sort((a: any, b: any) => b[1].total - a[1].total)
                  return (
                    <tr key={item.productName} className="hover:bg-slate-800/50 align-top transition-colors">
                      <td className="py-5 px-4">
                        <div className="font-display font-bold text-xl text-white">
                          {item.productName}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-mono">
                          Total Produk: <span className="text-blue-400 font-black text-sm">{item.totalQty} Pcs</span>
                        </div>
                      </td>

                      <td className="py-5 px-4">
                        <div className="space-y-2">
                          {variantEntries.map(([vName]: any) => (
                            <div key={vName} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-slate-200 inline-block sm:block">
                              {vName}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-5 px-6 text-center bg-blue-950/20 border-l border-r border-blue-900/30">
                        <div className="space-y-2">
                          {variantEntries.map(([vName, vStat]: any) => (
                            <div key={vName} className="py-1.5 text-lg font-black text-blue-300">
                              {vStat.total} <span className="text-xs text-blue-400 font-semibold">Pcs</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Display Status Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Layar Display Realtime TV — Panitia 100 Tahun Gontor</span>
        </div>
        <Link href="/admin/reports" className="text-blue-400 hover:underline font-bold">
          ← Kembali ke Dashboard Admin
        </Link>
      </div>

    </div>
  )
}
