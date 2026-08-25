import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const DEFAULT_TEMPLATES = [
  {
    name: 'Size Chart Kaos Lengan Pendek',
    category: 'T-Shirt',
    unit: 'cm',
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: [
      { label: "Panjang Lengan", values: { "XS": "19.5", "S": "20.5", "M": "22", "L": "23", "XL": "24.5", "XXL": "26" } },
      { label: "Tinggi Badan", values: { "XS": "64", "S": "66", "M": "68.5", "L": "70", "XL": "74", "XXL": "76" } },
      { label: "Lebar Badan", values: { "XS": "41.5", "S": "45.5", "M": "49.5", "L": "52.5", "XL": "57.5", "XXL": "61.5" } }
    ]
  },
  {
    name: 'Size Chart Kaos Lengan Panjang',
    category: 'T-Shirt Long Sleeve',
    unit: 'cm',
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: [
      { label: "Panjang Lengan", values: { "XS": "52", "S": "52.5", "M": "54", "L": "55.5", "XL": "59", "XXL": "61" } },
      { label: "Tinggi Badan", values: { "XS": "64", "S": "66", "M": "68.5", "L": "70", "XL": "74", "XXL": "76" } },
      { label: "Lebar Badan", values: { "XS": "41.5", "S": "45.5", "M": "49.5", "L": "52.5", "XL": "57.5", "XXL": "61.5" } }
    ]
  },
  {
    name: 'Size Chart Jaket Bomber',
    category: 'Jacket',
    unit: 'cm',
    sizes: ["S", "M", "L", "XL", "XXL"],
    measurements: [
      { label: "Panjang Jaket (PJ)", values: { "S": "64", "M": "68", "L": "72", "XL": "75", "XXL": "78" } },
      { label: "Lingkar Dada (LD)", values: { "S": "114", "M": "116", "L": "118", "XL": "120", "XXL": "122" } },
      { label: "Panjang Tangan (PT)", values: { "S": "60", "M": "62", "L": "64", "XL": "66", "XXL": "68" } }
    ]
  },
  {
    name: 'Size Chart Moslem Cloth',
    category: 'Moslem Wear',
    unit: 'cm',
    sizes: ["13", "13.5", "14", "14.5", "15", "15.5", "16", "16.5", "17"],
    measurements: [
      { label: "Panjang Lengan", values: { "13": "54", "13.5": "55.5", "14": "57.5", "14.5": "58", "15": "59.5", "15.5": "60", "16": "57.5", "16.5": "59.5", "17": "61" } },
      { label: "Tinggi Badan", values: { "13": "70.5", "13.5": "72.5", "14": "74", "14.5": "76.5", "15": "77.5", "15.5": "79", "16": "81", "16.5": "82", "17": "78" } },
      { label: "Lebar Badan", values: { "13": "27.5", "13.5": "28", "14": "32", "14.5": "32.5", "15": "34", "15.5": "35.5", "16": "37.5", "16.5": "38.5", "17": "39.5" } }
    ]
  }
]

// GET all size chart templates
export async function GET() {
  try {
    const supabase = await createAdminClient()
    let { data: sizeCharts, error } = await supabase
      .from('size_charts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[GET /api/admin/size-charts] Error:', error.message)
      return NextResponse.json({ data: DEFAULT_TEMPLATES })
    }

    // Auto seed missing templates if needed
    const existingNames = new Set((sizeCharts || []).map(sc => sc.name))
    const missing = DEFAULT_TEMPLATES.filter(tpl => !existingNames.has(tpl.name))

    if (missing.length > 0) {
      const { data: seeded } = await supabase
        .from('size_charts')
        .insert(missing)
        .select('*')
      if (seeded && seeded.length > 0) {
        sizeCharts = [...(sizeCharts || []), ...seeded]
      }
    }

    // Sync Jaket Bomber data if it's using old measurements
    const bomberTemplate = DEFAULT_TEMPLATES.find(t => t.name === 'Size Chart Jaket Bomber')
    const existingBomber = (sizeCharts || []).find(sc => sc.name === 'Size Chart Jaket Bomber')
    if (existingBomber && bomberTemplate) {
      const hasNewFormat = existingBomber.measurements?.some((m: any) => m.label.includes('Panjang Jaket (PJ)'))
      if (!hasNewFormat) {
        await supabase
          .from('size_charts')
          .update({
            sizes: bomberTemplate.sizes,
            measurements: bomberTemplate.measurements,
          })
          .eq('id', existingBomber.id)

        existingBomber.sizes = bomberTemplate.sizes
        existingBomber.measurements = bomberTemplate.measurements
      }
    }

    return NextResponse.json({ data: sizeCharts && sizeCharts.length > 0 ? sizeCharts : DEFAULT_TEMPLATES })
  } catch (err) {
    console.error('[GET /api/admin/size-charts]', err)
    return NextResponse.json({ data: DEFAULT_TEMPLATES })
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
