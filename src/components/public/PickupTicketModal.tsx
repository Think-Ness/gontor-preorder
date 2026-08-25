'use client'

import { useState, useEffect } from 'react'
import { Ticket, X, Download, Printer, Check, Copy, Store, MapPin, Sparkles, Truck } from 'lucide-react'
import type { Order } from '@/types'

interface PickupTicketModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export default function PickupTicketModal({ order, isOpen, onClose }: PickupTicketModalProps) {
  const [copied, setCopied] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings/event')
      .then(res => res.json())
      .then(res => {
        if (res.data?.favicon_url) setLogoUrl(res.data.favicon_url)
      })
      .catch(() => {})
  }, [])

  if (!isOpen || !order) return null

  const isDelivery = order.fulfillment_method === 'DELIVERY'
  const orderNumber = order.order_number
  const recipientName = order.full_name || 'Pembeli'
  const stambuk = order.stambuk || '-'
  const phone = order.whatsapp || '-'

  const fullShippingAddress = [
    order.shipping_address,
    order.shipping_village,
    order.shipping_district,
    order.shipping_city,
    order.shipping_province,
    order.shipping_postal_code
  ].filter(Boolean).join(', ')

  // Verification QR Code Link
  const trackingUrl = `https://gontor-preorder-100th.vercel.app/track?order=${orderNumber}`
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingUrl)}`

  const items = Array.isArray(order.order_items) && order.order_items.length > 0
    ? order.order_items
    : (Array.isArray(order.items) && order.items.length > 0 ? order.items : [])

  const copyOrderNo = () => {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const escapeXml = (unsafe: string) => {
    if (!unsafe) return ''
    return String(unsafe).replace(/[<>&'"]/g, (c) => {
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

  const getBase64Image = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => resolve(url)
        reader.readAsDataURL(blob)
      })
    } catch {
      return url
    }
  }

  const generateTicketSVG = (qrImageHref: string, logoImageHref?: string | null) => {
    const escOrderNo = escapeXml(orderNumber)
    const escName = escapeXml(recipientName)
    const escStambuk = escapeXml(stambuk)
    const escPhone = escapeXml(phone)
    const escAddress = escapeXml(fullShippingAddress || 'Dikirim ke alamat pemesan')

    const formattedItemsSvg = items.length > 0
      ? items.slice(0, 10).map((item: any, idx: number) => {
          const qty = item.quantity || 1
          const rawName = item.name || item.item_name_snapshot || item.product_name || 'Merchandise'
          const variantVal = item.variantName || item.variant_name_snapshot || item.variant_name
          const rawVariant = variantVal ? ` (${variantVal})` : ''
          const itemText = escapeXml(`• ${qty}x ${rawName}${rawVariant}`)
          return `<text x="50" y="${300 + idx * 24}" fill="#111827" font-size="13" font-weight="600">${itemText}</text>`
        }).join('\n')
      : `<text x="50" y="300" fill="#111827" font-size="13" font-weight="600">&#x2022; Merchandise Reunion Kit 100 Tahun Gontor</text>`

    const logoSvgTag = logoImageHref
      ? `<image href="${logoImageHref}" x="480" y="25" width="80" height="60" preserveAspectRatio="xMidYMid meet" />`
      : ''

    const addressWords = (fullShippingAddress || 'Dikirim ke alamat pemesan').split(' ')
    const addressLines: string[] = []
    let currentLine = ''
    addressWords.forEach(word => {
      if ((currentLine + ' ' + word).length <= 52) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        addressLines.push(currentLine)
        currentLine = word
      }
    })
    if (currentLine) addressLines.push(currentLine)

    const headerTitle = isDelivery ? 'E-RECEIPT RESMI PEMESANAN' : 'TIKET RESMI PENGAMBILAN STAND'
    const methodLabel = isDelivery ? 'Metode: Kirim ke Alamat' : 'Metode: Ambil di Stand'
    const bottomBoxTitle = isDelivery ? '&#x1F4CD; ALAMAT PENGIRIMAN TUJUAN:' : '&#x1F4CD; LOKASI PENGAMBILAN:'
    const bottomLine1 = isDelivery ? (addressLines[0] || '') : 'Stand Bazar Resmi Panitia 100 Tahun Gontor'
    const bottomLine2 = isDelivery ? (addressLines.slice(1).join(' ') || '') : 'Pondok Modern Darussalam Gontor, Ponorogo'

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750" style="background-color: #ffffff; font-family: Arial, sans-serif;">
  <rect x="15" y="15" width="570" height="720" fill="#ffffff" stroke="#063D2E" stroke-width="4" rx="16" />
  
  <rect x="15" y="15" width="570" height="85" fill="#063D2E" rx="14" />
  <text x="35" y="52" fill="#D4AF37" font-size="18" font-weight="bold" letter-spacing="1">${headerTitle}</text>
  <text x="35" y="75" fill="#ffffff" font-size="13">REUNION KIT 100 TAHUN GONTOR</text>
  ${logoSvgTag}
  
  <rect x="35" y="120" width="530" height="130" fill="#F8FAF9" stroke="#E5E7EB" stroke-width="2" rx="12" />
  <text x="50" y="148" fill="#063D2E" font-size="12" font-weight="bold">NO. ORDER / VERIFIKASI:</text>
  <text x="50" y="178" fill="#000000" font-size="22" font-weight="bold">${escOrderNo}</text>
  <text x="50" y="208" fill="#374151" font-size="13">NAMA: ${escName} (Stambuk: ${escStambuk}) • ${methodLabel}</text>
  <text x="50" y="230" fill="#059669" font-size="13" font-weight="bold">WA: ${escPhone}</text>

  <rect x="430" y="128" width="115" height="115" fill="#ffffff" stroke="#E5E7EB" stroke-width="1" rx="8" />
  <image href="${qrImageHref}" x="435" y="133" width="105" height="105" />

  <text x="40" y="275" fill="#063D2E" font-size="14" font-weight="bold">RINCIAN BARANG REUNION KIT:</text>
  ${formattedItemsSvg}

  <rect x="35" y="590" width="530" height="110" fill="${isDelivery ? '#EFF6FF' : '#FEF3C7'}" stroke="${isDelivery ? '#3B82F6' : '#F59E0B'}" stroke-width="1.5" rx="10" />
  <text x="50" y="620" fill="${isDelivery ? '#1E40AF' : '#92400E'}" font-size="13" font-weight="bold">${bottomBoxTitle}</text>
  <text x="50" y="648" fill="${isDelivery ? '#1E3A8A' : '#78350F'}" font-size="12" font-weight="600">${bottomLine1}</text>
  <text x="50" y="670" fill="${isDelivery ? '#1E3A8A' : '#78350F'}" font-size="12">${bottomLine2}</text>
