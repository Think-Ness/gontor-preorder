'use client'

import { useState, useMemo } from 'react'
import { Printer, MapPin, Search, ChevronDown, ChevronRight, Package, User } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types'
import { formatRupiah } from '@/lib/utils'

interface DeliveryClientProps {
  initialOrders: Order[]
}

export default function DeliveryClient({ initialOrders }: DeliveryClientProps) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [openCities, setOpenCities] = useState<Set<string>>(new Set())

  // Group by shipping_province
  const groupedOrders = useMemo(() => {
    const groups: Record<string, Order[]> = {}
    
    // Filter by search
    const filtered = initialOrders.filter(o => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        o.order_number.toLowerCase().includes(s) ||
        o.full_name.toLowerCase().includes(s) ||
        (o.shipping_province || '').toLowerCase().includes(s) ||
        (o.shipping_city || '').toLowerCase().includes(s)
      )
    })

    filtered.forEach(order => {
      const province = order.shipping_province || 'Tanpa Provinsi'
      if (!groups[province]) groups[province] = []
      groups[province].push(order)
    })
    
    // Sort provinces alphabetically
    return Object.keys(groups).sort().map(province => ({
      province,
      orders: groups[province].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }))
  }, [initialOrders, search])

  const toggleProvince = (province: string) => {
    const next = new Set(openCities)
    if (next.has(province)) next.delete(province)
    else next.add(province)
    setOpenCities(next)
  }

  const toggleOrderSelection = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAllInProvince = (provinceOrders: Order[]) => {
    const next = new Set(selectedIds)
    const allSelected = provinceOrders.every(o => next.has(o.id))
    if (allSelected) {
      provinceOrders.forEach(o => next.delete(o.id))
    } else {
      provinceOrders.forEach(o => next.add(o.id))
    }
    setSelectedIds(next)
  }

  const handleBatchPrint = () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds).join(',')
    window.open(`/admin/delivery/print?ids=${ids}`, '_blank')
  }

  return (
    <div className="card-premium p-4 md:p-6 bg-white flex flex-col min-h-[500px]">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari order, nama, atau provinsi/kota..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-green-500 focus:border-green-500 block pl-10 p-2.5 transition-all outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            {selectedIds.size} Order Dipilih
          </div>
          <button
            onClick={handleBatchPrint}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold shadow-lg shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-95"
          >
            <Printer className="w-5 h-5" />
            Cetak Label Massal
          </button>
        </div>
      </div>

      {/* Accordion Grouping */}
      {groupedOrders.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-gray-300" />
          </div>
          <div className="text-gray-500 font-medium">Tidak ada pesanan delivery yang ditemukan</div>
          <div className="text-sm text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian Anda.</div>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedOrders.map(({ province, orders }) => {
            const isOpen = openCities.has(province)
            const allSelected = orders.every(o => selectedIds.has(o.id))
            const someSelected = orders.some(o => selectedIds.has(o.id)) && !allSelected

            return (
              <div key={province} className="border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                {/* Header */}
                <div 
                  className={`p-4 md:p-5 flex items-center justify-between cursor-pointer transition-colors ${isOpen ? 'bg-green-50/40 border-b border-gray-100' : 'hover:bg-gray-50/80'}`}
                  onClick={() => toggleProvince(province)}
                >
                  <div className="flex items-center gap-5">
                    <div onClick={(e) => { e.stopPropagation(); selectAllInProvince(orders) }} className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-green-600 rounded-md border-gray-300 focus:ring-green-500 cursor-pointer shadow-sm transition-all"
                        checked={allSelected}
                        ref={el => { if (el) el.indeterminate = someSelected }}
                        onChange={() => {}}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isOpen ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-gray-900 text-lg uppercase tracking-wide">{province}</h3>
                        <div className="text-sm text-gray-500 font-semibold flex items-center gap-1.5 mt-0.5">
                          <Package className="w-3.5 h-3.5" />
                          {orders.length} Pesanan Tujuan
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-green-100 text-green-700' : 'text-gray-400 bg-gray-50'}`}>
                    {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>

                {/* Content */}
                {isOpen && (
                  <div className="divide-y divide-gray-100/60 bg-white">
                    {orders.map(order => (
                      <div key={order.id} className="p-4 md:p-5 flex items-start gap-5 hover:bg-gray-50/50 transition-colors">
                        <div className="pt-1.5">
                          <input 
                            type="checkbox"
                            checked={selectedIds.has(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-5 h-5 text-green-600 rounded-md border-gray-300 focus:ring-green-500 cursor-pointer shadow-sm"
                          />
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="md:col-span-1">
                            <Link href={`/admin/orders/${order.order_number}`} className="font-display font-black text-green-700 hover:text-green-800 hover:underline text-sm block mb-1">
                              {order.order_number}
                            </Link>
                            <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                              <User className="w-4 h-4 text-gray-400" />
                              {order.full_name}
                            </div>
                            <div className="text-xs font-semibold text-gray-500 mt-1 pl-5.5">
                              {order.whatsapp}
                            </div>
                          </div>
                          
                          <div className="md:col-span-2">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> Alamat Pengiriman
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed line-clamp-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                              <span className="font-semibold text-gray-900">{order.shipping_city}</span> — {order.shipping_address}
                            </div>
                          </div>

                          <div className="md:col-span-1 text-right flex flex-col justify-between items-end">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-200">
                              {order.order_status.replace(/_/g, ' ')}
                            </span>
                            <div className="text-base font-black text-gray-900 mt-2">
                              {formatRupiah(order.total_amount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
