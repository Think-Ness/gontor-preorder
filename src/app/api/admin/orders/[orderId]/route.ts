import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth'
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
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      full_name,
      stambuk,
      district,
      generation_year,
      whatsapp,
      email,
      fulfillment_method,
      shipping_address,
      shipping_village,
      shipping_district,
      shipping_city,
      shipping_province,
      shipping_postal_code,
      shipping_cost,
      total_amount,
    } = body

    const supabase = await createAdminClient()

    const updateData: Record<string, any> = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (stambuk !== undefined) updateData.stambuk = stambuk
    if (district !== undefined) updateData.district = district
    if (generation_year !== undefined) updateData.generation_year = Number(generation_year)
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp
    if (email !== undefined) updateData.email = email
    if (fulfillment_method !== undefined) updateData.fulfillment_method = fulfillment_method
    if (shipping_address !== undefined) updateData.shipping_address = shipping_address
    if (shipping_village !== undefined) updateData.shipping_village = shipping_village
    if (shipping_district !== undefined) updateData.shipping_district = shipping_district
    if (shipping_city !== undefined) updateData.shipping_city = shipping_city
    if (shipping_province !== undefined) updateData.shipping_province = shipping_province
    if (shipping_postal_code !== undefined) updateData.shipping_postal_code = shipping_postal_code
    if (shipping_cost !== undefined) updateData.shipping_cost = Number(shipping_cost)
    if (total_amount !== undefined) updateData.total_amount = Number(total_amount)

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch (err) {
    console.error('[PATCH /api/admin/orders/[orderId]]', err)
    return NextResponse.json({ error: 'Gagal memperbarui detail pesanan' }, { status: 500 })
  }
}

