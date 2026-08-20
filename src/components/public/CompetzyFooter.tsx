'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'

interface CompetzyFooterProps {
  faviconUrl?: string | null
  eventName?: string
}

export default function CompetzyFooter({ faviconUrl, eventName = 'Gontor 100 Tahun' }: CompetzyFooterProps) {
  return (
    <footer className="bg-[#0b1410] text-gray-400 pt-16 pb-12 border-t border-emerald-950">
      <div className="mx-auto max-w-[80rem] px-6 lg:px-10 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand Info (Cols 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              {faviconUrl ? (
                <img src={faviconUrl} alt="Logo" className="h-8 w-8 object-contain rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#5627ff] text-white font-black flex items-center justify-center text-xs">
                  G
                </div>
              )}
              <span className="font-display font-black text-lg text-white tracking-tight">
                {eventName}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-gray-400 font-body max-w-sm">
              Platform Pre-Order Resmi Official Merchandise Peringatan 100 Tahun Pondok Modern Darussalam Gontor. Reuni Akbar Alumni 19–20 September 2026.
            </p>

            <div className="pt-2 text-xs font-semibold text-emerald-400">
              #Gontor100Tahun #ReuniAkbar2026
            </div>
          </div>

          {/* Links Column 1: Katalog */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <div className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Katalog Official
            </div>
            <ul className="space-y-2">
              <li><a href="#catalog" className="hover:text-white transition-colors">Kaos Cotton 30s 100 Thn</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Varsity Jacket Reuni Akbar</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Peci Official Gontor</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Paket Bundling Hemat</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Aksesoris &amp; Pin Emas</a></li>
            </ul>
          </div>

          {/* Links Column 2: Layanan & Lacak */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <div className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Layanan Pesanan
            </div>
            <ul className="space-y-2">
              <li><Link href="/track" className="hover:text-white transition-colors flex items-center gap-1.5"><Search className="w-3.5 h-3.5 text-emerald-400" /> Lacak Order Saya</Link></li>
              <li><a href="#features" className="hover:text-white transition-colors">Opsi Pengiriman / Stand Pickup</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Verifikasi Bukti Transfer</a></li>
              <li><Link href="/admin/login" className="hover:text-white transition-colors">Portal Admin Panitia</Link></li>
            </ul>
          </div>

          {/* Links Column 3: Kontak & Media */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <div className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Media Alumni
            </div>
            <ul className="space-y-2">
              <li><a href="https://gontor.ac.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Website Official Gontor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Instagram @gontor100tahun</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ikatan Keluarga Besertai (IKPM)</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            &copy; 2026 Peringatan 100 Tahun Gontor. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-400">Privasi &amp; Keamanan</span>
            <span>&bull;</span>
            <span className="hover:text-gray-400">Syarat &amp; Ketentuan</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
