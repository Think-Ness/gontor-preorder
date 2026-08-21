import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendOrderCancellationEmail } from '@/lib/email'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { customMessage } = body

    const supabase = await createAdminClient()

    // 1. Fetch order details before deleting (need email & name for notification)
    const { data: order } = await supabase
      .from('orders')
      .select('order_number, full_name, email')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    // 2. Delete order_items first (if foreign key doesn't cascade)
    await supabase.from('order_items').delete().eq('order_id', orderId)

    // 3. Delete the order
    const { error: deleteErr } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 })
    }

    // 4. Send cancellation email if customMessage is provided and email exists
    if (customMessage && customMessage.trim() !== '' && order.email) {
      sendOrderCancellationEmail(order.email, {
        orderNumber: order.order_number,
        fullName: order.full_name,
      }, customMessage).catch(e => console.error('Cancellation email error:', e))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/orders/[orderId]]', err)
    return NextResponse.json({ error: 'Gagal menghapus pesanan' }, { status: 500 })
  }
}
