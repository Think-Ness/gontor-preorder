'use client'

import { useState, useEffect } from 'react'
import { Factory, Download, RefreshCw, Maximize, Minimize, Clock, Boxes, Warehouse, ShieldCheck } from 'lucide-react'
import DisplayPinModal from '@/components/public/DisplayPinModal'
import { subscribeToOrdersRealtime } from '@/lib/realtime'

export default function PublicDisplayVendorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Verify PIN stored in sessionStorage on mount
  useEffect(() => {
    const savedPin = sessionStorage.getItem('display_pin_vendor')
    if (savedPin) {
      verifySavedPin(savedPin)
    } else {
      setCheckingAuth(false)
    }
  }, [])

  const verifySavedPin = async (pin: string) => {
    try {
      const res = await fetch('/api/display/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'vendor', pin }),
      })
      if (res.ok) {
        setIsAuthenticated(true)
        fetchData()
      } else {
        sessionStorage.removeItem('display_pin_vendor')
      }
    } catch {
      sessionStorage.removeItem('display_pin_vendor')
    } finally {
      setCheckingAuth(false)
    }
  }

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
    if (!isAuthenticated) return

    fetchData()

    const unsubscribeRealtime = subscribeToOrdersRealtime(() => {
      fetchData()
    })

    const interval = setInterval(() => {
      fetchData()
    }, 5000)

    return () => {
      unsubscribeRealtime()
      clearInterval(interval)
    }
  }, [isAuthenticated])

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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4 text-[#063D2E]">
        <div className="flex items-center gap-3 font-display font-bold">
          <RefreshCw className="w-5 h-5 animate-spin text-[#063D2E]" />
          <span>Memeriksa Otorisasi Monitor...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <DisplayPinModal
        role="vendor"
        title="Monitor Realtime Vendor Konveksi"
        onSuccess={() => {
          setIsAuthenticated(true)
          fetchData()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-900 p-4 sm:p-8 font-sans antialiased flex flex-col justify-between selection:bg-emerald-100 selection:text-[#063D2E]">
      
      {/* Top Gontor Branded Header Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-gray-200/80 p-4 sm:p-6 rounded-3xl shadow-md gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, var(--gontor-green, #063D2E), var(--gontor-green-light, #0a523e))' }}
            >
              <Factory className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#063D2E] text-xs font-bold font-display uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                Live Monitor Realtime Vendor Konveksi
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-950 tracking-tight">
                Rekapitulasi Majmuk Produksi Pabrik
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 text-[#063D2E] ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Memuat...' : 'Refresh Live'}</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="px-5 py-2.5 rounded-2xl bg-[#063D2E] hover:bg-[#0a523e] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 transition-all"
              title="Toggle Fullscreen TV Mode"
            >
              {isFullscreen ? <Minimize className="w-5 h-5 text-[#063D2E]" /> : <Maximize className="w-5 h-5 text-[#063D2E]" />}
            </button>
          </div>
        </div>

        {/* Realtime KPI Display Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-[#063D2E]/20 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#063D2E] uppercase tracking-widest font-display">
                Total Majmuk Produksi Wajib
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-gray-950 mt-2 tracking-tight">
                {data?.summary?.totalItemsQty ?? 0} <span className="text-2xl text-emerald-700">Pcs</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Seluruh item pesanan lunas terverifikasi</p>
            </div>
            <Boxes className="w-14 h-14 text-[#063D2E]/15" />
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest font-display">
                Alokasi Stand Bazar Gontor
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-emerald-700 mt-2 tracking-tight">
                {data?.summary?.pickupItemsQty ?? 0} <span className="text-2xl text-emerald-600/60">Pcs</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Diserap tim stand bazar Ponorogo</p>
            </div>
            <Warehouse className="w-14 h-14 text-emerald-700/15" />
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-purple-800 uppercase tracking-widest font-display">
                Alokasi Kirim Ekspedisi
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-purple-700 mt-2 tracking-tight">
                {data?.summary?.deliveryItemsQty ?? 0} <span className="text-2xl text-purple-600/60">Pcs</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Diserap tim packing & kurir</p>
            </div>
            <Warehouse className="w-14 h-14 text-purple-700/15" />
          </div>
        </div>
      </div>

      {/* Main Vendor Recap Table */}
      <div className="my-6 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-md overflow-hidden flex-1 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="font-display font-bold text-xl text-gray-900 flex items-center gap-2">
            <Factory className="w-6 h-6 text-[#063D2E]" />
            Rincian Barang Produksi Konveksi
          </h2>
          <div className="text-xs text-gray-500 font-display flex items-center gap-2 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-200">
            <Clock className="w-4 h-4 text-[#063D2E]" />
            Update Otomatis: <span className="text-[#063D2E] font-bold">{lastUpdated || 'Menghubungkan...'}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#063D2E]" />
            <p className="text-xs font-display font-semibold">Memuat data produksi realtime...</p>
          </div>
        ) : !data?.recap || data.recap.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            Belum ada pesanan lunas. Data produksi akan otomatis terupdate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50/80">
                  <th className="py-3.5 px-4">Katalog Merchandise</th>
                  <th className="py-3.5 px-4">Ukuran / Varian</th>
                  <th className="py-3.5 px-6 text-center bg-blue-50/80 text-blue-950 font-black text-sm">
                    Jumlah Majmuk Wajib Produksi (Pcs)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-base">
                {data.recap.map((item: any) => {
                  const variantEntries = Object.entries(item.variants).sort((a: any, b: any) => b[1].total - a[1].total)
                  return (
                    <tr key={item.productName} className="hover:bg-gray-50/60 align-top transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-display font-bold text-lg text-gray-900">
                          {item.productName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-body">
                          Total Produk: <span className="text-[#063D2E] font-bold">{item.totalQty} Pcs</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {variantEntries.map(([vName]: any) => (
                            <div key={vName} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 inline-block sm:block">
                              {vName}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center bg-blue-50/30">
                        <div className="space-y-1.5">
                          {variantEntries.map(([vName, vStat]: any) => (
                            <div key={vName} className="py-1 text-base font-black text-blue-950">
                              {vStat.total} <span className="text-xs text-blue-700 font-semibold">Pcs</span>
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

      {/* Footer Branding Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-gray-200/80 p-4 rounded-2xl text-xs text-gray-600 font-display gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Platform Resmi Peringatan 100 Tahun Gontor — Live Display Monitor</span>
        </div>
        <div className="text-gray-400 font-mono text-[11px]">
          Auto Refresh 8 Detik
        </div>
      </div>

    </div>
  )
}
