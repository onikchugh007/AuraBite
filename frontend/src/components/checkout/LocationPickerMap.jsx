import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { FiMapPin, FiNavigation, FiSearch, FiLoader } from 'react-icons/fi'
import axios from 'axios'

// Custom Pin Icon for Location Picker
const locationPickerIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-10 h-10">
      <div class="absolute inset-0 bg-orange-500/40 rounded-full animate-ping"></div>
      <div class="relative w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-2xl">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
    </div>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
})

// Map click event listener to update location pin
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

// Recenter Map Helper
const MapRecenter = ({ center }) => {
  const map = useMap()
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 16, { duration: 1.5 })
    }
  }, [center, map])
  return null
}

const LocationPickerMap = ({ onAddressChange, defaultAddress }) => {
  // Default coordinates: Jhansi Nagra fallback (25.4358, 78.5684)
  const [position, setPosition] = useState({ lat: 25.4358, lng: 78.5684 })
  const [addressText, setAddressText] = useState(
    defaultAddress || 'UPHC Nagra, Nandanpura Nagara Road, Railway Colony, Jhansi - 284003, UP, India'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingLoc, setLoadingLoc] = useState(false)
  const [searching, setSearching] = useState(false)

  // Notify parent of location changes
  const notifyParent = (lat, lng, address) => {
    if (onAddressChange) {
      onAddressChange({
        text: address,
        latitude: lat,
        longitude: lng
      })
    }
  }

  // Reverse geocoding via OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      if (res.data && res.data.display_name) {
        const fullAddr = res.data.display_name
        setAddressText(fullAddr)
        notifyParent(lat, lng, fullAddr)
      } else {
        notifyParent(lat, lng, addressText)
      }
    } catch {
      notifyParent(lat, lng, addressText)
    }
  }

  // Handle user clicking on map
  const handleSelectLocation = (lat, lng) => {
    setPosition({ lat, lng })
    reverseGeocode(lat, lng)
  }

  // Real-time GPS Detection using browser navigator.geolocation
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setLoadingLoc(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setPosition({ lat, lng })
        reverseGeocode(lat, lng)
        setLoadingLoc(false)
      },
      (err) => {
        console.warn('Geolocation error fallback:', err.message)
        setPosition({ lat: 25.4358, lng: 78.5684 })
        reverseGeocode(25.4358, 78.5684)
        setLoadingLoc(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Auto-detect location on initial mount BY DEFAULT
  useEffect(() => {
    detectCurrentLocation()
  }, [])

  // Handle address search
  const handleSearchAddress = async (e) => {
    e?.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      )
      if (res.data && res.data.length > 0) {
        const first = res.data[0]
        const lat = parseFloat(first.lat)
        const lng = parseFloat(first.lon)
        setPosition({ lat, lng })
        setAddressText(first.display_name)
        notifyParent(lat, lng, first.display_name)
      } else {
        alert('Address not found. Please try clicking directly on the map.')
      }
    } catch (err) {
      console.error('Search address error:', err)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar & Real-time GPS Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchAddress} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search area, street or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass focus:border-orange-500 outline-none text-white text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors shrink-0 flex items-center justify-center"
            title="Search Location"
          >
            {searching ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiSearch className="w-5 h-5" />}
          </button>
        </form>

        <button
          type="button"
          onClick={detectCurrentLocation}
          disabled={loadingLoc}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 border border-blue-400/30"
          title="Detect Current GPS Location"
        >
          {loadingLoc ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiNavigation className="w-4 h-4 text-blue-200" />
          )}
          <span>{loadingLoc ? 'Locating...' : 'Use Real-time GPS'}</span>
        </button>
      </div>

      {/* Leaflet Map Picker View */}
      <div className="relative rounded-2xl overflow-hidden glass border border-white/10 h-64 sm:h-80 shadow-inner z-0">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={[position.lat, position.lng]} />
          <MapClickHandler onLocationSelect={handleSelectLocation} />

          <Marker position={[position.lat, position.lng]} icon={locationPickerIcon}>
            <Popup>
              <div className="p-1 text-slate-900 font-sans">
                <p className="font-bold text-xs">📍 Delivery Location (Current GPS)</p>
                <p className="text-[11px] text-gray-600">{addressText}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        <div className="absolute bottom-2 left-2 z-[400] bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] text-gray-300 pointer-events-none">
          Click anywhere on the map to pin exact delivery location
        </div>
      </div>

      {/* Selected Address Display & Manual Edit */}
      <div>
        <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 flex items-center justify-between">
          <span>Detected Delivery Address</span>
          <span className="text-[10px] text-orange-400 font-mono">
            GPS: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </span>
        </label>
        <textarea
          value={addressText}
          onChange={(e) => {
            setAddressText(e.target.value)
            notifyParent(position.lat, position.lng, e.target.value)
          }}
          className="w-full px-4 py-2.5 rounded-xl glass focus:border-orange-500 outline-none text-white text-xs sm:text-sm resize-none leading-relaxed"
          rows="2"
          required
        />
      </div>
    </div>
  )
}

export default LocationPickerMap
