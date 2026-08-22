'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils'
import { Bell, ShoppingCart } from 'lucide-react'

interface Notification {
  id: string
  type: 'new_order' | 'proof_uploaded'
  orderNumber: string
  name: string
  amount: number
  time: Date
}

export default function RealtimeOrderFeed() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new as any
          setNotifications(prev => [{
            id: order.id,
            type: 'new_order' as const,
            orderNumber: order.order_number,
            name: order.full_name,
            amount: order.total_amount,
            time: new Date(),
          }, ...prev].slice(0, 20))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new as any
          if (order.payment_proof_file_id && payload.old?.payment_proof_file_id !== order.payment_proof_file_id) {
            setNotifications(prev => [{
              id: order.id + '_proof',
              type: 'proof_uploaded' as const,
              orderNumber: order.order_number,
              name: order.full_name,
              amount: order.total_amount,
              time: new Date(),
            }, ...prev].slice(0, 20))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="card-premium p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4" style={{ color: 'var(--gontor-green)' }} />
        <h2 className="font-display font-bold text-gray-900">Notifikasi Realtime</h2>
        {notifications.length > 0 && (
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-red-500">
            {notifications.length}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-display font-semibold">Menunggu order baru...</p>
          <p className="text-xs mt-1">Notifikasi akan muncul secara realtime</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {notifications.map(n => (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                n.type === 'new_order' ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                {n.type === 'new_order'
                  ? <ShoppingCart className="w-4 h-4 text-green-600" />
                  : <Bell className="w-4 h-4 text-amber-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-xs text-gray-800">
                  {n.type === 'new_order' ? 'Order Baru' : 'Bukti Pembayaran'}
                </div>
                <div className="text-xs text-gray-600 truncate">{n.orderNumber} — {n.name}</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--gontor-green)' }}>
                  {formatRupiah(n.amount)}
                </div>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">
                {n.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
