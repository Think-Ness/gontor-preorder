import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  try {
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()
    const body = await req.json()
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Data urutan tidak valid' }, { status: 400 })
    }

    const updates = items.map((item: { id: string; display_order: number }) =>
      supabase
        .from('products')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/products/reorder]', err)
    return NextResponse.json({ error: 'Gagal memperbarui urutan produk' }, { status: 500 })
  }
}
