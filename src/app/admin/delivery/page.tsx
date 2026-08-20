import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import DeliveryClient from '@/components/admin/DeliveryClient'

export const metadata: Metadata = { title: 'Manajemen Delivery' }
export const revalidate = 0

export default async function DeliveryPage() {
  const supabase = await createAdminClient()

  // Fetch all active delivery orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('fulfillment_method', 'DELIVERY')
    .in('order_status', ['PAID', 'PROCESSING', 'READY_FOR_PICKUP', 'SHIPPED'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching delivery orders:', error)
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Manajemen Pengiriman (Delivery)</h1>
        <p className="text-gray-500 text-sm mt-1">Kelompokkan pesanan berdasarkan kota dan cetak resi pengiriman massal.</p>
      </div>
      
      <DeliveryClient initialOrders={orders || []} />
    </div>
  )
}
