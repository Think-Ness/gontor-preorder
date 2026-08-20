import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { orderNumbers, newStatus } = await req.json()

    if (!Array.isArray(orderNumbers) || orderNumbers.length === 0) {
      return NextResponse.json({ error: 'orderNumbers required and must be an array' }, { status: 400 })
    }

    if (!newStatus) {
      return NextResponse.json({ error: 'newStatus required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .in('order_number', orderNumbers)

    if (error) {
      console.error('Bulk update status error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: orderNumbers.length })
  } catch (err: any) {
    console.error('Bulk update API error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
