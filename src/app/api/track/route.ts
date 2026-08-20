import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    let query = searchParams.get('order')?.trim() || searchParams.get('q')?.trim()

    if (!query) {
      return NextResponse.json({ error: 'Nomor order tidak boleh kosong' }, { status: 400 })
    }

    // Standardize query format if user enters numbers only e.g. "11" -> "MCH-2026-00011"
    if (/^\d+$/.test(query)) {
      const padded = query.padStart(5, '0')
      query = `MCH-2026-${padded}`
    }

    const supabase = await createAdminClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .or(`order_number.ilike.${query},stambuk.eq.${query}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan. Pastikan nomor order benar.' }, { status: 404 })
    }

    return NextResponse.json({
      order: {
        id: order.id,
        order_number: order.order_number,
        stambuk: order.stambuk,
        full_name: order.full_name,
        district: order.district,
        generation_year: order.generation_year,
        fulfillment_method: order.fulfillment_method,
        shipping_address: order.shipping_address,
        shipping_city: order.shipping_city,
        shipping_province: order.shipping_province,
        subtotal: order.subtotal,
        shipping_cost: order.shipping_cost,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        order_status: order.order_status,
        admin_note: order.admin_note,
        created_at: order.created_at,
        items: (order.items ?? []).map((i: any) => ({
          id: i.id,
          name: i.item_name_snapshot,
          variantName: i.variant_name_snapshot,
          unitPrice: Number(i.unit_price_snapshot),
          quantity: i.quantity,
          subtotal: Number(i.subtotal),
        })),
      },
    })
  } catch (err) {
    console.error('[GET /api/track]', err)
    return NextResponse.json({ error: 'Gagal memuat status pesanan' }, { status: 500 })
  }
}
