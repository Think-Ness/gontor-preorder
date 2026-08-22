import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { packageSchema } from '@/lib/validations/schemas'

export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()

    const body = await req.json()
    const parsed = packageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Data tidak valid' }, { status: 400 })
    }

    const { items, ...pkgData } = parsed.data

    const { data: pkg, error: pkgErr } = await supabase
      .from('packages')
      .insert(pkgData)
      .select('id')
      .single()

    if (pkgErr) return NextResponse.json({ error: pkgErr.message }, { status: 500 })

    if (items && items.length > 0) {
      const packageItems = items.map(i => ({
        package_id: pkg.id,
        product_id: i.product_id,
        variant_id: i.variant_id || null,
        quantity: i.quantity,
      }))
      await supabase.from('package_items').insert(packageItems)
    }

    return NextResponse.json({ success: true, id: pkg.id })
  } catch (err) {
    console.error('[POST /api/admin/packages]', err)
    return NextResponse.json({ error: 'Gagal membuat paket' }, { status: 500 })
  }
}
