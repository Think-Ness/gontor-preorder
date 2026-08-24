import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const body = await req.json()

    if (!body.product_ids || !Array.isArray(body.product_ids) || body.product_ids.length === 0) {
      return NextResponse.json({ error: 'Minimal 1 produk harus dipilih' }, { status: 400 })
    }

    const sizeChartId = body.size_chart_id && body.size_chart_id.trim() !== '' ? body.size_chart_id : null

    const { error } = await supabase
      .from('products')
      .update({ size_chart_id: sizeChartId })
      .in('id', body.product_ids)

    if (error) {
      console.error('[POST /api/admin/products/bulk-size-chart] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: body.product_ids.length })
  } catch (err) {
    console.error('[POST /api/admin/products/bulk-size-chart]', err)
    return NextResponse.json({ error: 'Gagal memperbarui size chart produk secara masal' }, { status: 500 })
  }
}
