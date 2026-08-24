import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawQuery = searchParams.get('order')?.trim() || searchParams.get('q')?.trim() || ''

    if (!rawQuery) {
      return NextResponse.json({ error: 'Nomor Order, Stambuk, atau Nomor WhatsApp tidak boleh kosong' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Build conditions for matching:
    // 1. Exact match on order_number, stambuk, or whatsapp
    // 2. Format numeric string into MCH-2026-XXXXX if applicable
    const targets: string[] = [rawQuery]

    if (/^\d+$/.test(rawQuery)) {
      // If user typed short number like "11" or "00011", candidate order number is MCH-2026-00011
      const padded = rawQuery.padStart(5, '0')
      targets.push(`MCH-2026-${padded}`)
    } else if (rawQuery.toUpperCase().startsWith('MCH-')) {
      targets.push(rawQuery.toUpperCase())
    }

    const uniqueTargets = Array.from(new Set(targets))
    const orConditions = uniqueTargets.flatMap(t => [
      `order_number.ilike.${t}`,
      `stambuk.ilike.${t}`,
      `whatsapp.ilike.${t}`
    ]).join(',')

    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .or(orConditions)
      .order('created_at', { ascending: false })

    if (error || !ordersData || ordersData.length === 0) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan. Pastikan Nomor Order, Stambuk, atau No. WA sudah benar.' }, { status: 404 })
    }

    const formattedOrders = ordersData.map(order => {
      const mappedItems = (order.items ?? []).map((i: any) => ({
        ...i,
        id: i.id,
        name: i.item_name_snapshot || 'Merchandise',
        item_name_snapshot: i.item_name_snapshot || 'Merchandise',
        product_name: i.item_name_snapshot || 'Merchandise',
        variantName: i.variant_name_snapshot || '',
        variant_name_snapshot: i.variant_name_snapshot || '',
        variant_name: i.variant_name_snapshot || '',
        unitPrice: Number(i.unit_price_snapshot || 0),
        quantity: i.quantity || 1,
        subtotal: Number(i.subtotal || 0),
      }))

      return {
        ...order,
        id: order.id,
        order_number: order.order_number,
        stambuk: order.stambuk,
        full_name: order.full_name,
        whatsapp: order.whatsapp,
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
        items: mappedItems,
        order_items: mappedItems,
      }
    })

    return NextResponse.json({
      order: formattedOrders[0],
      orders: formattedOrders,
    })
  } catch (err) {
    console.error('[GET /api/track]', err)
    return NextResponse.json({ error: 'Gagal memuat status pesanan' }, { status: 500 })
  }
}
