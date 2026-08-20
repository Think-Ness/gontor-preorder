import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const exportType = searchParams.get('type') || 'orders'
    const statusFilter = searchParams.get('status') || 'ALL'

    const supabase = await createAdminClient()

    if (exportType === 'orders') {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'ALL') {
        query = query.eq('order_status', statusFilter)
      }

      const { data: orders, error } = await query

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const headers = [
        'Nomor Order',
        'Stambuk',
        'Nama Lengkap',
        'Konsulat / Daerah',
        'Tahun Angkatan',
        'WhatsApp',
        'Email',
        'Metode Fulfillment',
        'Alamat Pengiriman',
        'Kota',
        'Provinsi',
        'Kode Pos',
        'Subtotal (Rp)',
        'Ongkir (Rp)',
        'Total Pembayaran (Rp)',
        'Status Pembayaran',
        'Status Pesanan',
        'Tanggal Order',
      ]

      const rows = (orders ?? []).map(o => [
        `"${o.order_number}"`,
        `"${o.stambuk}"`,
        `"${o.full_name}"`,
        `"${o.district || ''}"`,
        `"${o.generation_year || ''}"`,
        `"${o.whatsapp || ''}"`,
        `"${o.email || ''}"`,
        `"${o.fulfillment_method === 'PICKUP' ? 'Ambil di Stand' : 'Kirim Alamat'}"`,
        `"${(o.shipping_address || '').replace(/"/g, '""')}"`,
        `"${o.shipping_city || ''}"`,
        `"${o.shipping_province || ''}"`,
        `"${o.shipping_postal_code || ''}"`,
        o.subtotal,
        o.shipping_cost,
        o.total_amount,
        `"${o.payment_status}"`,
        `"${o.order_status}"`,
        `"${new Date(o.created_at).toLocaleString('id-ID')}"`,
      ])

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Laporan_Pesanan_Gontor_100_${statusFilter}_${Date.now()}.csv"`,
        },
      })
    } else {
      // Export Items Breakdown
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*, order:orders(order_number, full_name, stambuk, whatsapp, created_at, order_status)')
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const headers = [
        'Nomor Order',
        'Nama Pemesan',
        'Stambuk',
        'WhatsApp',
        'Tipe Item',
        'Nama Produk / Paket',
        'Varian',
        'Jumlah (Qty)',
        'Harga Satuan (Rp)',
        'Subtotal (Rp)',
        'Status Order',
      ]

      const rows = (items ?? []).map((i: any) => [
        `"${i.order?.order_number || ''}"`,
        `"${i.order?.full_name || ''}"`,
        `"${i.order?.stambuk || ''}"`,
        `"${i.order?.whatsapp || ''}"`,
        `"${i.item_type}"`,
        `"${i.item_name_snapshot}"`,
        `"${i.variant_name_snapshot || '-'}"`,
        i.quantity,
        i.unit_price_snapshot,
        i.subtotal,
        `"${i.order?.order_status || ''}"`,
      ])

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Rincian_Item_Terjual_Gontor_100_${Date.now()}.csv"`,
        },
      })
    }
  } catch (err) {
    console.error('[GET /api/admin/export]', err)
    return NextResponse.json({ error: 'Gagal merender data CSV' }, { status: 500 })
  }
}
