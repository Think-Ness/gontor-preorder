'use client'

import { Printer } from 'lucide-react'

export default function PrintDeliveryClientControls() {
  return (
    <div className="print:hidden fixed top-6 right-6 z-50 flex gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 items-center animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="text-sm font-bold text-gray-500 mr-2 flex flex-col items-end">
        <span className="text-gray-900">Siap Cetak?</span>
        <span className="text-xs font-normal">Pastikan kertas A5 Lanskap</span>
      </div>
      <button 
        onClick={() => window.print()}
        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-green-600 via-green-700 to-green-900 hover:from-green-500 hover:via-green-600 hover:to-green-800 text-white rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all transform hover:scale-105 active:scale-95 group relative overflow-hidden"
      >
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
        
        <Printer className="w-6 h-6 relative z-10 text-amber-400" />
        <span className="relative z-10">CETAK SEKARANG</span>
      </button>
    </div>
  )
}
