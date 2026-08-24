'use client'

import { useState, useEffect } from 'react'
import { Store, Download, RefreshCw, Maximize, Minimize, Clock, Package, CheckCircle2, Search, ArrowRight, ShieldCheck, QrCode, Check } from 'lucide-react'
import DisplayPinModal from '@/components/public/DisplayPinModal'
import StandPickupScannerModal from '@/components/public/StandPickupScannerModal'
import { subscribeToOrdersRealtime } from '@/lib/realtime'

export default function PublicDisplayStandPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [search, setSearch] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Scanner & Tab state
  const [showScannerModal, setShowScannerModal] = useState(false)
  const [statusTab, setStatusTab] = useState<'pending' | 'completed' | 'all'>('pending')

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

    fetchData()

    // 1. Instant Realtime Subscription (Supabase WebSocket CDC + BroadcastChannel)
    const unsubscribeRealtime = subscribeToOrdersRealtime(() => {
      fetchData()
    })

    // 2. Active safety net polling (5s interval)
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

  // Status helper: COMPLETED / SHIPPED / DELIVERED
  const isCompletedOrder = (o: any) => ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(o.order_status?.toUpperCase())
  const isProcessingOrder = (o: any) => ['PROCESSING', 'PAID'].includes(o.order_status?.toUpperCase())
  const isReadyOrder = (o: any) => o.order_status?.toUpperCase() === 'READY_FOR_PICKUP'

  const allOrdersList = data?.orders ?? []
  const pendingOrdersList = allOrdersList.filter((o: any) => !isCompletedOrder(o))
  const processingOrdersList = allOrdersList.filter(isProcessingOrder)
  const readyOrdersList = allOrdersList.filter(isReadyOrder)
  const completedOrdersList = allOrdersList.filter(isCompletedOrder)

  const renderOrderStatusBadge = (status?: string) => {
    const st = (status || '').toUpperCase()

    if (st === 'PROCESSING' || st === 'PAID') {
      return (
        <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shrink-0 inline-flex items-center gap-1.5 shadow-2xs">
          <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
          <span>SEDANG DIPROSES</span>
        </span>
      )
    }

    if (st === 'READY_FOR_PICKUP') {
      return (
        <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold shrink-0 inline-flex items-center gap-1.5 shadow-2xs">
          <Clock className="w-3 h-3 text-amber-700" />
          <span>SIAP DIAMBIL</span>
        </span>
      )
    }

    if (['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(st)) {
      return (
        <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold shrink-0 inline-flex items-center gap-1.5 shadow-2xs">
          <Check className="w-3 h-3 text-emerald-700" />
          <span>SUDAH DISERAHKAN</span>
        </span>
      )
    }

    return (
      <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 font-bold shrink-0">
        {st || 'TERVERIFIKASI'}
      </span>
    )
  }

  const activeTabOrders = 
    statusTab === 'pending' ? pendingOrdersList :
    statusTab === 'completed' ? completedOrdersList :
    allOrdersList

  const filteredOrders = activeTabOrders.filter((o: any) => {
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
      
      {/* Scanner Verification Modal */}
      <StandPickupScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onSuccessRefresh={() => fetchData()}
      />

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
            {/* Tombol Scan QR Tiket */}
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 border border-emerald-700 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>Scan QR / Verifikasi Tiket</span>
            </button>

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
          <div className="bg-white border-2 border-amber-500/40 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase tracking-widest font-display">
                Order Belum Diambil
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-amber-600 mt-2 tracking-tight">
                {pendingOrdersList.length} <span className="text-2xl text-amber-700/80">Order</span>
              </div>
              <p className="text-xs text-gray-600 mt-1 font-body">
                <span className="font-bold text-blue-700">{processingOrdersList.length} Diproses</span> • <span className="font-bold text-amber-700">{readyOrdersList.length} Siap Diambil</span>
              </p>
            </div>
            <Clock className="w-14 h-14 text-amber-600/20" />
          </div>

          <div className="bg-white border border-emerald-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-widest font-display">
                Order Sudah Diserahkan (Selesai)
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-emerald-700 mt-2 tracking-tight">
                {completedOrdersList.length} <span className="text-2xl text-emerald-600/60">Order</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Telah diserahterimakan ke pemesan</p>
            </div>
            <CheckCircle2 className="w-14 h-14 text-emerald-700/15" />
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-widest font-display">
                Total Barang Ambil Stand
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-emerald-800 mt-2 tracking-tight">
                {data?.summary?.pickupItemsQty ?? 0} <span className="text-2xl text-emerald-600">Pcs</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Diserap pemesan Ambil di Stand</p>
            </div>
            <Package className="w-14 h-14 text-emerald-600/15" />
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

        {/* Right Box: Live Orders Queue Search & Tabbed List */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-2">
              <h2 className="font-display font-bold text-xl text-gray-900 flex items-center gap-2">
                <Store className="w-6 h-6 text-amber-600" />
                Daftar Pemesan Stand Bazar
              </h2>
              
              <button
                onClick={() => setShowScannerModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>Verifikasi Tiket</span>
              </button>
            </div>

            {/* TAB SEPARATOR: Belum Diambil vs Sudah Diserahkan vs Semua */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl border border-gray-200/80 mb-4">
              <button
                type="button"
                onClick={() => setStatusTab('pending')}
                className={`flex-1 py-2 px-3 rounded-xl font-display font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  statusTab === 'pending'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Belum Diambil ({pendingOrdersList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusTab('completed')}
                className={`flex-1 py-2 px-3 rounded-xl font-display font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  statusTab === 'completed'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sudah Diserahkan ({completedOrdersList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusTab('all')}
                className={`py-2 px-3.5 rounded-xl font-display font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                  statusTab === 'all'
                    ? 'bg-emerald-950 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <span>Semua ({allOrdersList.length})</span>
              </button>
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

            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs space-y-1">
                  <p className="font-bold text-gray-500">
                    {statusTab === 'pending' ? 'Semua pesanan stand telah diambil!' : 'Tidak ada pesanan stand yang cocok.'}
                  </p>
                  <p className="text-[11px]">
                    {statusTab === 'pending' && 'Klik tab "Sudah Diserahkan" untuk melihat riwayat pengambilan.'}
                  </p>
                </div>
              ) : (
                filteredOrders.map((o: any) => {
                  const isCompleted = isCompletedOrder(o)

                  return (
                    <div 
                      key={o.id} 
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs gap-2 ${
                        isCompleted 
                          ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100/60'
                      }`}
                    >
                      <div>
                        <div className="font-mono font-bold text-emerald-800 text-sm flex items-center gap-2 flex-wrap">
                          <span>{o.order_number}</span>
                          {renderOrderStatusBadge(o.order_status)}
                        </div>
                        <div className="font-bold text-gray-900 text-sm mt-0.5">{o.full_name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Stambuk: {o.stambuk} • WA: {o.whatsapp}
                        </div>
                      </div>
                      <a
                        href={`/admin/orders/${o.order_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-[#063D2E] hover:bg-[#0a523e] text-white font-bold text-xs flex items-center gap-1 transition-all shrink-0"
                      >
                        <span>Detail</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                      </a>
                    </div>
                  )
                })
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
