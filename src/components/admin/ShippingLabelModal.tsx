'use client'

import { useState, useEffect } from 'react'
import { Printer, Download, X, Tag, Copy, Check } from 'lucide-react'

interface ShippingLabelModalProps {
  order: any | null
  isOpen: boolean
  onClose: () => void
}

export default function ShippingLabelModal({ order, isOpen, onClose }: ShippingLabelModalProps) {
  const [copied, setCopied] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings/event')
      .then(res => res.json())
      .then(res => {
        if (res.data?.favicon_url) setLogoUrl(res.data.favicon_url)
      })
      .catch(() => {})
  }, [])

  if (!isOpen || !order) return null

  const orderNumber = order.order_number || 'MCH-2026-00000'
  
  // Public Tracking Page URL for Buyers & Couriers
  const trackingUrl = `https://gontor-preorder-100th.vercel.app/track?order=${orderNumber}`
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingUrl)}`

  // Build Complete Recipient Address
  const recipientName = order.full_name || 'Pembeli'
  const phone = order.whatsapp || '-'
  const stambuk = order.stambuk || '-'
  const courier = order.shipping_courier || 'J&T Express / Ekspedisi'

  const addressParts = [
    order.shipping_address || order.full_address || order.address?.fullAddress,
    order.shipping_village && `Desa/Kel. ${order.shipping_village}`,
    order.shipping_district && `Kec. ${order.shipping_district}`,
    order.shipping_city,
    order.shipping_province,
    order.shipping_postal_code && `Kode Pos ${order.shipping_postal_code}`,
  ].filter(Boolean)

  const fullAddressText = addressParts.length > 0
    ? addressParts.join(', ')
    : 'Alamat tidak diisi'

  // Extract Order Items
  const items = Array.isArray(order.order_items) && order.order_items.length > 0
    ? order.order_items
    : (Array.isArray(order.items) && order.items.length > 0 ? order.items : [])

  // Print Action
  const handlePrint = () => {
    window.print()
  }

  // 2. Clean up Address
  // The database saves shipping_address with [Kurir: ...] and [Map Pin: ...] appended.
  // We want to strip those out for the sticker.
  const cleanAddressText = fullAddressText
    .replace(/\[Kurir:.*?\]/gi, '')
    .replace(/\[Map Pin:.*?\]/gi, '')
    .trim()

  // Helper to split text into lines for SVG
  const wrapSvgText = (text: string, maxCharsPerLine = 75) => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine) lines.push(currentLine)
    return lines
  }

  // XML escape helper
  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;'
        case '>': return '&gt;'
        case '&': return '&amp;'
        case '\'': return '&apos;'
        case '"': return '&quot;'
        default: return c
      }
    })
  }

  // Export Clean Formal SVG File for Canva / Corel / Illustrator (A5 Landscape Format)
  const handleExportSVG = () => {
    const addressLines = wrapSvgText(cleanAddressText, 75)
    const addressTspans = addressLines.map((line, idx) => 
      `<tspan x="25" dy="${idx === 0 ? 0 : 18}">${escapeXml(line)}</tspan>`
    ).join('')

    const formattedItemsSvg = items.length > 0
      ? items.slice(0, 10).map((item: any, idx: number) => {
          const qty = item.quantity || 1
          const name = item.item_name_snapshot || item.product_name || 'Merchandise'
          const variant = item.variant_name_snapshot || item.variant_name ? ` (${item.variant_name_snapshot || item.variant_name})` : ''
          return `<text x="560" y="${280 + idx * 18}" fill="#111827" font-size="12" font-weight="600">&#x2022; ${qty}x ${escapeXml(name)}${escapeXml(variant)}</text>`
        }).join('\n')
      : `<text x="560" y="280" fill="#111827" font-size="12" font-weight="600">&#x2022; Merchandise Reunion Kit 100 Tahun Gontor</text>`

    // A5 Landscape Dimensions: 842 x 595
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 842 595" width="842" height="595" style="background-color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <!-- Formal Shipping Sticker Outer Frame (A5 Landscape) -->
  <rect x="10" y="10" width="822" height="575" fill="#ffffff" stroke="#000000" stroke-width="4" rx="6" />
  
  <!-- Header Bar -->
  <rect x="10" y="10" width="822" height="60" fill="#063D2E" rx="4" />
  <text x="25" y="45" fill="#D4AF37" font-size="22" font-weight="bold" letter-spacing="1">PANITIA 100 TAHUN GONTOR &#x2014; REUNION KIT</text>
  <text x="815" y="45" fill="#ffffff" font-size="16" font-weight="bold" letter-spacing="2" text-anchor="end">LABEL STIKER RESMI PENGIRIMAN PAKET</text>

  <!-- Resi / Order Number Row & Courier -->
  <rect x="20" y="85" width="802" height="45" fill="#f3f4f6" stroke="#000000" stroke-width="2" rx="4" />
  <text x="30" y="113" fill="#000000" font-size="16" font-weight="bold">NO. RESI / ORDER: ${escapeXml(orderNumber)}</text>
  <text x="400" y="113" fill="#063D2E" font-size="16" font-weight="bold" text-anchor="middle">${escapeXml(courier.toUpperCase())}</text>
  <text x="805" y="113" fill="#4b5563" font-size="14" font-weight="bold" text-anchor="end">TGL: ${new Date(order.created_at || Date.now()).toLocaleDateString('id-ID')}</text>

  <!-- Left Column: Recipient Box (Width 520) -->
  <rect x="20" y="145" width="520" height="425" fill="#ffffff" stroke="#000000" stroke-width="2" rx="4" />
  <text x="30" y="170" fill="#063D2E" font-size="14" font-weight="bold">PENERIMA (RECIPIENT):</text>
  <text x="30" y="195" fill="#000000" font-size="18" font-weight="bold">${escapeXml(recipientName)}</text>
  <text x="30" y="215" fill="#4b5563" font-size="14">(Stambuk: ${escapeXml(stambuk)})</text>
  <text x="30" y="240" fill="#063D2E" font-size="15" font-weight="bold">NO. HP/WA: ${escapeXml(phone)}</text>
  
  <line x1="20" y1="260" x2="540" y2="260" stroke="#e5e7eb" stroke-width="2" />
  
  <text x="30" y="285" fill="#000000" font-size="14" font-weight="bold">&#x1F4CD; Alamat Pengiriman Lengkap:</text>
  <text x="30" y="315" fill="#000000" font-size="15" font-weight="600">
    ${addressTspans}
  </text>

  <!-- Small Public Track QR Code (Top Right of Recipient Box) -->
  <image href="${escapeXml(qrApiUrl)}" x="445" y="155" width="85" height="85" />
  <text x="487" y="250" fill="#000000" font-size="9" font-weight="bold" text-anchor="middle">SCAN TRACK</text>
  <line x1="435" y1="145" x2="435" y2="260" stroke="#e5e7eb" stroke-width="2" />

  <!-- Right Column: Sender Box (Width 272) -->
  <rect x="550" y="145" width="272" height="85" fill="#ffffff" stroke="#000000" stroke-width="2" rx="4" />
  <text x="560" y="165" fill="#063D2E" font-size="12" font-weight="bold">PENGIRIM (SENDER):</text>
  <text x="560" y="185" fill="#000000" font-size="15" font-weight="bold">Panitia 100 Tahun Gontor</text>
  <text x="560" y="205" fill="#4b5563" font-size="12">Pondok Modern Darussalam Gontor</text>
  <text x="560" y="220" fill="#4b5563" font-size="12">Ponorogo, Jawa Timur (63411)</text>

  <!-- Right Column: Package Items Box (Width 272) -->
  <rect x="550" y="240" width="272" height="330" fill="#ffffff" stroke="#000000" stroke-width="2" rx="4" />
  <text x="560" y="260" fill="#063D2E" font-size="13" font-weight="bold">ISI PAKET PESANAN (ITEMS):</text>
  ${formattedItemsSvg}
