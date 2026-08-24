import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, action = 'verify' } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'Nomor Order / QR Data tidak valid' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const cleanQuery = query.trim()

    // Extract Order Number if full URL or scanned text format is used
    let searchOrderNum = cleanQuery
    if (cleanQuery.includes('order=')) {
      const match = cleanQuery.match(/order=([A-Z0-9-]+)/i)
      if (match && match[1]) {
        searchOrderNum = match[1]
      }
    } else if (cleanQuery.includes('Order:')) {
      const match = cleanQuery.match(/Order:\s*([A-Z0-9-]+)/i)
      if (match && match[1]) {
        searchOrderNum = match[1]
      }
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchOrderNum)
    
    // Build query safely without invalid UUID syntax errors
    let dbQuery = supabase
      .from('orders')
      .select('*, order_items(*)')
    
    if (isUuid) {
      dbQuery = dbQuery.or(`id.eq.${searchOrderNum},order_number.ilike.%${searchOrderNum}%,stambuk.ilike.%${searchOrderNum}%`)
    } else {
      dbQuery = dbQuery.or(`order_number.ilike.%${searchOrderNum}%,stambuk.ilike.%${searchOrderNum}%`)
    }

    const { data: order, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !order) {
      return NextResponse.json({
        success: false,
        status: 'NOT_FOUND',
        error: `Pesanan "${searchOrderNum}" tidak ditemukan. Pastikan Nomor Order atau Stambuk sudah sesuai.`,
      }, { status: 200 })
    }

    const isPaid = order.payment_status === 'PAID'
    const isCompleted = ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.order_status?.toUpperCase())
    const isPickup = order.fulfillment_method === 'PICKUP'

    if (action === 'handover') {
      if (!isPickup) {
        return NextResponse.json({
          success: false,
          status: 'DELIVERY_METHOD',
          error: 'Pesanan ini terdaftar untuk opsi Kirim Alamat (Ekspedisi), bukan Ambil di Stand.',
          order,
        }, { status: 400 })
      }

      if (!isPaid) {
        return NextResponse.json({
          success: false,
          status: 'UNPAID',
          error: 'Pesanan belum terverifikasi lunas. Tidak dapat diserahkan.',
          order,
        }, { status: 400 })
      }

      if (isCompleted) {
        return NextResponse.json({
          success: false,
          status: 'ALREADY_COMPLETED',
          error: 'Pesanan ini sudah pernah diserahkan sebelumnya!',
          order,
        }, { status: 400 })
      }

      // Update Order status to COMPLETED
      const now = new Date().toISOString()
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          order_status: 'COMPLETED',
          updated_at: now,
        })
        .eq('id', order.id)

      if (updateErr) {
        return NextResponse.json({ success: false, error: 'Gagal memperbarui status pesanan.' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        status: 'SUCCESS',
        message: `Pesanan ${order.order_number} (${order.full_name}) berhasil diserahkan!`,
        order: { ...order, order_status: 'COMPLETED' },
      })
    }

    if (action === 'mark_ready') {
      const now = new Date().toISOString()
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          order_status: 'READY_FOR_PICKUP',
          updated_at: now,
        })
        .eq('id', order.id)

      if (updateErr) {
        return NextResponse.json({ success: false, error: 'Gagal memperbarui status pesanan.' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        status: 'READY_FOR_PICKUP',
        message: `Status pesanan ${order.order_number} berhasil diperbarui menjadi SIAP DIAMBIL!`,
        order: { ...order, order_status: 'READY_FOR_PICKUP' },
      })
    }

    // Determine verification status
    const orderStatus = (order.order_status || '').toUpperCase()
    let verifyStatus = 'READY_FOR_PICKUP'
    
    if (!isPickup) {
      verifyStatus = 'DELIVERY_METHOD'
    } else if (!isPaid) {
      verifyStatus = 'UNPAID'
    } else if (isCompleted) {
      verifyStatus = 'ALREADY_COMPLETED'
    } else if (orderStatus === 'PROCESSING' || orderStatus === 'PAID') {
      verifyStatus = 'PROCESSING'
    } else {
      verifyStatus = 'READY_FOR_PICKUP'
    }

    return NextResponse.json({
      success: true,
      status: verifyStatus,
      isPaid,
      isCompleted,
      isPickup,
      order,
    })

  } catch (err: any) {
    console.error('Pickup Verify Error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 })
  }
}
