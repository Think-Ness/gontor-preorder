import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

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

      const excelRows = (orders ?? []).map((o, idx) => ({
        'No': idx + 1,
        'Nomor Order': o.order_number,
        'Stambuk': o.stambuk,
        'Nama Lengkap': o.full_name,
        'Daerah / Konsulat': o.district || '-',
        'Tahun Angkatan': o.generation_year || '-',
        'No WhatsApp': o.whatsapp || '-',
        'Email': o.email || '-',
        'Fulfillment': o.fulfillment_method === 'PICKUP' ? 'Ambil di Stand' : 'Kirim Alamat',
        'Alamat Lengkap': o.shipping_address || '-',
        'Kota': o.shipping_city || '-',
        'Provinsi': o.shipping_province || '-',
        'Subtotal (Rp)': Number(o.subtotal || 0),
        'Ongkir (Rp)': Number(o.shipping_cost || 0),
        'Total Bayar (Rp)': Number(o.total_amount || 0),
        'Status Bayar': o.payment_status,
        'Status Pesanan': o.order_status,
        'Tanggal Order': new Date(o.created_at).toLocaleString('id-ID'),
      }))

      const worksheet = XLSX.utils.json_to_sheet(excelRows)

      // Set column widths for neat Excel layout
      worksheet['!cols'] = [
        { wch: 6 },   // No
        { wch: 18 },  // Order Number
        { wch: 12 },  // Stambuk
        { wch: 25 },  // Name
        { wch: 18 },  // District
        { wch: 14 },  // Generation
        { wch: 16 },  // WA
        { wch: 24 },  // Email
        { wch: 16 },  // Fulfillment
        { wch: 35 },  // Address
        { wch: 18 },  // City
        { wch: 18 },  // Province
        { wch: 16 },  // Subtotal
        { wch: 14 },  // Shipping
        { wch: 18 },  // Total
        { wch: 16 },  // Payment Status
        { wch: 18 },  // Order Status
        { wch: 22 },  // Date
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Pesanan')

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Laporan_Pesanan_Gontor100_${statusFilter}_${Date.now()}.xlsx"`,
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

      const itemRows = (items ?? []).map((i: any, idx: number) => ({
        'No': idx + 1,
        'Nomor Order': i.order?.order_number || '-',
        'Nama Pemesan': i.order?.full_name || '-',
        'Stambuk': i.order?.stambuk || '-',
        'WhatsApp': i.order?.whatsapp || '-',
        'Tipe Item': i.item_type,
        'Nama Produk / Paket': i.item_name_snapshot,
        'Ukuran / Varian': i.variant_name_snapshot || '-',
        'Jumlah Qty': i.quantity,
        'Harga Satuan (Rp)': Number(i.unit_price_snapshot || 0),
        'Subtotal (Rp)': Number(i.subtotal || 0),
        'Status Pesanan': i.order?.order_status || '-',
      }))

      const worksheet = XLSX.utils.json_to_sheet(itemRows)

      worksheet['!cols'] = [
        { wch: 6 },   // No
        { wch: 18 },  // Order Number
        { wch: 24 },  // Name
        { wch: 12 },  // Stambuk
        { wch: 16 },  // WA
        { wch: 10 },  // Type
        { wch: 30 },  // Product
        { wch: 18 },  // Variant
        { wch: 12 },  // Qty
        { wch: 16 },  // Price
        { wch: 16 },  // Subtotal
        { wch: 18 },  // Status
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rincian Item Produk')

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Rincian_Item_Gontor100_${Date.now()}.xlsx"`,
        },
      })
    }
  } catch (err) {
    console.error('[GET /api/admin/export]', err)
    return NextResponse.json({ error: 'Gagal merender file Excel (.xlsx)' }, { status: 500 })
  }
}
