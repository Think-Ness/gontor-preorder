'use client'

import { Globe, ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { MapPinData } from '@/app/page'
import { INDONESIA_ISLAND_PATHS } from './IndonesiaMapData'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"

interface Props {
  mapPins: MapPinData[]
}

// Custom simple Mercator projection matching d3.geoMercator().fitSize([900, 420], geojson)
function project(lng: number, lat: number): [number, number] {
  const scale = 1125.7579682174937
  const translate = [-1870.4115041247428, 159.9104722285771]
  const x = translate[0] + scale * (lng * Math.PI / 180)
  const y = translate[1] - scale * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2))
  return [x, y]
}

export default function IndonesiaMapSection({ mapPins }: Props) {
  if (!mapPins) {
    return null
  }

  const provinceCounts: Record<string, number> = {}
  mapPins.forEach(p => {
    if (p.province) {
      provinceCounts[p.province] = (provinceCounts[p.province] || 0) + 1
    }
  })
  
  const topProvinces = Object.entries(provinceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0])

  return (
    <section className="py-12 lg:py-16 bg-white border-b border-gray-100">
      <div className="max-w-[80rem] mx-auto px-6 lg:px-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#063D2E] font-display flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Distribusi Pembelian
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-950 tracking-tight">
              Peta Sebaran Pemesan
            </h2>
            <p className="text-gray-500 text-sm font-body max-w-lg">
              Setiap titik cahaya merepresentasikan satu pemesan riil di seluruh Indonesia. Terima kasih atas antusiasmenya menyambut 100 Tahun Gontor!
            </p>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] lg:aspect-[2.2/1] min-h-[300px] bg-gradient-to-br from-[#e8f4f8] via-[#ddf0ec] to-[#e8f4f8] rounded-3xl overflow-hidden border border-emerald-100 shadow-inner group cursor-grab active:cursor-grabbing">
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={6}
            centerOnInit
            wheel={{ step: 0.1 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Controls */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow border border-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => zoomIn()} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-700 transition-colors" title="Zoom In">
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button onClick={() => zoomOut()} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-700 transition-colors" title="Zoom Out">
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button onClick={() => resetTransform()} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-700 transition-colors" title="Reset View">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>

                <TransformComponent 
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{ width: "100%", height: "100%" }}
                >
                  <svg
                    viewBox="0 0 900 420"
                    preserveAspectRatio="xMidYMid slice"
                    className="w-full h-full"
                  >
                    {/* Sea background grid */}
                    <defs>
                      <pattern id="seaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6,61,46,0.06)" strokeWidth="0.5" />
                      </pattern>
                      
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
                      </filter>
                    </defs>

                    <rect width="900" height="420" fill="url(#seaGrid)" />
                    <rect width="900" height="420" fill="rgba(232,244,248,0.6)" />

                    {/* Real Island shapes from TopoJSON */}
                    {INDONESIA_ISLAND_PATHS.map((path, i) => (
                      <path
                        key={i}
                        d={path}
                        fill="#d1ede4"
                        stroke="#a7d7c5"
                        strokeWidth="0.8"
                        strokeLinejoin="round"
                      />
                    ))}

                    {/* Individual Pins */}
                    {mapPins.map((pin, i) => {
                      const [x, y] = project(pin.lng, pin.lat)
                      const color = pin.isAlumni ? '#eab308' : '#10b981' // Yellow for Alumni, Green for Umum
                      const glowColor = pin.isAlumni ? 'rgba(234, 179, 8, 0.4)' : 'rgba(16, 185, 129, 0.4)'

                      return (
                        <g key={i} transform={`translate(${x}, ${y})`} className="animate-in fade-in zoom-in duration-1000" style={{ animationDelay: `${(i % 10) * 100}ms` }}>
                          {/* Base Glow */}
                          <circle cx="0" cy="0" r="4.5" fill={glowColor} className="animate-pulse" />
                          
                          {/* Google Maps style Pin Path */}
                          <path 
                            d="M0,0 C-2.5,-3.5 -5,-6.5 -5,-9.5 C-5,-12.5 -2.5,-15 0,-15 C2.5,-15 5,-12.5 5,-9.5 C5,-6.5 2.5,-3.5 0,0 Z" 
                            fill={color}
                            filter="url(#shadow)"
                          />
                          {/* Pin Dot */}
                          <circle cx="0" cy="-9.5" r="1.5" fill="white" />
                        </g>
                      )
                    })}
                  </svg>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100 shadow-xl text-xs space-y-4 max-w-[200px]">
            {topProvinces.length > 0 && (
              <div>
                <div className="font-display font-bold text-emerald-900 text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  Top Provinsi
                </div>
                <ul className="space-y-1">
                  {topProvinces.map((prov, idx) => (
                    <li key={prov} className="flex items-start gap-1.5 text-gray-600 font-medium">
                      <span className="font-bold text-emerald-700">{idx + 1}.</span>
                      <span className="leading-tight line-clamp-2">{prov}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-100">
              <div className="font-display font-bold text-gray-700 text-[10px] uppercase tracking-wider mb-2">Keterangan Pin</div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-3 h-3 rounded-full bg-[#eab308] border-[1.5px] border-white shadow-sm" />
                 <span className="text-gray-600 font-semibold text-[11px]">Alumni</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#10b981] border-[1.5px] border-white shadow-sm" />
                 <span className="text-gray-600 font-semibold text-[11px]">Umum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
