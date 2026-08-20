'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, CreditCard,
  BarChart3, Settings, ScrollText, ChevronRight,
  PackageCheck, Shirt, Boxes, Receipt, FileDown,
  Users, Banknote, Truck, ShieldCheck
} from 'lucide-react'

const nav = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    children: [
      { label: 'Semua Order', href: '/admin/orders' },
      { label: 'Payment Review', href: '/admin/orders?status=PAYMENT_REVIEW' },
      { label: 'Paid', href: '/admin/orders?status=PAID' },
      { label: 'Processing', href: '/admin/orders?status=PROCESSING' },
      { label: 'Ready Pickup', href: '/admin/orders?status=READY_FOR_PICKUP' },
      { label: 'Shipped', href: '/admin/orders?status=SHIPPED' },
    ],
  },
  {
    label: 'Produk',
    icon: Shirt,
    children: [
      { label: 'Daftar Produk', href: '/admin/products' },
      { label: 'Paket Promo', href: '/admin/packages' },
      { label: 'Stok', href: '/admin/stock' },
    ],
  },
  {
    label: 'Pembayaran',
    href: '/admin/payments',
    icon: ShieldCheck,
  },
  {
    label: 'Laporan',
    icon: BarChart3,
    children: [
      { label: 'Penjualan', href: '/admin/reports' },
      { label: 'Fulfillment', href: '/admin/reports/fulfillment' },
      { label: 'Export Data', href: '/admin/reports/export' },
    ],
  },
  {
    label: 'Pengaturan',
    icon: Settings,
    children: [
      { label: 'Event & Pre-Order', href: '/admin/settings' },
      { label: 'Rekening Pembayaran', href: '/admin/settings/payment' },
      { label: 'Pengiriman', href: '/admin/settings/shipping' },
      { label: 'Admin Users', href: '/admin/settings/admins' },
    ],
  },
  {
    label: 'Audit Log',
    href: '/admin/audit-logs',
    icon: ScrollText,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col border-r border-gray-100 bg-white overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-white text-sm"
            style={{ background: 'linear-gradient(135deg, var(--gontor-green), var(--gontor-green-light))' }}>
            G
          </div>
          <div>
            <div className="font-display font-bold text-xs" style={{ color: 'var(--gontor-green)' }}>
              Gontor 100 Tahun
            </div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {nav.map(item => {
          const Icon = item.icon
          const isActive = item.href ? pathname === item.href : false

          if (!item.children) {
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, var(--gontor-green), var(--gontor-green-light))'
                } : {}}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          }

          // Group with children
          const isGroupActive = item.children.some(c => pathname.startsWith(c.href.split('?')[0]))
          return (
            <div key={item.label}>
              <div className={`flex items-center gap-2.5 px-3 py-2 text-xs font-display font-bold uppercase tracking-widest mt-3 mb-0.5 ${
                isGroupActive ? 'text-green-700' : 'text-gray-400'
              }`}>
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </div>
              {item.children.map(child => {
                const childActive = pathname === child.href.split('?')[0]
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ml-1 ${
                      childActive
                        ? 'text-green-700 bg-green-50'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    {child.label}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
