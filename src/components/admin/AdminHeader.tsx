'use client'

import { User } from '@supabase/supabase-js'
import { LogOut, Bell, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props { 
  user: User
  onMenuClick?: () => void
}

export default function AdminHeader({ user, onMenuClick }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-gray-100 bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-sm text-gray-500 font-body">
          <span className="hidden sm:inline">Selamat datang, </span>
          <span className="font-semibold text-gray-700">{user.email}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  )
}
