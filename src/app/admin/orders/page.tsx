import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight, Package, Truck, MessageCircle } from 'lucide-react'
import OrderTableClient from '@/components/admin/OrderTableClient'

export const metadata: Metadata = { title: 'Orders' }
export const revalidate = 0

const PAGE_SIZE = 25

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft', PROOF_UPLOADED: 'Bukti Upload', PAYMENT_REVIEW: 'Payment Review',
  PAID: 'Paid', PROCESSING: 'Processing', READY_FOR_PICKUP: 'Ready Pickup',
  SHIPPED: 'Shipped', COMPLETED: 'Selesai', REJECTED: 'Ditolak', CANCELLED: 'Dibatalkan',
}
const paymentLabels: Record<string, string> = {
  UNPAID: 'Belum Bayar', PROOF_UPLOADED: 'Bukti Upload', UNDER_REVIEW: 'Review',
  PAID: 'Lunas', REJECTED: 'Ditolak',
}
const statusCls: Record<string, string> = {
  PAYMENT_REVIEW: 'badge-review', PAID: 'badge-paid', PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  READY_FOR_PICKUP: 'bg-purple-50 text-purple-700 border-purple-200', SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  COMPLETED: 'badge-paid', REJECTED: 'badge-rejected', CANCELLED: 'badge-unpaid', DRAFT: 'badge-unpaid',
  PROOF_UPLOADED: 'badge-scheduled',
}

function formatWaLink(phone: string, orderNumber: string, name: string) {
  let cleaned = (phone || '').replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  }
  const text = encodeURIComponent(`Halo Kak ${name}, mengenai pesanan ${orderNumber} Gontor 100 Tahun...`)
  return `https://wa.me/${cleaned}?text=${text}`
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; method?: string; page?: string }>
}) {
  const params = await searchParams
  const q = params.q ?? ''
  const statusFilter = params.status ?? ''
  const methodFilter = params.method ?? ''
  const page = Math.max(1, Number(params.page ?? 1))
  const from = (page - 1) * PAGE_SIZE

  const supabase = await createAdminClient()

  let query = supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (q) query = query.or(`full_name.ilike.%${q}%,stambuk.ilike.%${q}%,order_number.ilike.%${q}%,whatsapp.ilike.%${q}%`)
  if (statusFilter) query = query.eq('order_status', statusFilter)
  if (methodFilter) query = query.eq('fulfillment_method', methodFilter)

  const { data: orders, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const buildUrl = (newMethod?: string, newStatus?: string, newPage: number = 1) => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    const m = newMethod !== undefined ? newMethod : methodFilter
    if (m) p.set('method', m)
    const s = newStatus !== undefined ? newStatus : statusFilter
    if (s) p.set('status', s)
    if (newPage > 1) p.set('page', String(newPage))
    const str = p.toString()
    return `/admin/orders${str ? `?${str}` : ''}`
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">
            {count?.toLocaleString('id-ID')} total order{' '}
            {methodFilter ? `(${methodFilter === 'PICKUP' ? 'Ambil di Stand' : 'Kirim Alamat'})` : ''}
          </p>
        </div>
        <Link href="/admin/reports/export"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <Download className="w-4 h-4" />
          Export Excel
        </Link>
      </div>

      {/* Primary Fulfillment Method Tabs (Pickup vs Delivery) */}
      <div className="flex border-b border-gray-200">
        {[
          { id: '', label: 'Semua Metode', icon: Filter },
          { id: 'PICKUP', label: 'Ambil di Stand (Pickup)', icon: Package },
          { id: 'DELIVERY', label: 'Kirim ke Alamat (Delivery)', icon: Truck },
        ].map(tab => {
          const isActive = methodFilter === tab.id
          const Icon = tab.icon
          return (
            <Link
              key={tab.id}
              href={buildUrl(tab.id, undefined, 1)}
              className={`flex items-center gap-2 py-3 px-5 border-b-2 font-display font-bold text-sm transition-all ${
                isActive
                  ? 'border-green-600 text-green-800 bg-green-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-green-700' : 'text-gray-400'}`} />
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Filters (Search & Order Status Badges) */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <form className="w-full md:flex-1 md:min-w-48">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama, stambuk, nomor order..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </form>
        <div className="flex gap-2 flex-wrap flex-shrink-0 w-full md:w-auto">
          {['', 'PAYMENT_REVIEW', 'PAID', 'PROCESSING', 'READY_FOR_PICKUP', 'SHIPPED', 'COMPLETED'].map(s => (
            <Link key={s} href={buildUrl(undefined, s, 1)}
              className={`px-3 py-2 rounded-lg text-xs font-display font-semibold border transition-all ${
                statusFilter === s ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
              {s ? statusLabels[s] : 'Semua Status'}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative pb-16">
        <OrderTableClient orders={orders || []} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={buildUrl(undefined, undefined, page - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  <ChevronLeft className="w-3 h-3" /> Prev
                </Link>
              )}
              {page < totalPages && (
                <Link href={buildUrl(undefined, undefined, page + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  Next <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
