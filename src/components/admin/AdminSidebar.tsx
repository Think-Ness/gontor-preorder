'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Shirt, ShieldCheck,
  BarChart3, Settings, ScrollText, ChevronDown, ChevronRight,
  Package, Truck, CheckCircle2, Clock, FileSpreadsheet,
  Layers, Boxes, Tag, UserCheck, Shield
} from 'lucide-react'

interface NavGroup {
  label: string
  icon: any
  children?: Array<{ label: string; href: string; icon?: any }>
  href?: string
}

const nav: NavGroup[] = [
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
      { label: 'Ambil Stand (Pickup)', href: '/admin/orders?method=PICKUP', icon: Package },
      { label: 'Kirim Alamat (Delivery)', href: '/admin/orders?method=DELIVERY', icon: Truck },
      { label: 'Payment Review', href: '/admin/orders?status=PAYMENT_REVIEW', icon: Clock },
      { label: 'Processing', href: '/admin/orders?status=PROCESSING' },
      { label: 'Ready Pickup', href: '/admin/orders?status=READY_FOR_PICKUP' },
      { label: 'Shipped', href: '/admin/orders?status=SHIPPED' },
    ],
  },
  {
    label: 'Manajemen Pengiriman',
    href: '/admin/delivery',
    icon: Truck,
  },
  {
    label: 'Produk',
    icon: Shirt,
    children: [
      { label: 'Daftar Produk', href: '/admin/products' },
      { label: 'Paket Promo', href: '/admin/packages' },
      { label: 'Stok Barang', href: '/admin/stock' },
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
      { label: 'Export Excel', href: '/admin/reports/export', icon: FileSpreadsheet },
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

export default function AdminSidebar({ 
  isOpen = false, 
  onClose = () => {} 
}: { 
  isOpen?: boolean, 
  onClose?: () => void 
}) {
  const pathname = usePathname()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings/event')
      .then(res => res.json())
      .then(res => {
        if (res.data?.favicon_url) {
          setLogoUrl(res.data.favicon_url)
        }
      })
      .catch(() => {})
  }, [])

  // Track expanded accordion groups (only expand current active route by default)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    nav.forEach(group => {
      if (group.children) {
        const isGroupActive = group.children.some(c => pathname.startsWith(c.href.split('?')[0]))
        initial[group.label] = isGroupActive
      }
    })
    return initial
  })

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl md:shadow-sm overflow-y-auto
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo Gontor"
                className="w-9 h-9 object-contain rounded-xl bg-white p-1 border border-gray-200 shadow-2xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-white text-base shadow-sm"
                style={{ background: 'linear-gradient(135deg, var(--gontor-green), var(--gontor-green-light))' }}
              >
                G
              </div>
            )}
            <div>
              <div className="font-display font-bold text-sm text-gray-900 leading-tight">
                Gontor 100 Tahun
              </div>
              <div className="text-[11px] text-gray-400 font-medium">Admin Control Panel</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {nav.map(item => {
            const Icon = item.icon
            const isActive = item.href ? pathname === item.href : false

            // Single Link Item
            if (!item.children) {
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${
                    isActive
                      ? 'text-white shadow-md'
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

            // Accordion Group with Collapsible Children
            const isGroupActive = item.children.some(c => pathname.startsWith(c.href.split('?')[0]))
            const isOpenGroup = !!openGroups[item.label]

            return (
              <div key={item.label} className="space-y-0.5">
                {/* Group Header Button */}
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all ${
                    isGroupActive
                      ? 'text-green-800 bg-green-50/60'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isGroupActive ? 'text-green-700' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isOpenGroup ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                {/* Collapsible Children List */}
                {isOpenGroup && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-green-100 ml-5 my-1">
                    {item.children.map(child => {
                      const childActive = pathname === child.href.split('?')[0]
                      const ChildIcon = child.icon

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => onClose()}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                            childActive
                              ? 'text-green-800 bg-green-100/80 font-bold shadow-xs'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {ChildIcon ? (
                            <ChildIcon className="w-3.5 h-3.5 flex-shrink-0 text-green-700" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                          )}
                          <span className="truncate">{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
