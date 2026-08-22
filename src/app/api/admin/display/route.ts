import { NextRequest, NextResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'vendor' // vendor | stand | delivery

    const supabase = await createAdminClient()

    const { data: items, error } = await supabase
      .from('order_items')
      .select(`
        item_name_snapshot,
        variant_name_snapshot,
        quantity,
        subtotal,
        item_type,
        orders!inner(
          id,
          order_number,
          full_name,
          stambuk,
          whatsapp,
          fulfillment_method,
          payment_status,
          order_status,
          shipping_city,
          shipping_province,
          created_at
        )
      `)
      .eq('orders.payment_status', 'PAID')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Grouping stats per product -> variant
    const recapMap: Record<string, {
      productName: string
      variants: Record<string, { total: number; pickup: number; delivery: number }>
      totalQty: number
      pickupQty: number
      deliveryQty: number
    }> = {}

    let grandTotalQty = 0
    let grandPickupQty = 0
    let grandDeliveryQty = 0

    const ordersMap: Record<string, any> = {}

    items?.forEach((item: any) => {
      const pName = item.item_name_snapshot || 'Unknown Product'
      const vName = item.variant_name_snapshot || 'Tanpa Varian'
      const qty = item.quantity || 0
      const order = item.orders
      const method = order?.fulfillment_method === 'DELIVERY' ? 'DELIVERY' : 'PICKUP'

      grandTotalQty += qty
      if (method === 'PICKUP') grandPickupQty += qty
      else grandDeliveryQty += qty

      if (!recapMap[pName]) {
        recapMap[pName] = {
          productName: pName,
          variants: {},
          totalQty: 0,
          pickupQty: 0,
          deliveryQty: 0,
        }
      }

      recapMap[pName].totalQty += qty
      if (method === 'PICKUP') recapMap[pName].pickupQty += qty
      else recapMap[pName].deliveryQty += qty

      if (!recapMap[pName].variants[vName]) {
        recapMap[pName].variants[vName] = { total: 0, pickup: 0, delivery: 0 }
      }

      recapMap[pName].variants[vName].total += qty
      if (method === 'PICKUP') recapMap[pName].variants[vName].pickup += qty
      else recapMap[pName].variants[vName].delivery += qty

      if (order && !ordersMap[order.id]) {
        ordersMap[order.id] = {
          ...order,
          itemsCount: 0,
        }
      }
      if (order) {
        ordersMap[order.id].itemsCount += qty
      }
    })

    const allOrdersList = Object.values(ordersMap)
    const pickupOrders = allOrdersList.filter((o: any) => o.fulfillment_method === 'PICKUP')
    const deliveryOrders = allOrdersList.filter((o: any) => o.fulfillment_method === 'DELIVERY')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalPaidOrders: allOrdersList.length,
        totalItemsQty: grandTotalQty,
        pickupItemsQty: grandPickupQty,
        deliveryItemsQty: grandDeliveryQty,
        pickupOrdersCount: pickupOrders.length,
        deliveryOrdersCount: deliveryOrders.length,
      },
      recap: Object.values(recapMap).sort((a, b) => b.totalQty - a.totalQty),
      orders: type === 'stand' ? pickupOrders : type === 'delivery' ? deliveryOrders : allOrdersList,
    })
  } catch (err) {
    console.error('[GET /api/admin/display]', err)
    return NextResponse.json({ error: 'Gagal memuat data display realtime' }, { status: 500 })
  }
}
