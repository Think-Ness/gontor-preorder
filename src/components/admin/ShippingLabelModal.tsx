'use client'

import { useState } from 'react'
import { Printer, Download, X, Tag, QrCode, Copy, Check } from 'lucide-react'

interface ShippingLabelModalProps {
  order: any | null
  isOpen: boolean
  onClose: () => void
}

export default function ShippingLabelModal({ order, isOpen, onClose }: ShippingLabelModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !order) return null

  const orderNumber = order.order_number || 'MCH-2026-00000'
  
  // Public Tracking Page URL for Buyers & Couriers
  const trackingUrl = `https://gontor-preorder-100th.vercel.app/track?order=${orderNumber}`
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingUrl)}`

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

  // Helper to split text into lines for SVG
  const wrapSvgText = (text: string, maxCharsPerLine = 50) => {
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

  // Export Clean Formal SVG File for Canva / Corel / Illustrator
  const handleExportSVG = () => {
    const addressLines = wrapSvgText(fullAddressText, 46)
    const addressTspans = addressLines.map((line, idx) => 
      `<tspan x="25" dy="${idx === 0 ? 0 : 16}">${line}</tspan>`
    ).join('')

    const formattedItemsSvg = items.length > 0
      ? items.slice(0, 5).map((item: any, idx: number) => {
          const qty = item.quantity || 1
          const name = item.product_name || 'Merchandise'
          const variant = item.variant_name ? ` (${item.variant_name})` : ''
          return `<text x="310" y="${345 + idx * 15}" fill="#111827" font-size="11" font-weight="600">• ${qty}x ${name}${variant}</text>`
        }).join('\n')
      : `<text x="310" y="345" fill="#111827" font-size="11" font-weight="600">• Merchandise Reunion Kit 100 Tahun Gontor</text>`

    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 440" width="595" height="440" style="background-color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <!-- Formal Shipping Sticker Outer Frame (A6 / Half-A5) -->
  <rect x="5" y="5" width="585" height="430" fill="#ffffff" stroke="#000000" stroke-width="3" rx="4" />
  
  <!-- Header Bar -->
  <rect x="5" y="5" width="585" height="50" fill="#063D2E" />
  <text x="20" y="36" fill="#D4AF37" font-size="18" font-weight="bold" letter-spacing="1">PANITIA 100 TAHUN GONTOR — REUNION KIT</text>
  <text x="575" y="36" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="end">${courier.toUpperCase()}</text>

  <!-- Resi / Order Number Row -->
  <rect x="15" y="65" width="565" height="35" fill="#f3f4f6" stroke="#000000" stroke-width="1.5" rx="3" />
  <text x="25" y="88" fill="#000000" font-size="14" font-weight="bold">NO. RESI / ORDER: ${orderNumber}</text>
  <text x="570" y="88" fill="#4b5563" font-size="12" font-weight="bold" text-anchor="end">TGL: ${new Date(order.created_at || Date.now()).toLocaleDateString('id-ID')}</text>

  <!-- Recipient Box -->
  <rect x="15" y="110" width="380" height="205" fill="#ffffff" stroke="#000000" stroke-width="1.5" rx="3" />
  <text x="25" y="130" fill="#063D2E" font-size="12" font-weight="bold">PENERIMA (RECIPIENT):</text>
  <text x="25" y="152" fill="#000000" font-size="15" font-weight="bold">${recipientName} (Stambuk: ${stambuk})</text>
  <text x="25" y="172" fill="#063D2E" font-size="13" font-weight="bold">NO. HP/WA: ${phone}</text>
  
  <text x="25" y="195" fill="#000000" font-size="11.5" font-weight="600">
    ${addressTspans}
  </text>

  <!-- Public Track QR Code Box -->
  <rect x="405" y="110" width="175" height="205" fill="#ffffff" stroke="#000000" stroke-width="1.5" rx="3" />
  <image href="${qrApiUrl}" x="418" y="125" width="150" height="150" />
  <text x="492" y="295" fill="#000000" font-size="10" font-weight="bold" text-anchor="middle">SCAN TRACK ORDER</text>

  <!-- Sender Box -->
  <rect x="15" y="325" width="275" height="100" fill="#ffffff" stroke="#000000" stroke-width="1.5" rx="3" />
  <text x="25" y="345" fill="#063D2E" font-size="11" font-weight="bold">PENGIRIM (SENDER):</text>
  <text x="25" y="364" fill="#000000" font-size="12" font-weight="bold">Panitia 100 Tahun Gontor</text>
  <text x="25" y="382" fill="#4b5563" font-size="11">Pondok Modern Darussalam Gontor</text>
  <text x="25" y="398" fill="#4b5563" font-size="11">Ponorogo, Jawa Timur (63411)</text>

  <!-- Package Items Box -->
  <rect x="300" y="325" width="280" height="100" fill="#ffffff" stroke="#000000" stroke-width="1.5" rx="3" />
  <text x="310" y="345" fill="#063D2E" font-size="11" font-weight="bold">ISI PAKET PESANAN (ITEMS):</text>
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
            width: 148mm;
            height: 105mm;
            margin: 0;
            padding: 6mm;
            box-shadow: none !important;
            border: 2px solid #000000 !important;
            border-radius: 0px !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-xl max-w-2xl w-full flex flex-col overflow-hidden shadow-2xl border border-gray-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-900 flex items-center justify-center text-amber-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-gray-900">
                Stiker Paket Pengiriman Resmi (A6 / Half A5)
              </h3>
              <p className="text-xs text-gray-500">Label cetak thermal sticker / Export SVG untuk Canva & Illustrator</p>
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

          {/* Formal Official Shipping Sticker Card */}
          <div
            id="printable-shipping-sticker"
            className="w-full max-w-lg bg-white border-2 border-black rounded-xs p-4 shadow-md space-y-3 font-sans relative overflow-hidden"
          >
            {/* Formal Header Bar */}
            <div className="p-2.5 rounded-xs text-white flex items-center justify-between" style={{ background: '#063D2E' }}>
              <div>
                <p className="text-xs font-bold tracking-wider font-display" style={{ color: '#D4AF37' }}>
                  PANITIA 100 TAHUN GONTOR — REUNION KIT
                </p>
                <p className="text-[10px] text-gray-200 uppercase font-semibold">LABEL STIKER RESMI PENGIRIMAN PAKET</p>
              </div>
              <div className="px-2 py-0.5 rounded-xs bg-white/20 text-white font-display font-bold text-xs uppercase">
                {courier}
              </div>
            </div>

            {/* Resi & Order Number Bar */}
            <div className="p-2 rounded-xs border border-black bg-gray-100 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <span>NO. RESI / ORDER: {orderNumber}</span>
                <button onClick={copyOrderNo} className="text-gray-500 hover:text-gray-700">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-gray-700 font-semibold font-sans">
                TGL: {new Date(order.created_at || Date.now()).toLocaleDateString('id-ID')}
              </span>
            </div>

            {/* Recipient & Public Track QR Code */}
            <div className="grid grid-cols-3 gap-2.5 items-stretch">
              {/* Recipient Info (Zero line truncation, full address display) */}
              <div className="col-span-2 p-3 rounded-xs border border-black bg-white space-y-1">
                <p className="text-[10px] font-bold text-green-900 font-display uppercase tracking-wider">
                  PENERIMA (RECIPIENT):
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {recipientName} <span className="text-xs text-gray-600 font-normal">(Stambuk: {stambuk})</span>
                </p>
                <p className="text-xs font-bold text-green-800">
                  📞 HP / WA: {phone}
                </p>
                <div className="text-xs text-gray-900 leading-normal font-sans pt-1 border-t border-gray-300">
                  <p className="font-semibold text-gray-900">📍 Alamat Pengiriman Lengkap:</p>
                  <p className="font-semibold text-gray-900 break-words pt-0.5">{fullAddressText}</p>
                </div>
              </div>

              {/* Public Track Order QR Code */}
              <div className="col-span-1 p-2 rounded-xs border border-black bg-white flex flex-col items-center justify-center text-center space-y-1">
                <img
                  src={qrApiUrl}
                  alt={`QR Track Order ${orderNumber}`}
                  className="w-28 h-28 object-contain p-0.5 border border-gray-200"
                />
                <span className="text-[9px] font-bold text-gray-900 font-display flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-green-800" /> SCAN TRACK ORDER
                </span>
              </div>
            </div>

            {/* Sender & Formatted Package Items */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {/* Sender Info */}
              <div className="p-2.5 rounded-xs border border-black bg-white space-y-0.5">
                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider font-display">PENGIRIM (SENDER):</p>
                <p className="font-bold text-gray-900">Panitia 100 Tahun Gontor</p>
                <p className="text-gray-700 text-[11px]">Pondok Modern Darussalam Gontor</p>
                <p className="text-gray-600 text-[11px]">Ponorogo, Jawa Timur (63411)</p>
              </div>

              {/* Package Items */}
              <div className="p-2.5 rounded-xs border border-black bg-white space-y-0.5">
                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider font-display">ISI PAKET PESANAN (ITEMS):</p>
                <ul className="space-y-0.5 text-[11px] text-gray-900 font-semibold">
                  {items.length > 0 ? (
                    items.map((it: any, i: number) => {
                      const qty = it.quantity || 1
                      const name = it.product_name || 'Merchandise'
                      const variant = it.variant_name ? ` (${it.variant_name})` : ''
                      return (
                        <li key={i} className="line-clamp-1">
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
            Download File SVG (Canva / Corel / Illustrator)
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-5 rounded-md text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all"
            style={{ background: '#063D2E' }}
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Print Stiker Paket (Thermal / A6)
          </button>
        </div>

      </div>
    </div>
  )
}
