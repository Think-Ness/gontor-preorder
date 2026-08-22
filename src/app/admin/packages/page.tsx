import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'
import { buildDriveImageUrl } from '@/lib/drive-urls'
import { Plus, Edit, PackageIcon, Image as ImageIcon } from 'lucide-react'
export const metadata: Metadata = { title: 'Paket Promo' }
export const revalidate = 0

export default async function PackagesPage() {
  const supabase = await createAdminClient()
  const { data: packages } = await supabase
    .from('packages')
    .select('*, items:package_items(count)')
    .order('display_order')

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-gray-900">Paket Promo</h1>
          <p className="text-gray-500 text-xs sm:text-sm">{packages?.length ?? 0}/5 paket</p>
        </div>
        <Link href="/admin/packages/new" className="btn-primary flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 text-xs sm:text-sm w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Tambah Paket
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(packages ?? []).map((pkg: any) => (
          <div key={pkg.id} className="card-premium p-5 flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              {pkg.image_drive_file_id ? (
                <img src={buildDriveImageUrl(pkg.image_drive_file_id)}
                  alt={pkg.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <PackageIcon className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-gray-900">{pkg.name}</div>
              <div className="text-xs font-mono text-gray-400 mt-0.5">{pkg.package_code}</div>
              <div className="font-bold mt-1" style={{ color: 'var(--gontor-green)' }}>
                {formatRupiah(Number(pkg.price))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {!pkg.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500">Nonaktif</span>}
                <Link href={`/admin/packages/${pkg.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700">
                  <Edit className="w-3 h-3" />
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
        {(packages ?? []).length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-400">
            <PackageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-display font-semibold mb-4">Belum ada paket</p>
            <Link href="/admin/packages/new" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              <Plus className="w-4 h-4" />
              Tambah Paket Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
