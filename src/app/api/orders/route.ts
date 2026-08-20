import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createOrderSchema } from '@/lib/validations/schemas'
import { normalizeWhatsApp } from '@/lib/utils'
import { sendOrderReceivedEmail } from '@/lib/email'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Data tidak valid' },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Validate pre-order is still open
    const supabase = await createAdminClient()
    const { data: settings } = await supabase
      .from('event_settings')
      .select('*')
      .single()

    if (!settings || !settings.is_active) {
      return NextResponse.json({ error: 'Pre-order sudah ditutup' }, { status: 400 })
    }

    const now = new Date()
    if (settings.preorder_start && now < new Date(settings.preorder_start)) {
      return NextResponse.json({ error: 'Pre-order belum dibuka' }, { status: 400 })
    }
    if (settings.preorder_end && now > new Date(settings.preorder_end)) {
      return NextResponse.json({ error: 'Pre-order sudah berakhir' }, { status: 400 })
    }

    // Validate delivery address
    if (data.fulfillment_method === 'DELIVERY') {
      if (!data.shipping_address || !data.shipping_city || !data.shipping_province) {
        return NextResponse.json({ error: 'Alamat pengiriman tidak lengkap' }, { status: 400 })
      }
    }

    // Normalize WhatsApp
    const normalizedWA = normalizeWhatsApp(data.whatsapp)

    // Prepare data for idempotent function
    const orderData = {
      stambuk: data.stambuk,
      full_name: data.full_name,
      district: data.district,
      generation_year: data.generation_year,
      whatsapp: normalizedWA,
      fulfillment_method: data.fulfillment_method,
      shipping_address: data.shipping_address ?? null,
      shipping_village: data.shipping_village ?? null,
      shipping_district: data.shipping_district ?? null,
      shipping_city: data.shipping_city ?? null,
      shipping_province: data.shipping_province ?? null,
      shipping_postal_code: data.shipping_postal_code ?? null,
      shipping_cost: 0, // Admin-configured; currently 0
      payment_proof_file_id: data.payment_proof_file_id,
      payment_proof_url: `/api/drive/preview/${data.payment_proof_file_id}`,
      payment_proof_filename: data.payment_proof_filename,
      payment_proof_mime_type: data.payment_proof_mime_type,
      payment_proof_size: data.payment_proof_size,
    }

    const items = data.items.map(i => ({
      productId: i.productId ?? null,
      variantId: i.variantId ?? null,
      packageId: i.packageId ?? null,
      itemType: i.itemType,
      quantity: i.quantity,
    }))

    // Call idempotent PostgreSQL function
    const { data: result, error } = await supabase.rpc('create_order_idempotent', {
      p_checkout_session_id: data.checkout_session_id,
      p_order_data: orderData,
      p_items: items,
    })

    if (error) {
      console.error('[POST /api/orders] Supabase error:', error)
      // Parse user-friendly messages from Postgres
      const msg = error.message.includes('Stok tidak')
        ? error.message
        : error.message.includes('not found') || error.message.includes('inactive')
          ? 'Beberapa produk tidak lagi tersedia. Silakan cek kembali keranjang Anda.'
          : 'Pesanan belum berhasil dikirim. Data pesanan tetap tersimpan di perangkat Anda. Silakan coba lagi.'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    // Update email in orders table & trigger email notification
    if (data.email) {
      await supabase.from('orders').update({ email: data.email }).eq('id', result.order_id)

      const { data: orderItems } = await supabase
        .from('order_items')
        .select('item_name_snapshot, variant_name_snapshot, unit_price_snapshot, quantity, subtotal')
        .eq('order_id', result.order_id)

      const emailItems = (orderItems ?? []).map(i => ({
        name: i.item_name_snapshot,
        variantName: i.variant_name_snapshot,
        unitPrice: Number(i.unit_price_snapshot),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
      }))

      try {
        await sendOrderReceivedEmail(data.email, {
          orderNumber: result.order_number,
          fullName: data.full_name,
          totalAmount: result.total_amount,
          items: emailItems,
        })
      } catch (e) {
        console.error('Email dispatch error:', e)
      }
    }

    return NextResponse.json({
      order_id: result.order_id,
      order_number: result.order_number,
      total_amount: result.total_amount,
      already_exists: result.already_exists,
    })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json(
      { error: 'Pesanan belum berhasil dikirim. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
