'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Package, Truck, CheckSquare, Square, ChevronDown, Loader2 } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import OrderRowActions from '@/components/admin/OrderRowActions'

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
  PAYMENT_REVIEW: 'badge-review', PAID: 'badge-paid', PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  READY_FOR_PICKUP: 'bg-purple-50 text-purple-700 border-purple-200', SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  COMPLETED: 'badge-paid', REJECTED: 'badge-rejected', CANCELLED: 'badge-unpaid', DRAFT: 'badge-unpaid',
  PROOF_UPLOADED: 'badge-scheduled',
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
      toggleOrder(orderNumber, true) // Always select when dragging over
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

  return (
    <>
      {/* Floating Bulk Action Bar */}
      {selectedOrders.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-gray-900 text-white rounded-2xl p-3 shadow-2xl flex items-center gap-4">
            <div className="px-3">
              <span className="font-bold">{selectedOrders.size}</span> terpilih
            </div>
            <div className="w-px h-6 bg-gray-700"></div>
            <div className="flex items-center gap-2">
              <select 
                value={bulkStatus}
                onChange={e => setBulkStatus(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-500"
              >
                <option value="">Pilih Status Baru...</option>
                <option value="PAYMENT_REVIEW">Payment Review</option>
                <option value="PAID">Paid</option>
                <option value="PROCESSING">Processing</option>
                <option value="READY_FOR_PICKUP">Ready Pickup</option>
                <option value="SHIPPED">Shipped</option>
                <option value="COMPLETED">Selesai</option>
              </select>
              <button 
                onClick={handleBulkUpdate}
                disabled={!bulkStatus || isUpdating}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Massal'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto select-none" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left w-10">
                {/* Select All Checkbox */}
                <button 
                  onClick={() => {
                    if (selectedOrders.size === orders.length) setSelectedOrders(new Set())
                    else setSelectedOrders(new Set(orders.map(o => o.order_number)))
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {selectedOrders.size === orders.length && orders.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              {['Order', 'Nama Pemesan', 'WhatsApp', 'Total', 'Metode', 'Pembayaran', 'Status', 'Tanggal', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-display font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order: any) => {
              const waUrl = formatWaLink(order.whatsapp, order.order_number, order.full_name)
              const isPickup = order.fulfillment_method === 'PICKUP'
              const isSelected = selectedOrders.has(order.order_number)

              return (
                <tr 
                  key={order.order_number} 
                  className={`transition-colors ${isSelected ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}
                >
                  <td 
                    className="px-4 py-3 cursor-pointer"
                    onMouseDown={() => handleMouseDown(order.order_number)}
                    onMouseEnter={() => handleMouseEnter(order.order_number)}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-green-600 pointer-events-none" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300 pointer-events-none" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-display font-bold text-sm text-gray-900 whitespace-nowrap">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-800">{order.full_name}</div>
                    <div className="text-xs text-gray-500">Stambuk: {order.stambuk}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold border border-green-200 transition-colors"
                      title="Chat via WhatsApp"
                      onClick={e => e.stopPropagation()}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {order.whatsapp}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-semibold text-sm whitespace-nowrap" style={{ color: 'var(--gontor-green)' }}>
                    {formatRupiah(Number(order.total_amount))}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-display font-bold border ${
                      isPickup
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {isPickup ? <Package className="w-3 h-3 text-green-600" /> : <Truck className="w-3 h-3 text-blue-600" />}
                      {isPickup ? 'Ambil Stand' : 'Kirim Alamat'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusCls[order.payment_status] ?? 'badge-unpaid'}`}>
                      {paymentLabels[order.payment_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusCls[order.order_status] ?? 'badge-unpaid'}`}>
                      {statusLabels[order.order_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" onMouseDown={e => e.stopPropagation()}>
                    <OrderRowActions order={order} />
                  </td>
                </tr>
              )
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center text-gray-400 text-sm">
                  Tidak ada order ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
