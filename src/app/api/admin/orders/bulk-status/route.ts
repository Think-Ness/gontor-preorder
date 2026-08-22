import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkIsAdmin } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { orderNumbers, newStatus } = await req.json()

    if (!Array.isArray(orderNumbers) || orderNumbers.length === 0) {
      return NextResponse.json({ error: 'orderNumbers required and must be an array' }, { status: 400 })
    }

    if (!newStatus) {
      return NextResponse.json({ error: 'newStatus required' }, { status: 400 })
    }

    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