</svg>
    `.trim()
  }

  // Export E-Voucher SVG File for Offline Mobile Saving
  const handleExportSVG = async () => {
    try {
      const qrBase64 = await getBase64Image(qrApiUrl)
      const logoBase64 = logoUrl ? await getBase64Image(logoUrl) : null
      const svgContent = generateTicketSVG(qrBase64, logoBase64)
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = isDelivery ? `Bukti-Pemesanan-${orderNumber}.svg` : `Tiket-Stand-${orderNumber}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export SVG error:', err)
    }
  }

  const handleExportPDF = async () => {
    setIsExportingPdf(true)
    try {
      const element = document.getElementById('printable-pickup-ticket')
      if (!element) throw new Error('Elemen tiket tidak ditemukan')

      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      // Capture web modal card directly with 2.5x scale for sharp vector-like text & graphics
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(isDelivery ? `Bukti-Pemesanan-${orderNumber}.pdf` : `Tiket-Stand-${orderNumber}.pdf`)
    } catch (err) {
      console.error('Export PDF error:', err)
      await handleExportSVG()
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-pickup-ticket, #printable-pickup-ticket * {
            visibility: visible;
          }
          #printable-pickup-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 16px;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-xl w-full flex flex-col overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-[#063D2E] to-emerald-900 text-white">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-9 w-auto max-w-[90px] object-contain shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
                {isDelivery ? <Truck className="w-5 h-5 text-blue-300" /> : <Ticket className="w-5 h-5" />}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                <Sparkles className="w-3 h-3" /> {isDelivery ? 'E-Receipt Resmi' : 'E-Voucher Resmi'}
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                {isDelivery ? 'Bukti Pemesanan (Kirim ke Rumah)' : 'Tiket Pengambilan Stand Bazar'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all print:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* E-Voucher Ticket Body */}
        <div className="p-4 sm:p-6 bg-gray-100/80 flex flex-col items-center">
          
          <div
            id="printable-pickup-ticket"
            className="w-full bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-200 space-y-5 font-sans relative overflow-hidden"
          >
            {/* Ticket Header & Status */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider font-display px-2.5 py-1 rounded-md border ${
                  isDelivery ? 'text-blue-800 bg-blue-50 border-blue-200' : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                }`}>
                  {isDelivery ? 'Status: Kirim ke Alamat' : 'Status: Siap Diambil di Stand'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono mt-2 flex items-center gap-2">
                  <span>{orderNumber}</span>
                  <button onClick={copyOrderNo} className="text-gray-400 hover:text-gray-700 print:hidden cursor-pointer">
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrApiUrl} alt="QR Tiket" className="w-20 h-20 sm:w-24 sm:h-24 object-contain border border-gray-200 rounded-lg p-1 bg-white" />
                <span className="text-[9px] font-bold text-gray-500 mt-1 font-mono">SCAN LACAK ORDER</span>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nama Pemesan:</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">{recipientName}</span>
                <span className="text-gray-500 text-[11px]">Stambuk: {stambuk}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">No. WhatsApp:</span>
                <span className="font-bold text-emerald-800 text-sm block mt-0.5">{phone}</span>
                <span className="text-gray-500 text-[11px]">
                  Metode: {isDelivery ? 'Kirim ke Rumah' : 'Ambil di Stand'}
                </span>
              </div>
            </div>

            {/* Order Items List */}
            <div>
              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider font-display block mb-2">
                Rincian Barang Kit yang Dipesan:
              </span>
              <div className="bg-[#063D2E]/5 rounded-xl p-4 border border-[#063D2E]/10">
                <ul className="space-y-2 text-xs text-gray-900 font-semibold">
                  {items.length > 0 ? (
                    items.map((it: any, i: number) => {
                      const qty = it.quantity || 1
                      const name = it.name || it.item_name_snapshot || it.product_name || 'Merchandise'
                      const rawVariant = it.variantName || it.variant_name_snapshot || it.variant_name
                      const variant = rawVariant ? ` (${rawVariant})` : ''
                      return (
                        <li key={i} className="flex items-start gap-2 border-b border-gray-200/50 pb-1.5 last:border-none last:pb-0">
                          <span className="font-bold text-[#063D2E] bg-emerald-100 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                            {qty}x
                          </span>
                          <span className="leading-snug pt-0.5">{name}{variant}</span>
                        </li>
                      )
                    })
                  ) : (
                    <li>• Merchandise Reunion Kit 100 Tahun Gontor</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Delivery or Stand Location Info Box */}
            {isDelivery ? (
              <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
                <Truck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-blue-950">Alamat Pengiriman Tujuan:</span>
                  <span className="text-blue-800 leading-relaxed block mt-0.5">
                    {fullShippingAddress || 'Alamat dikirim sesuai data pengisian form.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
                <Store className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-950">Lokasi Pengambilan Stand Bazar:</span>
                  <span className="text-amber-800 leading-relaxed block mt-0.5">
                    Stand Resmi Panitia 100 Tahun Gontor, Area Bazar Perayaan, Pondok Modern Darussalam Gontor, Ponorogo. Tunjukkan QR Code ini kepada petugas stand.
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-white flex flex-wrap gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-display font-semibold text-xs hover:bg-gray-100 print:hidden cursor-pointer"
          >
            Tutup
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="flex-1 py-2.5 px-4 rounded-xl border border-emerald-800 text-emerald-950 bg-emerald-50 hover:bg-emerald-100 font-display font-bold text-xs flex items-center justify-center gap-2 transition-all print:hidden disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-800" />
            <span>{isExportingPdf ? 'Mengunduh PDF...' : (isDelivery ? 'Unduh E-Receipt PDF' : 'Unduh Tiket PDF')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-5 rounded-xl text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all print:hidden cursor-pointer"
            style={{ background: '#063D2E' }}
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak</span>
          </button>
        </div>

      </div>
    </div>
  )
}
