import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import QuickPaymentReviewClient from '@/components/admin/QuickPaymentReviewClient'

export const metadata: Metadata = { title: 'Verifikasi Pembayaran' }
export const revalidate = 0

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ selected?: string }>
}) {
  const params = await searchParams
  const supabase = await createAdminClient()

  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .in('order_status', ['PAYMENT_REVIEW', 'PROOF_UPLOADED'])
    .order('created_at', { ascending: true })

  return (
    <QuickPaymentReviewClient
      pendingOrders={pendingOrders ?? []}
      initialSelectedId={params.selected}
    />
  )
}
