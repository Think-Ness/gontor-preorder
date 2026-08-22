'use client'

import { useState, useEffect } from 'react'
import { Store, Download, RefreshCw, Maximize, Minimize, Clock, Package, CheckCircle2, Search, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import DisplayPinModal from '@/components/public/DisplayPinModal'

export default function PublicDisplayStandPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [search, setSearch] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const savedPin = sessionStorage.getItem('display_pin_stand')
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
        body: JSON.stringify({ role: 'stand', pin }),
      })
      if (res.ok) {
        setIsAuthenticated(true)
        fetchData()
      } else {
        sessionStorage.removeItem('display_pin_stand')
      }
    } catch {
      sessionStorage.removeItem('display_pin_stand')
    } finally {
      setCheckingAuth(false)
    }
  }

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/display?type=stand', { cache: 'no-store' })
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
    const interval = setInterval(() => {
      fetchData()
    }, 8000)
    return () => clearInterval(interval)
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

  const filteredOrders = (data?.orders ?? []).filter((o: any) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.full_name?.toLowerCase().includes(q) ||
      o.stambuk?.toLowerCase().includes(q) ||
      o.whatsapp?.includes(q)
    )
  })

  const pickupRecap = (data?.recap ?? []).filter((item: any) => item.pickupQty > 0)

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4 text-[#063D2E]">
        <div className="flex items-center gap-3 font-display font-bold">
          <RefreshCw className="w-5 h-5 animate-spin text-[#063D2E]" />
          <span>Memeriksa Otorisasi Monitor Stand...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <DisplayPinModal
        role="stand"
        title="Monitor Stand Bazar Gontor"
        onSuccess={() => {
          setIsAuthenticated(true)
          fetchData()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-900 p-4 sm:p-8 font-sans antialiased flex flex-col justify-between selection:bg-emerald-100 selection:text-[#063D2E]">
      
      {/* Top Header Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-gray-200/80 p-4 sm:p-6 rounded-3xl shadow-md gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, var(--gontor-green, #063D2E), var(--gontor-green-light, #0a523e))' }}
            >
              <Store className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#063D2E] text-xs font-bold font-display uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                Live Monitor Stand Bazar Gontor (Ponorogo)
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-950 tracking-tight">
                Rekap Barang & Antrean Stand Bazar
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

        {/* Realtime KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-emerald-600/30 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest font-display">
                Total Item Ambil di Stand
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-emerald-700 mt-2 tracking-tight">
                {data?.summary?.pickupItemsQty ?? 0} <span className="text-2xl text-emerald-600">Pcs</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Stok wajib tersedia di Stand Bazar</p>
            </div>
            <Package className="w-14 h-14 text-emerald-600/15" />
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-widest font-display">
                Total Order Stand
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-amber-600 mt-2 tracking-tight">
                {data?.summary?.pickupOrdersCount ?? 0} <span className="text-2xl text-amber-500/60">Order</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Pemesan memilih opsi Ambil di Stand</p>
            </div>
            <Store className="w-14 h-14 text-amber-500/15" />
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest font-display">
                Status Koneksi Monitor
              </div>
              <div className="font-display font-bold text-xl text-emerald-800 mt-2 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Live Sync Active
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Otomatis update setiap 8 detik</p>
            </div>
            <Clock className="w-14 h-14 text-gray-400/20" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Items Recap & Orders Queue */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 flex-1">
        
        {/* Left Box: Stand Items Recap */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="font-display font-bold text-xl text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-emerald-700" />
                Rekap Jumlah Barang di Stand Bazar
              </h2>
              <span className="text-xs font-display font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {pickupRecap.length} Jenis Produk
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-500 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-700" />
                <p className="text-xs font-display">Memuat rekap barang stand...</p>
              </div>
            ) : pickupRecap.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                Belum ada pesanan lunas untuk opsi Ambil di Stand.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50/80">
                      <th className="py-3 px-3">Nama Produk</th>
                      <th className="py-3 px-2">Ukuran</th>
                      <th className="py-3 px-3 text-center bg-emerald-50 text-emerald-950 font-black">
                        Jumlah Ambil Stand
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {pickupRecap.map((item: any) => {
                      const vEntries = Object.entries(item.variants).filter(([_, stat]: any) => stat.pickup > 0)
                      return (
                        <tr key={item.productName} className="hover:bg-gray-50/60 align-top transition-colors">
                          <td className="py-4 px-3">
                            <div className="font-bold text-gray-900 text-base">{item.productName}</div>
                            <div className="text-xs text-gray-500 mt-1">Total: <strong className="text-emerald-700">{item.pickupQty} Pcs</strong></div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="space-y-1.5">
                              {vEntries.map(([vName]: any) => (
                                <div key={vName} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                                  {vName}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-3 text-center bg-emerald-50/40">
                            <div className="space-y-1.5">
                              {vEntries.map(([vName, vStat]: any) => (
                                <div key={vName} className="py-1 text-base font-black text-emerald-800">
                                  {vStat.pickup} Pcs
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
        </div>

        {/* Right Box: Live Orders Queue Search & List */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="font-display font-bold text-xl text-gray-900 flex items-center gap-2">
                <Store className="w-6 h-6 text-amber-600" />
                Daftar Pemesan Stand Bazar
              </h2>
              <span className="text-xs font-display font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                {filteredOrders.length} Order
              </span>
            </div>

            {/* Fast Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari Nomor Order, Nama, Stambuk, WA..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 outline-none focus:border-emerald-600 transition-all font-body"
              />
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  Tidak ada pesanan stand yang cocok.
                </div>
              ) : (
                filteredOrders.map((o: any) => (
                  <div key={o.id} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-bold text-emerald-800 text-sm">{o.order_number}</div>
                      <div className="font-bold text-gray-900 text-sm mt-0.5">{o.full_name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Stambuk: {o.stambuk} • WA: {o.whatsapp}
                      </div>
                    </div>
                    <a
                      href={`/admin/orders/${o.order_number}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-[#063D2E] hover:bg-[#0a523e] text-white font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <span>Detail</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Branding Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-gray-200/80 p-4 rounded-2xl text-xs text-gray-600 font-display gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Platform Resmi Peringatan 100 Tahun Gontor — Monitor Stand Bazar</span>
        </div>
        <div className="text-gray-400 font-mono text-[11px]">
          Auto Refresh 8 Detik
        </div>
      </div>

    </div>
  )
}
