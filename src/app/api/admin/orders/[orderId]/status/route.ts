import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendOrderStatusUpdatedEmail } from '@/lib/email'

const statusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'PROOF_UPLOADED',
    'PAYMENT_REVIEW',
    'PAID',
    'PROCESSING',
    'READY_FOR_PICKUP',
    'SHIPPED',
    'COMPLETED',
    'REJECTED',
    'CANCELLED',
  ]),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = statusSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })

    const { status } = parsed.data
    const supabase = await createAdminClient()

    // Get order info before update
    const { data: order } = await supabase
      .from('orders')
      .select('order_number, full_name, fulfillment_method, email')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    // Update order status
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // Send email status update
    if (order.email) {
      sendOrderStatusUpdatedEmail(order.email, {
        orderNumber: order.order_number,
        fullName: order.full_name,
        status,
        fulfillmentMethod: order.fulfillment_method,
      }).catch(e => console.error('Status email error:', e))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/admin/orders/[orderId]/status]', err)
    return NextResponse.json({ error: 'Gagal memperbarui status order' }, { status: 500 })
  }
}
