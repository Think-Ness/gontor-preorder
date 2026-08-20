import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendPaymentApprovedEmail, sendPaymentRejectedEmail } from '@/lib/email'

const schema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'NEEDS_REVIEW', 'REQUEST_REUPLOAD']),
  admin_note: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params

  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createAdminClient()

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const { action, admin_note } = parsed.data

  if (action === 'REJECT' && !admin_note?.trim()) {
    return NextResponse.json({ error: 'Alasan penolakan wajib diisi' }, { status: 400 })
  }

  // Get admin profile
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let updates: Record<string, unknown> = {}

  switch (action) {
    case 'APPROVE':
      updates = {
        payment_status: 'PAID',
        order_status: 'PROCESSING',
        validated_by: adminProfile?.id,
        validated_at: new Date().toISOString(),
        admin_note: admin_note ?? null,
      }
      break
    case 'REJECT':
      updates = {
        payment_status: 'REJECTED',
        order_status: 'REJECTED',
        admin_note: admin_note ?? null,
        validated_by: adminProfile?.id,
        validated_at: new Date().toISOString(),
      }
      break
    case 'NEEDS_REVIEW':
      updates = {
        order_status: 'PAYMENT_REVIEW',
        admin_note: admin_note ?? 'Perlu review lebih lanjut',
      }
      break
    case 'REQUEST_REUPLOAD':
      updates = {
        payment_status: 'UNPAID',
        order_status: 'DRAFT',
        payment_proof_file_id: null,
        payment_proof_url: null,
        payment_proof_filename: null,
        admin_note: admin_note ?? 'Mohon upload ulang bukti pembayaran',
      }
      break
  }

  // Fetch order for email notification
  const { data: orderDetails } = await supabase
    .from('orders')
    .select('order_number, full_name, fulfillment_method, email, total_amount, items:order_items(*)')
    .eq('id', orderId)
    .single()

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId)

  if (error) {
    console.error('[admin/payments/action]', error)
    return NextResponse.json({ error: 'Gagal update order' }, { status: 500 })
  }

  // Trigger email notifications
  if (orderDetails && orderDetails.email) {
    const emailItems = (orderDetails.items ?? []).map((i: any) => ({
      name: i.item_name_snapshot,
      variantName: i.variant_name_snapshot,
      unitPrice: Number(i.unit_price_snapshot),
      quantity: i.quantity,
      subtotal: Number(i.subtotal),
    }))

    if (action === 'APPROVE') {
      sendPaymentApprovedEmail(orderDetails.email, {
        orderNumber: orderDetails.order_number,
        fullName: orderDetails.full_name,
        fulfillmentMethod: orderDetails.fulfillment_method,
        totalAmount: Number(orderDetails.total_amount),
        items: emailItems,
      }).catch(e => console.error('Email send error:', e))
    } else if (action === 'REJECT' || action === 'REQUEST_REUPLOAD') {
      sendPaymentRejectedEmail(orderDetails.email, {
        orderNumber: orderDetails.order_number,
        fullName: orderDetails.full_name,
      }, admin_note || 'Bukti transfer memerlukan konfirmasi ulang').catch(e => console.error('Email send error:', e))
    }
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    admin_id: adminProfile?.id,
    action: `payment_${action.toLowerCase()}`,
    entity_type: 'order',
    entity_id: orderId,
    new_data: updates,
  })

  return NextResponse.json({ success: true })
}