</svg>
    `.trim()

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Stiker-Pengiriman-${orderNumber}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const copyOrderNo = () => {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-shipping-sticker, #printable-shipping-sticker * {
            visibility: visible;
          }
          #printable-shipping-sticker {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 148mm;
            margin: 0;
            padding: 8mm;
            box-shadow: none !important;
            border: 2px solid #000000 !important;
            border-radius: 0px !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-xl max-w-4xl w-full flex flex-col overflow-hidden shadow-2xl border border-gray-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-900 flex items-center justify-center text-amber-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-gray-900">
                Stiker Paket Pengiriman Resmi (A5 Landscape)
              </h3>
              <p className="text-xs text-gray-500">Label cetak thermal A5 / Export SVG untuk Canva & Illustrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Sticker Canvas Preview */}
        <div className="p-5 bg-gray-200 flex flex-col items-center justify-center">

          {/* Formal Official Shipping Sticker Card (A5 Landscape Proportion) */}
          <div
            id="printable-shipping-sticker"
            className="w-full max-w-3xl bg-white border-2 border-black rounded-xs p-4 shadow-md flex flex-col gap-3 font-sans relative overflow-hidden"
            style={{ aspectRatio: '1.414 / 1' }} // A5 Landscape Aspect Ratio
          >
            {/* Formal Header Bar */}
            <div className="p-3 rounded-xs text-white flex items-center justify-between" style={{ background: '#063D2E' }}>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-8 w-auto max-w-[90px] object-contain shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded bg-emerald-800 flex items-center justify-center font-bold text-white text-xs">
                    G
                  </div>
                )}
                <p className="text-lg sm:text-xl font-bold tracking-wider font-display" style={{ color: '#D4AF37' }}>
                  PANITIA 100 TAHUN GONTOR — REUNION KIT
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-200 uppercase font-semibold">LABEL STIKER RESMI PENGIRIMAN PAKET</p>
            </div>

            {/* Resi & Order Number Bar */}
            <div className="p-3 rounded-xs border-2 border-black bg-gray-100 flex items-center justify-between font-mono text-sm">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <span>NO. RESI / ORDER: {orderNumber}</span>
                <button onClick={copyOrderNo} className="text-gray-500 hover:text-gray-700 print:hidden">
                  {copied ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="px-3 py-0.5 rounded-sm bg-green-900 text-amber-400 font-display font-bold text-sm uppercase">
                {courier}
              </div>
              <span className="text-gray-700 font-semibold font-sans">
                TGL: {new Date(order.created_at || Date.now()).toLocaleDateString('id-ID')}
              </span>
            </div>

            {/* Main Content: 2 Columns */}
            <div className="flex gap-3 flex-1 min-h-0">
              
              {/* Left Column: Recipient (Takes more width, use min-w-0 to prevent flex blowout) */}
              <div className="w-2/3 min-w-0 border-2 border-black rounded-xs bg-white flex flex-col overflow-hidden">
                <div className="flex items-stretch border-b border-gray-300">
                  <div className="flex-1 min-w-0 p-3 flex flex-col gap-1.5">
                    <p className="text-[11px] font-bold text-green-900 font-display uppercase tracking-wider">
                      PENERIMA (RECIPIENT):
                    </p>
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {recipientName} <span className="text-sm text-gray-600 font-normal">(Stambuk: {stambuk})</span>
                    </p>
                    <p className="text-base font-bold text-green-800">
                      HP / WA: {phone}
                    </p>
                  </div>
                  {/* Small QR Code Container */}
                  <div className="w-24 shrink-0 border-l border-gray-300 p-2 flex flex-col items-center justify-center text-center gap-1 bg-gray-50">
                    <img
                      src={qrApiUrl}
                      alt="QR Code"
                      className="w-14 h-14 object-contain p-0.5 border border-gray-200 bg-white"
                    />
                    <span className="text-[7px] font-bold text-gray-900 font-display leading-tight">
                      SCAN TRACK ORDER
                    </span>
                  </div>
                </div>
                <div className="p-3 flex-1 min-h-0 overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Alamat Pengiriman Lengkap:</p>
                  <p className="font-bold text-gray-900 text-base leading-snug whitespace-pre-wrap break-words">{cleanAddressText}</p>
                </div>
              </div>

              {/* Right Column: Sender & Items */}
              <div className="w-1/3 min-w-0 flex flex-col gap-3">
                {/* Sender Box */}
                <div className="p-3 rounded-xs border-2 border-black bg-white flex flex-col gap-0.5 shrink-0">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider font-display">PENGIRIM (SENDER):</p>
                  <p className="font-bold text-gray-900 text-sm truncate">Panitia 100 Tahun Gontor</p>
                  <p className="text-gray-700 text-xs leading-tight">Pondok Modern Darussalam Gontor, Ponorogo, Jawa Timur (63411)</p>
                </div>

                {/* Package Items */}
                <div className="flex-1 min-h-0 p-3 rounded-xs border-2 border-black bg-white flex flex-col overflow-hidden">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider font-display mb-1.5 shrink-0">ISI PAKET (ITEMS):</p>
                  <ul className="space-y-1 text-sm text-gray-900 font-semibold border-t border-gray-200 pt-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {items.length > 0 ? (
                      items.map((it: any, i: number) => {
                        const qty = it.quantity || 1
                        const name = it.item_name_snapshot || it.product_name || 'Merchandise'
                        const variant = it.variant_name_snapshot || it.variant_name ? ` (${it.variant_name_snapshot || it.variant_name})` : ''
                        return (
                          <li key={i} className="leading-tight break-words">
                            • {qty}x {name}{variant}
                          </li>
                        )
                      })
                    ) : (
                      <li>• Merchandise Reunion Kit 100 Tahun Gontor</li>
                    )}
                  </ul>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex flex-wrap gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-md border border-gray-300 text-gray-700 font-display font-semibold text-xs hover:bg-gray-100"
          >
            Tutup
          </button>

          <button
            onClick={handleExportSVG}
            className="flex-1 py-2.5 px-4 rounded-md border border-green-800 text-green-950 bg-green-50 hover:bg-green-100 font-display font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-green-800" />
            Download File SVG
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-5 rounded-md text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all"
            style={{ background: '#063D2E' }}
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Print Stiker (A5 Landscape)
          </button>
        </div>

      </div>
    </div>
  )
}
