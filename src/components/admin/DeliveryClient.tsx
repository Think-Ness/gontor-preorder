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

  // Group by shipping_city
  const groupedOrders = useMemo(() => {
    const groups: Record<string, Order[]> = {}
    
    // Filter by search
    const filtered = initialOrders.filter(o => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        o.order_number.toLowerCase().includes(s) ||
        o.full_name.toLowerCase().includes(s) ||
        (o.shipping_city || '').toLowerCase().includes(s)
      )
    })

    filtered.forEach(order => {
      const city = order.shipping_city || 'Tanpa Kota/Kabupaten'
      if (!groups[city]) groups[city] = []
      groups[city].push(order)
    })
    
    // Sort cities alphabetically
    return Object.keys(groups).sort().map(city => ({
      city,
      orders: groups[city].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }))
  }, [initialOrders, search])

  const toggleCity = (city: string) => {
    const next = new Set(openCities)
    if (next.has(city)) next.delete(city)
    else next.add(city)
    setOpenCities(next)
  }

  const toggleOrderSelection = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAllInCity = (cityOrders: Order[]) => {
    const next = new Set(selectedIds)
    const allSelected = cityOrders.every(o => next.has(o.id))
    if (allSelected) {
      cityOrders.forEach(o => next.delete(o.id))
    } else {
      cityOrders.forEach(o => next.add(o.id))
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari order, nama, atau kota..."
            className="input-premium pl-9 w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 font-medium">
            {selectedIds.size} dipilih
          </div>
          <button
            onClick={handleBatchPrint}
            disabled={selectedIds.size === 0}
            className="btn-primary flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak Label Pengiriman
          </button>
        </div>
      </div>

      {/* Accordion Grouping */}
      {groupedOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Tidak ada pesanan delivery yang ditemukan
        </div>
      ) : (
        <div className="space-y-4">
          {groupedOrders.map(({ city, orders }) => {
            const isOpen = openCities.has(city)
            const allSelected = orders.every(o => selectedIds.has(o.id))
            const someSelected = orders.some(o => selectedIds.has(o.id)) && !allSelected

            return (
              <div key={city} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                {/* Header */}
                <div 
                  className="bg-gray-50/80 p-3 md:p-4 flex items-center justify-between cursor-pointer hover:bg-green-50/50 transition-colors"
                  onClick={() => toggleCity(city)}
                >
                  <div className="flex items-center gap-4">
                    <div onClick={(e) => { e.stopPropagation(); selectAllInCity(orders) }} className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-green-600 rounded border-gray-300 cursor-pointer"
                        checked={allSelected}
                        ref={el => { if (el) el.indeterminate = someSelected }}
                        onChange={() => {}}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-display font-bold text-gray-900">{city}</h3>
                        <div className="text-xs text-gray-500 font-medium">{orders.length} pesanan</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {isOpen ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                  </div>
                </div>

                {/* Content */}
                {isOpen && (
                  <div className="divide-y divide-gray-100 bg-white">
                    {orders.map(order => (
                      <div key={order.id} className="p-3 md:p-4 flex items-start gap-4 hover:bg-gray-50/50">
                        <div className="pt-1">
                          <input 
                            type="checkbox"
                            checked={selectedIds.has(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-4 h-4 text-green-600 rounded border-gray-300 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-1">
                            <Link href={`/admin/orders/${order.order_number}`} className="font-display font-bold text-green-700 hover:underline text-sm block">
                              {order.order_number}
                            </Link>
                            <div className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {order.full_name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {order.whatsapp}
                            </div>
                          </div>
                          
                          <div className="md:col-span-2">
                            <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-gray-400" /> Alamat Pengiriman
                            </div>
                            <div className="text-sm text-gray-800 line-clamp-2">
                              {order.shipping_address}
                            </div>
                          </div>

                          <div className="md:col-span-1 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                              {order.order_status.replace(/_/g, ' ')}
                            </span>
                            <div className="text-sm font-bold text-gray-900 mt-2">
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
