'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, X, Check, Loader2, Navigation, AlertCircle } from 'lucide-react'

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
    village?: string
    district?: string
    city?: string
    province?: string
    postalCode?: string
    manualDetail?: string
    mapsUrl: string
  }) => void
}

interface SearchResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address?: {
    road?: string
    village?: string
    suburb?: string
    city?: string
    town?: string
    county?: string
    state?: string
    postcode?: string
  }
}

export default function MapPickerModal({ isOpen, onClose, onSelectLocation }: MapPickerModalProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [extractedVillage, setExtractedVillage] = useState<string>('')
  const [extractedDistrict, setExtractedDistrict] = useState<string>('')
  const [extractedCity, setExtractedCity] = useState<string>('')
  const [extractedProvince, setExtractedProvince] = useState<string>('')
  const [extractedPostalCode, setExtractedPostalCode] = useState<string>('')
  const [manualDetail, setManualDetail] = useState<string>('')

  const [gettingGPS, setGettingGPS] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)

  // Refs for Leaflet instance
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reverse Geocoding with Debounce
  const handleReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setSelectedPos({ lat, lng })
    setIsGeocoding(true)

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      
      if (data && data.display_name) {
        setSelectedAddress(data.display_name)
        const addr = data.address || {}
        
        setExtractedVillage(addr.village || addr.suburb || '')
        setExtractedDistrict(addr.subdistrict || addr.county || '')
        setExtractedCity(addr.city || addr.town || addr.city_district || addr.county || '')
        setExtractedProvince(addr.state || '')
        setExtractedPostalCode(addr.postcode || '')
      } else {
        setSelectedAddress(`Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      }
    } catch {
      setSelectedAddress(`Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    } finally {
      setIsGeocoding(false)
    }
  }, [])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen) return

    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Inject Leaflet JS
    if (!window.L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => initMap()
      document.body.appendChild(script)
    } else {
      setTimeout(initMap, 100)
    }

    function initMap() {
      if (!mapContainerRef.current || leafletMapRef.current || !window.L) return

      const defaultLat = selectedPos?.lat || -7.8712
      const defaultLng = selectedPos?.lng || 111.4621

      // Custom Modern Santri Editorial Deep Forest Green & Heritage Gold Marker Icon
      const customIcon = window.L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            position: relative;
            width: 36px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 0C8.05887 0 0 8.05887 0 18C0 31.5 18 44 18 44C18 44 36 31.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="#063D2E"/>
              <circle cx="18" cy="18" r="7" fill="#D4AF37"/>
              <circle cx="18" cy="18" r="4" fill="#FFFFFF"/>
            </svg>
          </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
      })

      const map = window.L.map(mapContainerRef.current, {
        zoomControl: true,
      }).setView([defaultLat, defaultLng], 14)

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      const marker = window.L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map)

      // Marker dragend event
      marker.on('dragend', (e: any) => {
        setHasInteracted(true)
        const pos = e.target.getLatLng()
        handleReverseGeocode(pos.lat, pos.lng)
      })

      // Map moveend event (updates center marker if dragged)
      map.on('moveend', () => {
        setHasInteracted(true)
        const center = map.getCenter()
        marker.setLatLng(center)
        handleReverseGeocode(center.lat, center.lng)
      })

      leafletMapRef.current = map
      markerRef.current = marker

      if (!selectedPos) {
        handleReverseGeocode(defaultLat, defaultLng)
      }
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
        markerRef.current = null
      }
    }
  }, [isOpen, handleReverseGeocode])

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Debounced Autocomplete Search (300ms)
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([])
      return
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=5`
        )
        const data = await res.json()
        setSearchResults(data || [])
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 350)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [query])

  // Select Search Result Item
  const handleSelectSearchResult = (item: SearchResult) => {
    setHasInteracted(true)
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)

    setSelectedPos({ lat, lng })
    setSelectedAddress(item.display_name)
    setSearchResults([])
    setQuery('')

    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView([lat, lng], 16)
      markerRef.current.setLatLng([lat, lng])
    }

    handleReverseGeocode(lat, lng)
  }

  // Current Device Location (GPS Button)
  const handleGetCurrentLocation = () => {
    setGpsError(null)
    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung Geolocation GPS.')
      return
    }

    setGettingGPS(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHasInteracted(true)
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.setView([lat, lng], 17)
          markerRef.current.setLatLng([lat, lng])
        }

        handleReverseGeocode(lat, lng)
        setGettingGPS(false)
      },
      (err) => {
        setGettingGPS(false)
        setGpsError(`Lokasi perangkat tidak tersedia: ${err.message}. Silakan pilih titik secara manual.`)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Confirm Location Selection
  const handleConfirm = () => {
    if (!selectedPos || isGeocoding) return
    const mapsUrl = `https://maps.google.com/?q=${selectedPos.lat.toFixed(6)},${selectedPos.lng.toFixed(6)}`
    
    onSelectLocation({
      lat: selectedPos.lat,
      lng: selectedPos.lng,
      addressName: selectedAddress,
      village: extractedVillage,
      district: extractedDistrict,
      city: extractedCity,
      province: extractedProvince,
      postalCode: extractedPostalCode,
      manualDetail,
      mapsUrl,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-4xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between"
          style={{ background: 'var(--gontor-ivory, #F8F5ED)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ background: 'var(--gontor-green, #063D2E)' }}>
              <MapPin className="w-5 h-5" style={{ color: 'var(--gontor-gold, #D4AF37)' }} />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-gray-900 leading-tight">
                Pilih Lokasi Pengiriman
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 font-body">
                Cari alamat atau geser pin ke lokasi rumah Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-all border border-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar with Debounced Autocomplete */}
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-white relative z-20">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari jalan, desa, kecamatan, kota, atau kode pos..."
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-body outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 animate-spin text-green-700 absolute right-3.5 top-3.5" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-3 right-3 sm:left-4 sm:right-4 top-14 bg-white border border-gray-200 rounded-xl shadow-xl divide-y divide-gray-100 text-xs sm:text-sm font-body z-30 max-h-48 overflow-y-auto">
              {searchResults.map(item => (
                <button
                  key={item.place_id}
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left p-3 hover:bg-green-50/80 text-gray-800 transition-colors flex items-start gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container Area */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] bg-gray-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[300px] sm:min-h-[380px] z-0" />

          {/* Map Instruction Overlay */}
          {!hasInteracted && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-xs px-4 py-2 rounded-xl text-xs font-display font-semibold text-gray-800 shadow-md border border-gray-200 text-center pointer-events-none animate-bounce">
              📍 Geser peta atau pindahkan pin untuk menentukan lokasi rumah
            </div>
          )}

          {/* Current GPS Location Button */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={gettingGPS}
            title="Gunakan Lokasi Saya Saat Ini"
            className="absolute bottom-4 right-4 z-10 px-3.5 py-2.5 rounded-xl bg-white hover:bg-green-50 text-green-900 border border-gray-200 shadow-md font-display font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <Navigation className={`w-4 h-4 text-green-700 ${gettingGPS ? 'animate-spin' : ''}`} />
            <span>{gettingGPS ? 'Mencari GPS...' : '◎ Gunakan Lokasi Saya'}</span>
          </button>
        </div>

        {/* GPS Error Notification if permission denied */}
        {gpsError && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs font-body flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Selected Location Panel & Manual Address Detail */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-3 overflow-y-auto max-h-[35vh] sm:max-h-none">
          <div className="p-3.5 rounded-xl border border-green-200 bg-green-50/60 font-body">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-green-800 uppercase tracking-wider font-display">
                LOKASI TERPILIH (HASIL REVERSE GEOCODING)
              </span>
              {isGeocoding && (
                <span className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-green-700" />
                  Menentukan alamat...
                </span>
              )}
            </div>

            <p className="font-semibold text-xs sm:text-sm text-gray-900 leading-snug line-clamp-2">
              📍 {selectedAddress || 'Sedang memuat titik lokasi...'}
            </p>

            {selectedPos && (
              <p className="text-[11px] text-gray-500 mt-1 font-mono">
                Koordinat: {selectedPos.lat.toFixed(6)}, {selectedPos.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Manual Address Detail Input (Rumah No., RT/RW, Patokan) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 font-display">
              Detail Alamat & Patokan Rumah (Sangat Penting untuk Kurir):
            </label>
            <input
              type="text"
              value={manualDetail}
              onChange={e => setManualDetail(e.target.value)}
              placeholder="Contoh: Rumah No. 12, RT 02/RW 04, Pagar Hijau (Dekat Masjid Al-Hidayah)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 font-body"
            />
          </div>

          {/* Modal Actions Footer */}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-display font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedPos || isGeocoding}
              className="flex-1 py-3 text-xs sm:text-sm font-display font-bold flex items-center justify-center gap-2 rounded-xl text-white shadow-sm transition-all disabled:opacity-50"
              style={{ background: 'var(--gontor-green, #063D2E)' }}
            >
              <Check className="w-4 h-4 style={{ color: 'var(--gontor-gold)' }}" />
              Gunakan Lokasi Ini
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
