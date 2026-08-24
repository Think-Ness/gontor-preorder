import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()
    const body = await req.json()

    const updateData = {
      name: body.name,
      category: body.category,
      unit: body.unit,
      sizes: body.sizes,
      measurements: body.measurements,
      image_drive_file_id: body.image_drive_file_id || null,
      image_url: body.image_url || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('size_charts')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[PUT /api/admin/size-charts/[id]]', err)
    return NextResponse.json({ error: 'Gagal memperbarui size chart' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('size_charts')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/size-charts/[id]]', err)
    return NextResponse.json({ error: 'Gagal menghapus size chart' }, { status: 500 })
  }
}
