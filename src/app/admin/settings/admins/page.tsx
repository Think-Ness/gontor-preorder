import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { Users, Shield, CheckCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin Users' }
export const revalidate = 0

export default async function AdminUsersPage() {
  const supabase = await createAdminClient()

  const { data: admins } = await supabase
    .from('admin_profiles')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Daftar Admin & Panitia</h1>
        <p className="text-gray-500 text-sm">Daftar akun pengelola sistem preorder Gontor 100 Tahun</p>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-700" />
            <h2 className="font-display font-bold text-sm text-gray-900">Akun Terdaftar ({admins?.length ?? 0})</h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {(admins ?? []).map(admin => (
            <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-800 font-display font-bold flex items-center justify-center text-sm">
                  {admin.full_name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-gray-900">{admin.full_name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-display font-bold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                  {admin.role || 'SUPER_ADMIN'}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  Aktif
                </span>
              </div>
            </div>
          ))}

          {(admins ?? []).length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Belum ada data admin_profiles terdaftar.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
