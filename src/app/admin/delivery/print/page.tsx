import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import PrintDeliveryClientView from '@/components/admin/PrintDeliveryClientView'

export const metadata: Metadata = { title: 'Print Label Pengiriman' }
export const revalidate = 0

export default async function PrintDeliveryPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const params = await searchParams
  const ids = params.ids?.split(',').filter(Boolean)

  if (!ids || ids.length === 0) {
    return <div className="p-10 text-center text-gray-500 font-bold">Pilih pesanan terlebih dahulu.</div>
  }

  const supabase = await createAdminClient()
  
  // Fetch event settings for configured logo
  const { data: settings } = await supabase
    .from('event_settings')
    .select('favicon_url')
    .limit(1)
    .maybeSingle()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .in('id', ids)
    .order('created_at', { ascending: false })

  if (error || !orders) {
    return <div className="p-10 text-center text-red-600 font-bold">Gagal memuat pesanan.</div>
  }

  const logoUrl = settings?.favicon_url || null

  return (
    <PrintDeliveryClientView orders={orders} logoUrl={logoUrl} />
  )
}
