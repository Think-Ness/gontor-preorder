'use client'

import { useState, useEffect } from 'react'
import { Truck, Download, RefreshCw, Maximize, Minimize, Clock, Package, CheckCircle2, Search, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DisplayDeliveryPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [search, setSearch] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/display?type=delivery', { cache: 'no-store' })
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
    }, 8000)
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

  const filteredOrders = (data?.orders ?? []).filter((o: any) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.full_name?.toLowerCase().includes(q) ||
      o.shipping_city?.toLowerCase().includes(q) ||
      o.shipping_province?.toLowerCase().includes(q) ||
      o.whatsapp?.includes(q)
    )
  })

  // Filter recap items where delivery > 0
  const deliveryRecap = (data?.recap ?? []).filter((item: any) => item.deliveryQty > 0)

  return (
    <div className="min-h-screen bg-purple-950 text-purple-50 p-4 sm:p-8 font-sans selection:bg-purple-600 selection:text-white flex flex-col justify-between">
      
      {/* Top Header Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-purple-900/90 border border-purple-800 p-4 sm:p-6 rounded-3xl shadow-2xl gap-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold font-mono tracking-widest uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                Live Monitor Logistik & Ekspedisi
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Rekap Barang & Daftar Kirim Ekspedisi
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-2xl bg-purple-800 hover:bg-purple-700 border border-purple-700 text-xs font-bold text-purple-100 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 text-purple-300 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Memuat...' : 'Refresh Live'}</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-2xl bg-purple-800 hover:bg-purple-700 border border-purple-700 text-purple-200 transition-all"
              title="Toggle Fullscreen TV Mode"
            >
              {isFullscreen ? <Minimize className="w-5 h-5 text-amber-300" /> : <Maximize className="w-5 h-5 text-amber-300" />}
            </button>
          </div>
        </div>

        {/* Realtime KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-900 to-purple-950 border border-purple-700/60 p-6 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-purple-300 uppercase tracking-widest font-mono">
                Total Item Wajib Kirim Ekspedisi
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-white mt-2 tracking-tight">
                {data?.summary?.deliveryItemsQty ?? 0} <span className="text-2xl text-purple-400">Pcs</span>
              </div>
              <p className="text-xs text-purple-300/80 mt-1">Item yang harus dikemas tim packing</p>
            </div>
            <Package className="w-14 h-14 text-purple-400/20" />
          </div>

          <div className="bg-purple-900/70 border border-purple-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-widest font-mono">
                Total Order Alamat Kirim
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-amber-300 mt-2 tracking-tight">
                {data?.summary?.deliveryOrdersCount ?? 0} <span className="text-2xl text-amber-400/60">Paket</span>
              </div>
              <p className="text-xs text-purple-300/80 mt-1">Jumlah alamat penerima terdaftar</p>
            </div>
            <Truck className="w-14 h-14 text-amber-400/20" />
          </div>

          <div className="bg-purple-900/70 border border-purple-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-purple-300 uppercase tracking-widest font-mono">
                Status Sistem Display
              </div>
              <div className="font-display font-bold text-xl text-purple-200 mt-2 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-purple-400" /> Live Synchronized
              </div>
              <p className="text-xs text-purple-300/80 mt-1">Otomatis update setiap 8 detik</p>
            </div>
            <Clock className="w-14 h-14 text-purple-400/20" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Items Recap & Orders Queue */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 flex-1">
        
        {/* Left Box: Delivery Items Recap */}
        <div className="bg-purple-900/80 border border-purple-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-purple-800 pb-4 mb-4">
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-purple-400" />
                Rekap Barang untuk Kurir Pengiriman
              </h2>
              <span className="text-xs font-mono text-purple-300 bg-purple-800/80 px-3 py-1 rounded-full border border-purple-700">
                {deliveryRecap.length} Produk
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-purple-300 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-400" />
                <p className="text-xs font-mono">Memuat rekap barang pengiriman...</p>
              </div>
            ) : deliveryRecap.length === 0 ? (
              <div className="py-16 text-center text-purple-400 text-sm">
                Belum ada item pesanan untuk pengiriman ekspedisi.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-purple-800 text-xs font-bold text-purple-300 uppercase tracking-wider bg-purple-950/60">
                      <th className="py-3 px-3">Nama Produk</th>
                      <th className="py-3 px-2">Varian / Ukuran</th>
                      <th className="py-3 px-3 text-center bg-purple-950 text-purple-300 font-black">
                        Jumlah Kirim Alamat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-800 text-sm">
                    {deliveryRecap.map((item: any) => {
                      const vEntries = Object.entries(item.variants).filter(([_, stat]: any) => stat.delivery > 0)
                      return (
                        <tr key={item.productName} className="hover:bg-purple-800/40 align-top transition-colors">
                          <td className="py-4 px-3">
                            <div className="font-bold text-white text-base">{item.productName}</div>
                            <div className="text-xs text-purple-300 mt-1">Total: <strong className="text-amber-300">{item.deliveryQty} Pcs</strong></div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="space-y-1.5">
                              {vEntries.map(([vName]: any) => (
                                <div key={vName} className="px-2 py-1 bg-purple-950 border border-purple-800 rounded-md text-xs font-semibold text-purple-200">
                                  {vName}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-3 text-center bg-purple-950/50">
                            <div className="space-y-1.5">
                              {vEntries.map(([vName, vStat]: any) => (
                                <div key={vName} className="py-1 text-base font-black text-amber-300">
                                  {vStat.delivery} Pcs
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

        {/* Right Box: Delivery Orders Search & List */}
        <div className="bg-purple-900/80 border border-purple-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-purple-800 pb-4 mb-4">
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <Truck className="w-6 h-6 text-amber-300" />
                Daftar Paket Kirim Alamat
              </h2>
              <span className="text-xs font-mono text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800">
                {filteredOrders.length} Paket
              </span>
            </div>

            {/* Fast Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari Order, Nama, Kota, Provinsi, WA..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-purple-950 border border-purple-700 text-xs text-white placeholder-purple-500 outline-none focus:border-amber-400 transition-all font-body"
              />
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-purple-400 text-xs">
                  Tidak ada paket pengiriman yang cocok.
                </div>
              ) : (
                filteredOrders.map((o: any) => (
                  <div key={o.id} className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-bold text-amber-300 text-sm">{o.order_number}</div>
                      <div className="font-bold text-white text-sm mt-0.5">{o.full_name}</div>
                      <div className="text-[11px] text-purple-300 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-purple-400" />
                        {o.shipping_city}, {o.shipping_province}
                      </div>
                    </div>
                    <Link
                      href={`/admin/orders/${o.order_number}`}
                      target="_blank"
                      className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <span>Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Display Status Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-purple-900/80 border border-purple-800 p-4 rounded-2xl text-xs text-purple-300 font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Layar Monitor Logistik & Pengiriman — Panitia 100 Tahun Gontor</span>
        </div>
        <Link href="/admin/reports" className="text-amber-300 hover:underline font-bold">
          ← Kembali ke Dashboard Admin
        </Link>
      </div>

    </div>
  )
}
