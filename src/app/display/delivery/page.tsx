'use client'

import { useState, useEffect } from 'react'
import { Truck, Download, RefreshCw, Maximize, Minimize, Clock, Package, CheckCircle2, Search, MapPin, ArrowRight, ShieldCheck, Printer, Check } from 'lucide-react'
import DisplayPinModal from '@/components/public/DisplayPinModal'
import { subscribeToOrdersRealtime } from '@/lib/realtime'

export default function PublicDisplayDeliveryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [search, setSearch] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [statusTab, setStatusTab] = useState<'pending' | 'completed' | 'all'>('pending')

  useEffect(() => {
    const savedPin = sessionStorage.getItem('display_pin_delivery')
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
        body: JSON.stringify({ role: 'delivery', pin }),
      })
      if (res.ok) {
        setIsAuthenticated(true)
        fetchData()
      } else {
        sessionStorage.removeItem('display_pin_delivery')
      }
    } catch {
      sessionStorage.removeItem('display_pin_delivery')
    } finally {
      setCheckingAuth(false)
    }
  }

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

  // Status helper: COMPLETED / SHIPPED / DELIVERED
  const isCompletedOrder = (o: any) => ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(o.order_status?.toUpperCase())

  const renderDeliveryStatusBadge = (status?: string) => {
    const st = (status || '').toUpperCase()

    if (st === 'PROCESSING' || st === 'PAID') {
      return (
        <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shrink-0 inline-flex items-center gap-1.5 shadow-2xs">
          <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
          <span>SEDANG DIPROSES</span>
        </span>
      )
    }

    if (st === 'SHIPPED') {
      return (
        <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-300 font-bold shrink-0 inline-flex items-center gap-1.5 shadow-2xs">
          <Truck className="w-3 h-3 text-purple-700" />
          <span>DALAM PENGIRIMAN</span>
        </span>
      )
    }

    if (['DELIVERED', 'COMPLETED'].includes(st)) {
      return (
        <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold shrink-0 inline-flex items-center gap-1.5 shadow-2xs">
          <Check className="w-3 h-3 text-emerald-700" />
          <span>TERKIRIM (SELESAI)</span>
        </span>
      )
    }

    return (
      <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 font-bold shrink-0">
        PERLU DIKIRIM
      </span>
    )
  }

  const allOrdersList = data?.orders ?? []
  const pendingOrdersList = allOrdersList.filter((o: any) => !isCompletedOrder(o))
  const completedOrdersList = allOrdersList.filter((o: any) => isCompletedOrder(o))

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
      o.shipping_city?.toLowerCase().includes(q) ||
      o.shipping_province?.toLowerCase().includes(q) ||
      o.whatsapp?.includes(q)
    )
  })

  const toggleOrderSelection = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedIds(new Set())
    } else {
      const all = new Set<string>(filteredOrders.map((o: any) => o.id))
      setSelectedIds(all)
    }
  }

  const handlePrintSingle = (id: string) => {
    window.open(`/admin/delivery/print?ids=${id}`, '_blank')
  }

  const handlePrintSelected = () => {
    if (selectedIds.size === 0) {
      const allIds = filteredOrders.map((o: any) => o.id).join(',')
      if (!allIds) return
      window.open(`/admin/delivery/print?ids=${allIds}`, '_blank')
    } else {
      const ids = Array.from(selectedIds).join(',')
      window.open(`/admin/delivery/print?ids=${ids}`, '_blank')
    }
  }

  const deliveryRecap = (data?.recap ?? []).filter((item: any) => item.deliveryQty > 0)

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4 text-[#063D2E]">
        <div className="flex items-center gap-3 font-display font-bold">
          <RefreshCw className="w-5 h-5 animate-spin text-[#063D2E]" />
          <span>Memeriksa Otorisasi Monitor Logistik...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <DisplayPinModal
        role="delivery"
        title="Monitor Logistik Pengiriman Ekspedisi"
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
              <Truck className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#063D2E] text-xs font-bold font-display uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                Live Monitor Logistik & Ekspedisi
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-950 tracking-tight">
                Rekap Barang & Paket Pengiriman Kurir
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
          <div className="bg-white border-2 border-amber-500/40 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase tracking-widest font-display">
                Paket Perlu Kirim (Belum Selesai)
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-amber-600 mt-2 tracking-tight">
                {pendingOrdersList.length} <span className="text-2xl text-amber-700/80">Paket</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Menunggu dipacking & diserahkan kurir</p>
            </div>
            <Clock className="w-14 h-14 text-amber-600/20" />
          </div>

          <div className="bg-white border border-emerald-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-widest font-display">
                Paket Sudah Terkirim (Selesai)
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-emerald-700 mt-2 tracking-tight">
                {completedOrdersList.length} <span className="text-2xl text-emerald-600/60">Paket</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Sudah terbit resi & diserahkan ke ekspedisi</p>
            </div>
            <CheckCircle2 className="w-14 h-14 text-emerald-700/15" />
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-purple-900 uppercase tracking-widest font-display">
                Total Barang Wajib Kirim
              </div>
              <div className="font-display font-black text-4xl sm:text-5xl text-purple-800 mt-2 tracking-tight">
                {data?.summary?.deliveryItemsQty ?? 0} <span className="text-2xl text-purple-600">Pcs</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-body">Diserap tim packing & ekspedisi</p>
            </div>
            <Package className="w-14 h-14 text-purple-700/15" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Items Recap & Orders Queue */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 flex-1">
        
        {/* Left Box: Delivery Items Recap */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="font-display font-bold text-xl text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-purple-800" />
                Rekap Barang untuk Kurir Pengiriman
              </h2>
              <span className="text-xs font-display font-bold text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                {deliveryRecap.length} Jenis Produk
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-500 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-700" />
                <p className="text-xs font-display">Memuat rekap barang pengiriman...</p>
              </div>
            ) : deliveryRecap.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                Belum ada pesanan lunas untuk opsi Kirim Alamat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50/80">
                      <th className="py-3 px-3">Nama Produk</th>
                      <th className="py-3 px-2">Ukuran</th>
                      <th className="py-3 px-3 text-center bg-purple-50 text-purple-950 font-black">
                        Jumlah Kirim Alamat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {deliveryRecap.map((item: any) => {
                      const vEntries = Object.entries(item.variants).filter(([_, stat]: any) => stat.delivery > 0)
                      return (
                        <tr key={item.productName} className="hover:bg-gray-50/60 align-top transition-colors">
                          <td className="py-4 px-3">
                            <div className="font-bold text-gray-900 text-base">{item.productName}</div>
                            <div className="text-xs text-gray-500 mt-1">Total: <strong className="text-purple-800">{item.deliveryQty} Pcs</strong></div>
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
                          <td className="py-4 px-3 text-center bg-purple-50/40">
                            <div className="space-y-1.5">
                              {vEntries.map(([vName, vStat]: any) => (
                                <div key={vName} className="py-1 text-base font-black text-purple-900">
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

        {/* Right Box: Delivery Orders Search, Tab Separator & List */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-2">
              <h2 className="font-display font-bold text-xl text-gray-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-purple-700" />
                Daftar Paket Kirim Alamat
              </h2>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSelected}
                  disabled={filteredOrders.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  title="Cetak Label Stiker Pengiriman"
                >
                  <Printer className="w-4 h-4 text-[#D4AF37]" />
                  <span>{selectedIds.size > 0 ? `Cetak (${selectedIds.size}) Label` : 'Cetak Label (Halaman Ini)'}</span>
                </button>
              </div>
            </div>

            {/* TAB SEPARATOR: Belum Dikirim (Active Focus) vs Sudah Selesai vs Semua */}
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
                <span>Belum Dikirim ({pendingOrdersList.length})</span>
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
                <span>Sudah Selesai ({completedOrdersList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusTab('all')}
                className={`py-2 px-3.5 rounded-xl font-display font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                  statusTab === 'all'
                    ? 'bg-purple-900 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <span>Semua ({allOrdersList.length})</span>
              </button>
            </div>

            {/* Fast Search Input & Select All Row */}
            <div className="space-y-2 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari Order, Nama, Kota, Provinsi, WA..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 outline-none focus:border-purple-600 transition-all font-body"
                />
              </div>

              {filteredOrders.length > 0 && (
                <div className="flex items-center justify-between px-1 text-xs text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-purple-700 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                    />
                    <span>Pilih Semua Terlihat ({filteredOrders.length})</span>
                  </label>
                  {selectedIds.size > 0 && (
                    <span className="font-bold text-purple-800">
                      {selectedIds.size} paket terpilih
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs space-y-1">
                  <p className="font-bold text-gray-500">
                    {statusTab === 'pending' ? '🎉 Semua paket pengiriman telah selesai dikirim!' : 'Tidak ada paket pengiriman yang cocok.'}
                  </p>
                  <p className="text-[11px]">
                    {statusTab === 'pending' && 'Klik tab "Sudah Selesai" untuk melihat daftar paket yang terkirim.'}
                  </p>
                </div>
              ) : (
                filteredOrders.map((o: any) => {
                  const isSelected = selectedIds.has(o.id)
                  const isCompleted = isCompletedOrder(o)

                  return (
                    <div
                      key={o.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs gap-2 ${
                        isSelected 
                          ? 'bg-purple-50/70 border-purple-300 shadow-xs' 
                          : isCompleted 
                          ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOrderSelection(o.id)}
                          className="w-4 h-4 text-purple-700 rounded border-gray-300 focus:ring-purple-500 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-mono font-bold text-purple-900 text-sm flex items-center gap-2 flex-wrap">
                            <span className="truncate">{o.order_number}</span>
                            {o.itemsCount && (
                              <span className="text-[10px] font-sans px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-semibold shrink-0">
                                {o.itemsCount} Item
                              </span>
                            )}
                            {renderDeliveryStatusBadge(o.order_status)}
                          </div>
                          <div className="font-bold text-gray-900 text-sm mt-0.5 truncate">{o.full_name}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                            <span className="truncate">{o.shipping_city}, {o.shipping_province}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Tombol Cetak Label Per Paket */}
                        <button
                          onClick={() => handlePrintSingle(o.id)}
                          className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 font-bold text-xs flex items-center gap-1.5 border border-purple-200 transition-all shadow-2xs"
                          title="Cetak Stiker Label Paket Ini"
                        >
                          <Printer className="w-3.5 h-3.5 text-purple-700" />
                          <span className="hidden sm:inline">Cetak Label</span>
                        </button>

                        {/* Tombol Detail Order */}
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
          <span>Platform Resmi Peringatan 100 Tahun Gontor — Monitor Logistik Kirim</span>
        </div>
        <div className="text-gray-400 font-mono text-[11px]">
          Auto Refresh 8 Detik
        </div>
      </div>

    </div>
  )
}
