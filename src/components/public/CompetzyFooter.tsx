'use client'

import Link from 'next/link'
import { Search, MessageCircle, Globe, Users, ArrowRight, ShieldCheck, Truck } from 'lucide-react'

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

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

  // Parse hashtags
  const hashtagList = footerHashtags
    ? footerHashtags
        .split(/[\s,]+/)
        .map(h => h.trim())
        .filter(Boolean)
        .map(h => (h.startsWith('#') ? h : `#${h}`))
    : ['#100TahunGontor', '#officialMerchandise', '#ReuniAkbar']

  const waLink = contactWhatsapp
    ? `https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}`
    : null

  const igLink = socialInstagram
    ? `https://instagram.com/${socialInstagram.replace(/^@/, '')}`
    : 'https://instagram.com/pondok.modern.gontor'

  const igHandle = socialInstagram || '@pondok.modern.gontor'

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

            {/* Social Icon Quick Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={igLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 hover:bg-pink-600 hover:text-white transition-all"
                title={`Instagram ${igHandle}`}
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://gontor.ac.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 hover:bg-[#063D2E] hover:text-white transition-all"
                title="Website Resmi Gontor"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://ikpm.gontor.ac.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 hover:bg-emerald-700 hover:text-white transition-all"
                title="Website IKPM Gontor"
              >
                <Users className="w-4 h-4" />
              </a>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
                  title="WhatsApp Panitia"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Links Column 1: Katalog Official (Top Produk) */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <div className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Katalog Official
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link href="/order" className="hover:text-white transition-colors">
                  Paket Bundling 100 Tahun
                </Link>
              </li>
              <li>
                <Link href="/order" className="hover:text-white transition-colors">
                  Kaos Official 1 Abad Gontor
                </Link>
              </li>
              <li>
                <Link href="/order" className="hover:text-white transition-colors">
                  Jaket Varsity Reuni Akbar
                </Link>
              </li>
              <li>
                <Link href="/order" className="hover:text-white transition-colors">
                  Peci &amp; Aksesoris Official
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/order" className="inline-flex items-center gap-1.5 text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                  <span>Lihat Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Layanan Pesanan */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <div className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Layanan Pesanan
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link href="/track" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Lacak Order Saya</span>
                </Link>
              </li>
              <li>
                <a href="#flow" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Cara &amp; Alur Pemesanan</span>
                </a>
              </li>
              <li>
                <Link href="/order" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Pengiriman &amp; Pickup</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Media & Kontak */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <div className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Media &amp; Kontak
            </div>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://gontor.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Website Resmi Gontor</span>
                </a>
              </li>
              <li>
                <a
                  href="https://ikpm.gontor.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Website IKPM Gontor</span>
                </a>
              </li>
              <li>
                <a
                  href={igLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Instagram {igHandle}</span>
                </a>
              </li>
              {waLink && (
                <li>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>WhatsApp Panitia</span>
                  </a>
                </li>
              )}
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
