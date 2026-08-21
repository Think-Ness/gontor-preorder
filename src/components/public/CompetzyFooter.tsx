'use client'

import Link from 'next/link'
import { Search, Camera, MessageCircle, Globe } from 'lucide-react'

interface CompetzyFooterProps {
  faviconUrl?: string | null
  eventName?: string
  footerTagline?: string | null
  footerHashtags?: string | null
  contactWhatsapp?: string | null
  socialInstagram?: string | null
}

export default function CompetzyFooter({
  faviconUrl,
  eventName = 'Gontor 100 Tahun',
  footerTagline,
  footerHashtags,
  contactWhatsapp,
  socialInstagram,
}: CompetzyFooterProps) {
  const tagline = footerTagline ||
    'Platform Pre-Order Resmi Official Merchandise Peringatan 100 Tahun Pondok Modern Darussalam Gontor. Reuni Akbar Alumni 19–20 September 2026.'

  // Parse hashtags: support both space-separated and comma-separated
  const hashtagList = footerHashtags
    ? footerHashtags
        .split(/[\s,]+/)
        .map(h => h.trim())
        .filter(Boolean)
        .map(h => (h.startsWith('#') ? h : `#${h}`))
    : ['#Gontor100Tahun', '#ReuniAkbar2026']

  const waLink = contactWhatsapp
    ? `https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}`
    : null

  const igLink = socialInstagram
    ? `https://instagram.com/${socialInstagram.replace(/^@/, '')}`
    : null

  const igHandle = socialInstagram || '@gontor_official'

  return (
    <footer className="bg-[#0b1410] text-gray-400 pt-16 pb-12 border-t border-emerald-950">
      <div className="mx-auto max-w-[80rem] px-6 lg:px-10 space-y-12">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Brand Info (Cols 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              {faviconUrl ? (
                <img src={faviconUrl} alt="Logo" className="h-9 w-auto object-contain" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-[#063D2E] text-white font-black flex items-center justify-center text-xs">
                  G
                </div>
              )}
              <span className="font-display font-black text-lg text-white tracking-tight">
                {eventName}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-gray-400 font-body max-w-sm">
              {tagline}
            </p>

            {/* Hashtags */}
            <div className="pt-1 flex flex-wrap gap-2">
              {hashtagList.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 hover:bg-emerald-700 hover:text-white transition-all"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {igLink && (
                <a
                  href={igLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 hover:bg-pink-600 hover:text-white transition-all"
                  title={igHandle}
                >
                  <Camera className="w-4 h-4" />
                </a>
              )}
              <a
                href="https://gontor.ac.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 hover:bg-[#063D2E] hover:text-white transition-all"
                title="Website Gontor"
              >
                <Globe className="w-4 h-4" />
              </a>
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

          {/* Links Column 2: Layanan */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <div className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Layanan Pesanan
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/track" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-emerald-400" /> Lacak Order Saya
                </Link>
              </li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Opsi Pengiriman / Stand Pickup</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Verifikasi Bukti Transfer</a></li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors">
                  Portal Admin Panitia
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Kontak */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <div className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Media &amp; Kontak
            </div>
            <ul className="space-y-2">
              <li>
                <a href="https://gontor.ac.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Website Resmi Gontor
                </a>
              </li>
              {igLink && (
                <li>
                  <a href={igLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Instagram {igHandle}
                  </a>
                </li>
              )}
              {waLink && (
                <li>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    WhatsApp Panitia
                  </a>
                </li>
              )}
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Ikatan Alumni (IKPM)
                </a>
              </li>
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
