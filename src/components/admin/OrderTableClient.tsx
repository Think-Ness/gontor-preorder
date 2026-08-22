'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Package, Truck, ChevronDown, Loader2, CreditCard, Clock, Layers } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import OrderRowActions from '@/components/admin/OrderRowActions'
import DeleteOrderModal from '@/components/admin/DeleteOrderModal'

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft', PROOF_UPLOADED: 'Bukti Upload', PAYMENT_REVIEW: 'Payment Review',
  PAID: 'Paid', PROCESSING: 'Processing', READY_FOR_PICKUP: 'Ready Pickup',
  SHIPPED: 'Shipped', COMPLETED: 'Selesai', REJECTED: 'Ditolak', CANCELLED: 'Dibatalkan',
}

const paymentLabels: Record<string, string> = {
  UNPAID: 'Belum Bayar', PROOF_UPLOADED: 'Bukti Upload', UNDER_REVIEW: 'Review',
  PAID: 'Lunas', REJECTED: 'Ditolak',
}

const statusCls: Record<string, string> = {
  PAYMENT_REVIEW: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  READY_FOR_PICKUP: 'bg-purple-50 text-purple-700 border-purple-200', 
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
  REJECTED: 'bg-red-50 text-red-700 border-red-200', 
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200', 
  DRAFT: 'bg-gray-100 text-gray-500 border-gray-200',
  PROOF_UPLOADED: 'bg-amber-50 text-amber-700 border-amber-200',
}

function formatWaLink(phone: string, orderNumber: string, name: string) {
  let cleaned = (phone || '').replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  }
  const text = encodeURIComponent(`Halo Kak ${name}, mengenai pesanan ${orderNumber} Gontor 100 Tahun...`)
  return `https://wa.me/${cleaned}?text=${text}`
}

export default function OrderTableClient({ orders }: { orders: any[] }) {
  const router = useRouter()
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [bulkStatus, setBulkStatus] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<any>(null)

  // Clear selection if orders change
  useEffect(() => {
    setSelectedOrders(new Set())
  }, [orders])

  // Global mouse up to stop drag
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const toggleOrder = (orderNumber: string, forceState?: boolean) => {
    setSelectedOrders(prev => {
      const next = new Set(prev)
      if (forceState === true) next.add(orderNumber)
      else if (forceState === false) next.delete(orderNumber)
      else if (next.has(orderNumber)) next.delete(orderNumber)
      else next.add(orderNumber)
      return next
    })
  }

  const handleMouseDown = (orderNumber: string) => {
    setIsDragging(true)
    toggleOrder(orderNumber)
  }

  const handleMouseEnter = (orderNumber: string) => {
    if (isDragging) {
      toggleOrder(orderNumber, true)
    }
  }

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(orders.map(o => o.order_number)))
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedOrders.size === 0) return
    if (!confirm(`Anda yakin ingin mengupdate ${selectedOrders.size} order menjadi status ${statusLabels[bulkStatus]}?`)) return
    
    setIsUpdating(true)
    try {
      const res = await fetch('/api/admin/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumbers: Array.from(selectedOrders),
          newStatus: bulkStatus
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Terjadi kesalahan')
      }
      setSelectedOrders(new Set())
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const isAllSelected = orders.length > 0 && selectedOrders.size === orders.length
  const isSomeSelected = selectedOrders.size > 0 && selectedOrders.size < orders.length

  return (
    <>
      {/* Floating Bulk Action Bar */}
      {selectedOrders.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-6 w-[92%] max-w-3xl">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 shadow-sm border border-green-200">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-black text-lg leading-none">{selectedOrders.size} Order</span>
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Terpilih</span>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-10 bg-gray-200"></div>
            
            <div className="flex w-full md:w-auto items-center gap-3">
              <div className="relative flex-1 md:w-56">
                <select 
                  value={bulkStatus}
                  onChange={e => setBulkStatus(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 font-semibold text-sm rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all cursor-pointer"
                >
                  <option value="" disabled>Pilih Progress Baru...</option>
                  <option value="PROCESSING">Status: Processing</option>
                  <option value="READY_FOR_PICKUP">Status: Ready Pickup</option>
                  <option value="SHIPPED">Status: Shipped</option>
                  <option value="COMPLETED">Status: Selesai</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button 
                onClick={handleBulkUpdate}
                disabled={!bulkStatus || isUpdating}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap transform active:scale-95"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Terapkan Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Table View for Mobile & Desktop */}
      <div className="overflow-x-auto select-none rounded-xl border border-gray-100 bg-white shadow-xs" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 uppercase tracking-widest text-[10px] font-black text-gray-500">
              <th className="px-5 py-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer transition-all"
                  checked={isAllSelected}
                  ref={el => { if (el) el.indeterminate = isSomeSelected }}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-4 whitespace-nowrap">Order ID & Pemesan</th>
              <th className="px-4 py-4 whitespace-nowrap">Metode Pengiriman</th>
              <th className="px-4 py-4 whitespace-nowrap text-right">Pembayaran & Total</th>
              <th className="px-4 py-4 whitespace-nowrap text-center">Progress (Status)</th>
              <th className="px-4 py-4 whitespace-nowrap text-right pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400 text-sm font-medium">
                  Tidak ada pesanan yang sesuai filter.
                </td>
              </tr>
            ) : null}
            {orders.map((order: any) => {
              const waUrl = formatWaLink(order.whatsapp, order.order_number, order.full_name)
              const isPickup = order.fulfillment_method === 'PICKUP'
              const isSelected = selectedOrders.has(order.order_number)

              return (
                <tr 
                  key={order.order_number} 
                  className={`transition-colors ${isSelected ? 'bg-green-50/40' : 'hover:bg-gray-50/60'}`}
                >
                  <td 
                    className="px-5 py-4 text-center cursor-pointer"
                    onMouseDown={() => handleMouseDown(order.order_number)}
                    onMouseEnter={() => handleMouseEnter(order.order_number)}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOrder(order.order_number)}
                      className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer transition-all"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-display font-black text-green-700 text-sm mb-1">{order.order_number}</div>
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      {order.full_name}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mt-0.5">Stambuk: {order.stambuk}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-1">
                      {isPickup ? <Package className="w-3.5 h-3.5 text-amber-600" /> : <Truck className="w-3.5 h-3.5 text-blue-600" />}
                      {isPickup ? 'AMBIL DI STAND' : 'KIRIM ALAMAT'}
                    </div>
                    {!isPickup && (
                      <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px]" title={order.shipping_city}>
                        {order.shipping_city}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-black text-gray-900 text-sm mb-1">{formatRupiah(order.total_amount)}</div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-600 border-gray-200">
                      <CreditCard className="w-3 h-3" />
                      {paymentLabels[order.payment_status] || order.payment_status}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${statusCls[order.order_status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {statusLabels[order.order_status] || order.order_status}
                    </span>
                    <div className="text-[10px] text-gray-400 font-medium mt-1.5 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right pr-6">
                    <OrderRowActions 
                      order={order} 
                      waUrl={waUrl} 
                      onDeleteClick={() => setOrderToDelete(order)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <DeleteOrderModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        order={orderToDelete}
        onConfirm={() => {
          setOrderToDelete(null)
          router.refresh()
        }}
      />
    </>
  )
}
