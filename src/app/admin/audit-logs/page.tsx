import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { ScrollText, Search, User } from 'lucide-react'

export const metadata: Metadata = { title: 'Audit Log' }
export const revalidate = 0

export default async function AuditLogsPage() {
  const supabase = await createAdminClient()
  
  // Join with admin_profiles for the admin name
  const { data: logs } = await supabase
    .from('audit_logs')
    .select(`
      *,
      admin_profiles(full_name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Audit Log</h1>
        <p className="text-gray-500 text-sm">Riwayat aktivitas admin (100 log terakhir)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              placeholder="Cari log..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {(logs ?? []).map((log: any) => (
            <div key={log.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ScrollText className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-bold text-sm text-gray-900">
                    {log.action}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono">
                    {log.entity_type} {log.entity_id ? `(${log.entity_id.split('-')[0]})` : ''}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1 font-semibold">
                    <User className="w-3.5 h-3.5" />
                    {log.admin_profiles?.full_name ?? 'System'}
                  </span>
                  <span>•</span>
                  <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          ))}

          {(logs ?? []).length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-display font-semibold">Belum ada audit log</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
