'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X, Check, Loader2, Compass, ExternalLink } from 'lucide-react'

declare global {
  interface Window {
    L: any
  }
}

interface MapPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (data: {
    lat: number
    lng: number
    addressName: string
    city?: string
    province?: string
    mapsUrl: string
  }) => void
}

interface SearchResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address?: {
    city?: string
    town?: string
    suburb?: string
    county?: string
    state?: string
    postcode?: string
  }
}

export default function MapPickerModal({ isOpen, onClose, onSelectLocation }: MapPickerModalProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [extractedCity, setExtractedCity] = useState<string>('')
  const [extractedProvince, setExtractedProvince] = useState<string>('')

  // Map container ref
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  // Initialize Leaflet Map dynamically
  useEffect(() => {
    if (!isOpen) return

    // Inject Leaflet CSS if not present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Inject Leaflet JS if not present
    if (!window.L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => initMap()
      document.body.appendChild(script)
    } else {
      setTimeout(initMap, 100)
    }

    function initMap() {
      if (!mapRef.current || leafletMapRef.current || !window.L) return

      // Default center: Ponorogo / Surabaya (-7.87, 111.46)
      const defaultLat = selectedPos?.lat || -7.8712
      const defaultLng = selectedPos?.lng || 111.4621

      const map = window.L.map(mapRef.current).setView([defaultLat, defaultLng], 13)

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      const marker = window.L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map)

      marker.on('dragend', function (e: any) {
        const coord = e.target.getLatLng()
        handlePosChange(coord.lat, coord.lng)
      })

      map.on('click', function (e: any) {
        marker.setLatLng(e.latlng)
        handlePosChange(e.latlng.lat, e.latlng.lng)
      })

      leafletMapRef.current = map
      markerRef.current = marker

      if (!selectedPos) {
        handlePosChange(defaultLat, defaultLng)
      }
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
        markerRef.current = null
      }
    }
  }, [isOpen])

  // Handle position change & reverse geocode
  const handlePosChange = async (lat: number, lng: number) => {
    setSelectedPos({ lat, lng })
    const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`
    setSelectedAddress(`Koordinat Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}`)

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      if (data && data.display_name) {
        setSelectedAddress(data.display_name)
        const addr = data.address || {}
        const city = addr.city || addr.town || addr.county || addr.suburb || ''
        const prov = addr.state || ''
        setExtractedCity(city)
        setExtractedProvince(prov)
      }
    } catch {
      // Fallback
    }
  }

  // Handle Location Search via Nominatim API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id`
      )
      const data = await res.json()
      setResults(data || [])
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Select Search Result Item
  const handleSelectResult = (item: SearchResult) => {
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)

    setSelectedPos({ lat, lng })
    setSelectedAddress(item.display_name)
    setResults([])

    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView([lat, lng], 16)
      markerRef.current.setLatLng([lat, lng])
    }

    handlePosChange(lat, lng)
  }

  // Confirm Location Selection
  const handleConfirm = () => {
    if (!selectedPos) return
    const mapsUrl = `https://maps.google.com/?q=${selectedPos.lat.toFixed(6)},${selectedPos.lng.toFixed(6)}`
    onSelectLocation({
      lat: selectedPos.lat,
      lng: selectedPos.lng,
      addressName: selectedAddress,
      city: extractedCity,
      province: extractedProvince,
      mapsUrl,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-gray-900">Pilih & Cari Lokasi Rumah di Peta</h3>
              <p className="text-xs text-gray-500">Geser pin atau cari nama jalan untuk presisi pengiriman</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-white">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari lokasi: e.g. Jl. Ahmad Yani No 45, Surabaya..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-display outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="btn-primary px-4 py-2.5 text-xs font-display font-bold flex items-center gap-1.5 rounded-xl"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari Peta'}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {results.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-100 text-xs font-display">
              {results.map(item => (
                <button
                  key={item.place_id}
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left p-2.5 hover:bg-green-50 text-gray-800 transition-colors flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Canvas */}
        <div className="relative flex-1 min-h-[300px] bg-gray-100">
          <div ref={mapRef} className="w-full h-full min-h-[300px] z-0" />
          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg text-[11px] font-display font-semibold text-gray-700 shadow-sm border border-gray-200">
            📍 Klik peta atau seret penanda untuk pindah lokasi
          </div>
        </div>

        {/* Footer info & confirm */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-3">
          <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-xs font-display">
            <p className="text-gray-500 font-semibold mb-0.5">Alamat / Titik Terpilih:</p>
            <p className="font-bold text-green-900 line-clamp-2">
              {selectedAddress || 'Memuat titik lokasi...'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-display font-semibold text-xs hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedPos}
              className="btn-primary flex-1 py-3 text-xs font-display font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              <Check className="w-4 h-4" />
              Gunakan Lokasi Ini & Auto-Fill Alamat
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
