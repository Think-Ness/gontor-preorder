'use client'

import { useState } from 'react'
import { Printer, FileText, LayoutGrid } from 'lucide-react'
import ShippingLabelA5 from '@/components/admin/ShippingLabelA5'

interface Props {
  orders: any[]
  logoUrl: string | null
}

export default function PrintDeliveryClientView({ orders, logoUrl }: Props) {
  const [paperMode, setPaperMode] = useState<'A5' | 'A4'>('A5')

  return (
    <div className="bg-gray-100 min-h-screen print:bg-white text-gray-900 selection:bg-green-100 font-sans print:p-0 print:m-0">
      
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div className="print:hidden fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-wrap gap-3 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.14)] border border-gray-200/80 items-center animate-in fade-in slide-in-from-top-4 duration-300">
        
        {/* Paper Mode Selector Switcher */}
        <div className="flex flex-col items-start gap-1 mr-1 sm:mr-3 border-r border-gray-200 pr-3 sm:pr-4">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Format Kertas Print:</span>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200/80">
            <button
              type="button"
              onClick={() => setPaperMode('A5')}
              className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-all flex items-center gap-1.5 ${
                paperMode === 'A5'
                  ? 'bg-green-800 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A5 (1 Label/Lembar)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaperMode('A4')}
              className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-all flex items-center gap-1.5 ${
                paperMode === 'A4'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>A4 (2 Label/Lembar)</span>
            </button>
          </div>
        </div>

        {/* Info Note & Print Button */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-gray-900">
              {paperMode === 'A5' ? 'Kertas A5 Lanskap' : 'Kertas A4 Potret'}
            </div>
            <div className="text-[11px] text-gray-500 font-medium">
              {paperMode === 'A5' ? '1 lembar memuat 1 label' : '1 lembar A4 memuat 2 label'}
            </div>
          </div>

          <button 
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-br from-green-700 via-green-800 to-green-950 hover:from-green-600 hover:to-green-900 text-white rounded-2xl font-black text-sm sm:text-base shadow-[0_4px_16px_rgba(6,61,46,0.3)] transition-all transform active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            <Printer className="w-5 h-5 relative z-10 text-[#D4AF37]" />
            <span className="relative z-10">CETAK SEKARANG</span>
          </button>
        </div>
      </div>

      {/* Media Print Style Tag for Dynamic Strict Page Sizing */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: ${paperMode === 'A5' ? 'A5 landscape' : 'A4 portrait'};
              margin: 0;
            }
            html, body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .a4-sheet-container {
              width: 210mm !important;
              height: 297mm !important;
              max-height: 297mm !important;
              page-break-after: always !important;
              break-after: page !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
            .a5-sheet-container {
              width: 210mm !important;
              height: 148mm !important;
              max-height: 148mm !important;
              page-break-after: always !important;
              break-after: page !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
          }
        `
      }} />

      {/* Screen & Print Render Area */}
      <div className="py-8 print:py-0 flex flex-col items-center gap-8 print:gap-0">
        
        {paperMode === 'A5' ? (
          /* A5 Mode: 1 Label Per A5 Sheet */
          orders.map((order) => (
            <div 
              key={order.id} 
              className="a5-sheet-container bg-white shadow-xl print:shadow-none w-[210mm] h-[148mm] overflow-hidden"
            >
              <ShippingLabelA5 order={order} logoUrl={logoUrl} />
            </div>
          ))
        ) : (
          /* A4 Mode: Exactly 2 Labels Per Single A4 Sheet */
          Array.from({ length: Math.ceil(orders.length / 2) }).map((_, sheetIdx) => {
            const firstOrder = orders[sheetIdx * 2]
            const secondOrder = orders[sheetIdx * 2 + 1]

            return (
              <div 
                key={sheetIdx} 
                className="a4-sheet-container bg-white shadow-xl print:shadow-none w-[210mm] h-[297mm] max-h-[297mm] flex flex-col justify-between overflow-hidden border border-gray-300 print:border-none box-border"
              >
                {/* Top Label */}
                {firstOrder && (
                  <div className="shrink-0 h-[145mm] overflow-hidden">
                    <ShippingLabelA5 order={firstOrder} logoUrl={logoUrl} />
                  </div>
                )}

                {/* A4 Middle Cut Guide Divider (Exact 7mm height) */}
                <div className="w-full h-[7mm] flex items-center justify-center border-y border-dashed border-gray-400 bg-gray-50 print:bg-white text-gray-500 print:text-gray-400 font-mono text-[9px] tracking-widest uppercase shrink-0">
                  ✂ ---------------- BATAS POTONG KERTAS A4 (2 LABEL / LEMBAR) ---------------- ✂
                </div>

                {/* Bottom Label */}
                {secondOrder ? (
                  <div className="shrink-0 h-[145mm] overflow-hidden">
                    <ShippingLabelA5 order={secondOrder} logoUrl={logoUrl} />
                  </div>
                ) : (
                  <div className="w-[210mm] h-[145mm] bg-gray-50/50 flex flex-col items-center justify-center text-gray-400 text-xs font-mono p-8 shrink-0">
                    <span>(Area Kosong Kertas A4)</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
