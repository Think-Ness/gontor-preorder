import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET all size chart templates
export async function GET() {
  try {
    const supabase = await createAdminClient()
    const { data: sizeCharts, error } = await supabase
      .from('size_charts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[GET /api/admin/size-charts] Error:', error.message)
      return NextResponse.json({ data: [] })
    }

    return NextResponse.json({ data: sizeCharts || [] })
  } catch (err) {
    console.error('[GET /api/admin/size-charts]', err)
    return NextResponse.json({ data: [] })
  }
}

// POST create size chart template
export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()
    const body = await req.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Nama size chart wajib diisi' }, { status: 400 })
    }

    const newChart = {
      name: body.name.trim(),
      category: body.category || 'Pakaian',
      unit: body.unit || 'cm',
      sizes: body.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
      measurements: body.measurements || [],
      image_drive_file_id: body.image_drive_file_id || null,
      image_url: body.image_url || null,
    }

    const { data, error } = await supabase
      .from('size_charts')
      .insert(newChart)
      .select('*')
      .single()

    if (error) {
      console.error('[POST /api/admin/size-charts]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[POST /api/admin/size-charts]', err)
    return NextResponse.json({ error: 'Gagal membuat size chart' }, { status: 500 })
  }
}
