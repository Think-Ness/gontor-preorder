import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import {
  ShoppingCart, CreditCard, CheckCircle, Loader2,
  Package, Truck, TrendingUp, AlertCircle, Users, GraduationCap
} from 'lucide-react'
import RealtimeOrderFeed from '@/components/admin/RealtimeOrderFeed'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard' }
export const revalidate = 0

async function getDashboardStats() {
  const supabase = await createAdminClient()

  const [
    { count: totalOrders },
    { count: alumniOrders },
    { count: umumOrders },
    { count: paymentReview },
    { count: paid },
    { count: processing },
    { count: readyPickup },
    { count: shipped },
    { data: revenueData },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('is_alumni', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('is_alumni', false),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'PAYMENT_REVIEW'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'PAID'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'PROCESSING'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'READY_FOR_PICKUP'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'SHIPPED'),
    supabase.from('orders').select('total_amount').eq('payment_status', 'PAID'),
    supabase.from('orders').select('order_number,full_name,total_amount,payment_status,order_status,created_at').order('created_at', { ascending: false }).limit(10),
  ])

  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0

  return {
    totalOrders: totalOrders ?? 0,
    alumniOrders: alumniOrders ?? 0,
    umumOrders: umumOrders ?? 0,
    paymentReview: paymentReview ?? 0,
    paid: paid ?? 0,
    processing: processing ?? 0,
    readyPickup: readyPickup ?? 0,
    shipped: shipped ?? 0,
    totalRevenue,
    recentOrders: recentOrders ?? []
  }
}

const statusColor: Record<string, string> = {
  PAYMENT_REVIEW: 'badge-review',
  PAID: 'badge-paid',
  PROCESSING: 'bg-blue-50 text-blue-700',
  READY_FOR_PICKUP: 'bg-purple-50 text-purple-700',
  SHIPPED: 'bg-indigo-50 text-indigo-700',
  COMPLETED: 'badge-paid',
  REJECTED: 'badge-rejected',
  CANCELLED: 'badge-unpaid',
  DRAFT: 'badge-unpaid',
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    { label: 'Total Order', value: stats.totalOrders.toLocaleString('id-ID'), icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', href: '/admin/orders' },
    { label: 'Payment Review', value: stats.paymentReview.toLocaleString('id-ID'), icon: AlertCircle, color: 'bg-amber-50 text-amber-600', href: '/admin/payments', urgent: stats.paymentReview > 0 },
    { label: 'Paid', value: stats.paid.toLocaleString('id-ID'), icon: CheckCircle, color: 'bg-green-50 text-green-600', href: '/admin/orders?status=PAID' },
    { label: 'Processing', value: stats.processing.toLocaleString('id-ID'), icon: Loader2, color: 'bg-purple-50 text-purple-600', href: '/admin/orders?status=PROCESSING' },
    { label: 'Ready Pickup', value: stats.readyPickup.toLocaleString('id-ID'), icon: Package, color: 'bg-orange-50 text-orange-600', href: '/admin/orders?status=READY_FOR_PICKUP' },
    { label: 'Shipped', value: stats.shipped.toLocaleString('id-ID'), icon: Truck, color: 'bg-cyan-50 text-cyan-600', href: '/admin/orders?status=SHIPPED' },
  ]

  const alumniPercent = stats.totalOrders > 0 ? Math.round((stats.alumniOrders / stats.totalOrders) * 100) : 0
  const umumPercent = stats.totalOrders > 0 ? 100 - alumniPercent : 0

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Reunion Kit 100 Tahun Gontor — Pre-Order Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Card */}
        <div className="lg:col-span-2 card-premium p-6 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, var(--gontor-green-dark), var(--gontor-green))' }}>
          <div>
            <p className="text-green-200 text-sm font-semibold mb-1">Total Pendapatan (Paid)</p>
            <p className="font-display font-black text-white text-3xl">{formatRupiah(stats.totalRevenue)}</p>
          </div>
          <TrendingUp className="w-12 h-12 text-white/20" />
        </div>

        {/* Demografi Pemesan */}
        <div className="card-premium p-5 border border-gray-100 flex flex-col justify-center">
          <div className="text-sm font-bold text-gray-700 mb-3 font-display">Demografi Pemesan</div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                  <GraduationCap className="w-3.5 h-3.5" /> Alumni
                </div>
                <div className="font-bold text-gray-900 text-sm">{stats.alumniOrders}</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${alumniPercent}%` }}></div>
              </div>

              <div className="flex justify-between items-end mb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <Users className="w-3.5 h-3.5" /> Umum
                </div>
                <div className="font-bold text-gray-900 text-sm">{stats.umumOrders}</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${umumPercent}%` }}></div>
              </div>
            </div>
            
            <div className="w-16 h-16 rounded-full border-4 border-gray-50 flex items-center justify-center bg-white shadow-sm flex-shrink-0">
              <div className="text-center">
                <div className="text-[10px] font-semibold text-gray-400">Total</div>
                <div className="text-sm font-bold text-gray-800 leading-none">{stats.totalOrders}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href}
              className={`card-premium p-5 flex items-center gap-4 hover:shadow-xl transition-all ${
                card.urgent ? 'ring-2 ring-amber-400 ring-offset-2' : ''
              }`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-black text-2xl text-gray-900">{card.value}</div>
                <div className="text-xs text-gray-500 font-semibold">{card.label}</div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900">Order Terbaru</h2>
            <Link href="/admin/orders" className="text-xs font-semibold" style={{ color: 'var(--gontor-green)' }}>
              Lihat semua →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.map((order: any) => (
              <Link key={order.order_number} href={`/admin/orders/${order.order_number}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-display font-bold text-sm text-gray-900">{order.order_number}</div>
                  <div className="text-xs text-gray-500">{order.full_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-gray-800">{formatRupiah(Number(order.total_amount))}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor[order.order_status] ?? 'badge-unpaid'}`}>
                    {order.order_status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            ))}
            {stats.recentOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">Belum ada order</div>
            )}
          </div>
        </div>

        {/* Realtime Feed */}
        <RealtimeOrderFeed />
      </div>
    </div>
  )
}
