'use client'

import { useState, useRef } from 'react'
import { Printer, Download, X, Tag, Truck, QrCode, Copy, Check } from 'lucide-react'

interface ShippingLabelModalProps {
  order: any | null
  isOpen: boolean
  onClose: () => void
}

export default function ShippingLabelModal({ order, isOpen, onClose }: ShippingLabelModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !order) return null

  const orderNumber = order.order_number || 'MCH-2026-00000'
  const trackingUrl = `https://gontor-preorder-100th.vercel.app/admin/orders/${orderNumber}`
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(trackingUrl)}`

  // Format Address
  const fullAddress = order.shipping_address || 'Alamat tidak diisi'
  const recipientName = order.full_name || 'Pembeli'
  const phone = order.whatsapp || '-'
  const courier = order.shipping_courier || 'J&T Express / Ekspedisi'
  const items = Array.isArray(order.order_items) ? order.order_items : []

  // Direct Print Trigger
  const handlePrint = () => {
    window.print()
  }

  // Export SVG File for External Design Editors (Canva, Illustrator, Corel, Figma)
  const handleExportSVG = () => {
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 420" width="595" height="420" style="background-color: #ffffff; font-family: system-ui, -apple-system, sans-serif;">
  <!-- Border & Frame (A6 / Half A5 proportional: 595x420 px) -->
  <rect x="10" y="10" width="575" height="400" fill="#ffffff" stroke="#063D2E" stroke-width="4" rx="12" />
  
  <!-- Header Bar -->
  <rect x="10" y="10" width="575" height="55" fill="#063D2E" rx="8" />
  <text x="25" y="44" fill="#D4AF37" font-size="20" font-weight="bold">PANITIA 100 TAHUN GONTOR — REUNION KIT</text>
  <text x="560" y="44" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="end">${courier.toUpperCase()}</text>

  <!-- Sub Header Order No -->
  <rect x="20" y="75" width="555" height="35" fill="#F8F5ED" stroke="#D4AF37" stroke-width="1.5" rx="6" />
  <text x="35" y="98" fill="#063D2E" font-size="15" font-weight="bold">NO. RESI / ORDER: ${orderNumber}</text>
  <text x="560" y="98" fill="#555555" font-size="12" font-weight="bold" text-anchor="end">TGL: ${new Date(order.created_at || Date.now()).toLocaleDateString('id-ID')}</text>

  <!-- Recipient Section -->
  <rect x="20" y="120" width="370" height="175" fill="#ffffff" stroke="#e5e7eb" stroke-width="2" rx="8" />
  <text x="35" y="142" fill="#063D2E" font-size="13" font-weight="bold">PENERIMA (RECIPIENT):</text>
  <text x="35" y="165" fill="#111827" font-size="16" font-weight="bold">${recipientName} (Stambuk: ${order.stambuk || '-'})</text>
  <text x="35" y="185" fill="#166534" font-size="13" font-weight="bold">NO. HP/WA: ${phone}</text>
  
  <text x="35" y="210" fill="#374151" font-size="12" font-weight="normal">
    <tspan x="35" dy="0">${fullAddress.slice(0, 48)}</tspan>
    <tspan x="35" dy="18">${fullAddress.slice(48, 96)}</tspan>
    <tspan x="35" dy="18">${fullAddress.slice(96, 144)}</tspan>
  </text>

  <!-- QR Code Frame & Image -->
  <rect x="405" y="120" width="170" height="175" fill="#F8F5ED" stroke="#063D2E" stroke-width="2" rx="8" />
  <image href="${qrApiUrl}" x="420" y="130" width="140" height="140" />
  <text x="490" y="285" fill="#063D2E" font-size="10" font-weight="bold" text-anchor="middle">SCAN DETAIL ORDER</text>

  <!-- Sender Section -->
  <rect x="20" y="305" width="270" height="95" fill="#ffffff" stroke="#e5e7eb" stroke-width="1.5" rx="6" />
  <text x="30" y="325" fill="#063D2E" font-size="11" font-weight="bold">PENGIRIM (SENDER):</text>
  <text x="30" y="343" fill="#111827" font-size="12" font-weight="bold">Panitia 100 Tahun Gontor</text>
  <text x="30" y="360" fill="#4b5563" font-size="11">Pondok Modern Darussalam Gontor</text>
  <text x="30" y="375" fill="#4b5563" font-size="11">Ponorogo, Jawa Timur (63411)</text>

  <!-- Package Items Summary -->
  <rect x="300" y="305" width="275" height="95" fill="#ffffff" stroke="#e5e7eb" stroke-width="1.5" rx="6" />
  <text x="310" y="325" fill="#063D2E" font-size="11" font-weight="bold">ISI PAKET (ITEMS):</text>
  ${items.slice(0, 3).map((item: any, idx: number) => `
    <text x="310" y="${345 + idx * 16}" fill="#374151" font-size="11">• ${item.quantity || 1}x ${item.product_name || 'Merchandise'} (${item.variant_name || '-'})</text>
  `).join('')}
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
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
            padding: 10mm;
            box-shadow: none !important;
            border: 2px solid #063D2E !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-800">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
                Stiker Paket Pengiriman A6 (Setengah A5)
              </h3>
              <p className="text-xs text-gray-500">Siap cetak thermal sticker atau export file SVG ke platform desain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Sticker Canvas Preview */}
        <div className="p-5 sm:p-6 bg-gray-100 flex flex-col items-center justify-center">

          {/* Printable Shipping Sticker Card (Exact Half-A5 Proportional Container) */}
          <div
            id="printable-shipping-sticker"
            className="w-full max-w-lg bg-white border-2 border-green-900 rounded-2xl p-5 shadow-lg space-y-4 font-body relative overflow-hidden"
            style={{ borderColor: 'var(--gontor-green, #063D2E)' }}
          >
            {/* Header Sticker Bar */}
            <div className="p-3 rounded-xl text-white flex items-center justify-between" style={{ background: 'var(--gontor-green, #063D2E)' }}>
              <div>
                <p className="text-xs font-bold tracking-wider font-display" style={{ color: 'var(--gontor-gold, #D4AF37)' }}>
                  PANITIA 100 TAHUN GONTOR — REUNION KIT
                </p>
                <p className="text-[11px] text-gray-200">LABEL STIKER PENGIRIMAN PAKET</p>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white/20 text-white font-display font-bold text-xs">
                {courier.toUpperCase()}
              </div>
            </div>

            {/* Sub-Header Order & Date */}
            <div className="p-2.5 rounded-lg border border-amber-300 bg-amber-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900 font-display">NO. ORDER: {orderNumber}</span>
                <button onClick={copyOrderNo} className="text-gray-400 hover:text-gray-600">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-xs text-gray-600 font-semibold font-display">
                TGL: {new Date(order.created_at || Date.now()).toLocaleDateString('id-ID')}
              </span>
            </div>

            {/* Recipient & QR Code Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Recipient Information (2 Cols) */}
              <div className="col-span-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1.5">
                <p className="text-[11px] font-bold text-green-900 font-display uppercase tracking-wider">
                  PENERIMA (RECIPIENT):
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {recipientName} <span className="text-xs text-gray-500 font-normal">(Stambuk: {order.stambuk || '-'})</span>
                </p>
                <p className="text-xs font-bold text-green-700">
                  📞 HP / WA: {phone}
                </p>
                <div className="text-xs text-gray-700 leading-relaxed font-body pt-1 border-t border-gray-200">
                  <p className="font-semibold text-gray-900">📍 Alamat Lengkap:</p>
                  <p>{fullAddress}</p>
                </div>
              </div>

              {/* QR Code Canvas Frame (1 Col) */}
              <div className="col-span-1 p-2 rounded-xl border-2 border-green-900 bg-amber-50/40 flex flex-col items-center justify-center text-center space-y-1">
                {/* Dynamically generated SVG QR Code */}
                <img
                  src={qrApiUrl}
                  alt={`QR Code ${orderNumber}`}
                  className="w-28 h-28 object-contain rounded-lg border border-gray-200 bg-white p-1"
                />
                <span className="text-[10px] font-bold text-green-900 font-display flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-green-700" /> SCAN ORDER
                </span>
              </div>
            </div>

            {/* Sender & Package Items Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Sender Info */}
              <div className="p-3 rounded-xl border border-gray-200 bg-white space-y-0.5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-display">PENGIRIM (SENDER):</p>
                <p className="font-bold text-gray-900">Panitia 100 Tahun Gontor</p>
                <p className="text-gray-600 text-[11px]">Pondok Modern Darussalam Gontor</p>
                <p className="text-gray-500 text-[11px]">Ponorogo, Jawa Timur (63411)</p>
              </div>

              {/* Items List */}
              <div className="p-3 rounded-xl border border-gray-200 bg-white space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-display">ISI PAKET (ITEMS):</p>
                <ul className="space-y-0.5 text-[11px] text-gray-700">
                  {items.length > 0 ? (
                    items.map((it: any, i: number) => (
                      <li key={i} className="line-clamp-1">
                        • {it.quantity || 1}x {it.product_name || 'Merchandise'} ({it.variant_name || '-'})
                      </li>
                    ))
                  ) : (
                    <li>• Reunion Kit 100 Tahun Gontor</li>
                  )}
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-wrap gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-display font-semibold text-xs hover:bg-gray-50"
          >
            Tutup
          </button>

          <button
            onClick={handleExportSVG}
            className="flex-1 py-2.5 px-4 rounded-xl border border-green-800 text-green-900 bg-green-50 hover:bg-green-100 font-display font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-green-700" />
            Download File SVG (Visual Canva / Illustrator)
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-5 rounded-xl text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all"
            style={{ background: 'var(--gontor-green, #063D2E)' }}
          >
            <Printer className="w-4 h-4" style={{ color: 'var(--gontor-gold, #D4AF37)' }} />
            Print Stiker Paket (Thermal / A6)
          </button>
        </div>

      </div>
    </div>
  )
}
