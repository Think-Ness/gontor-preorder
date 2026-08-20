import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const params = await searchParams
  const q = params.q ?? ''
  const statusFilter = params.status ?? ''
  const page = Math.max(1, Number(params.page ?? 1))
  const from = (page - 1) * PAGE_SIZE

  const supabase = await createAdminClient()

  let query = supabase
    .from('orders')
    .select('order_number,full_name,stambuk,whatsapp,total_amount,fulfillment_method,payment_status,order_status,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (q) query = query.or(`full_name.ilike.%${q}%,stambuk.ilike.%${q}%,order_number.ilike.%${q}%,whatsapp.ilike.%${q}%`)
  if (statusFilter) query = query.eq('order_status', statusFilter)

  const { data: orders, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{count?.toLocaleString('id-ID')} total order</p>
        </div>
        <Link href="/admin/reports/export"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <Download className="w-4 h-4" />
          Export
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <form className="flex-1 min-w-48">
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
        <div className="flex gap-2 flex-wrap">
          {['', 'PAYMENT_REVIEW', 'PAID', 'PROCESSING', 'READY_FOR_PICKUP', 'SHIPPED'].map(s => (
            <Link key={s} href={`/admin/orders${s ? `?status=${s}` : ''}`}
              className={`px-3 py-2 rounded-lg text-xs font-display font-semibold border transition-all ${
                statusFilter === s ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
              {s ? statusLabels[s] : 'Semua'}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Order', 'Nama', 'WhatsApp', 'Total', 'Metode', 'Pembayaran', 'Status', 'Tanggal', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-display font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(orders ?? []).map((order: any) => (
                <tr key={order.order_number} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-display font-bold text-sm text-gray-900 whitespace-nowrap">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-800">{order.full_name}</div>
                    <div className="text-xs text-gray-500">{order.stambuk}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{order.whatsapp}</td>
                  <td className="px-4 py-3 font-semibold text-sm whitespace-nowrap" style={{ color: 'var(--gontor-green)' }}>
                    {formatRupiah(Number(order.total_amount))}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{order.fulfillment_method}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusCls[order.payment_status] ?? 'badge-unpaid'}`}>
                      {paymentLabels[order.payment_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusCls[order.order_status] ?? 'badge-unpaid'}`}>
                      {statusLabels[order.order_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.order_number}`}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-green-600">
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
              {(orders ?? []).length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-gray-400 text-sm">
                    Tidak ada order ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/orders?page=${page-1}${q?`&q=${q}`:''}${statusFilter?`&status=${statusFilter}`:''}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  <ChevronLeft className="w-3 h-3" /> Prev
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/orders?page=${page+1}${q?`&q=${q}`:''}${statusFilter?`&status=${statusFilter}`:''}`}
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
