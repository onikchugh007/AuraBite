import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiClock, FiMapPin, FiPhone, FiMessageSquare, FiStar,
  FiCheckCircle, FiPackage, FiTruck, FiShoppingBag,
  FiShield, FiNavigation, FiPlay, FiPause, FiChevronDown, FiChevronUp, FiCopy, FiCheck, FiTarget
} from 'react-icons/fi'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useSocket } from '../../context/SocketContext'

// Helper component to auto-fit map view to markers
const AutoFitMap = ({ bounds }) => {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      try {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 })
      } catch (err) {
        console.error('Fit bounds error:', err)
      }
    }
  }, [bounds, map])
  return null
}

// Custom DivIcons for Leaflet
const customerIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-10 h-10">
      <div class="absolute inset-0 bg-red-500/40 rounded-full animate-ping"></div>
      <div class="relative w-10 h-10 bg-gradient-to-tr from-red-600 to-rose-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xl">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
    </div>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
})

const restaurantIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-10 h-10">
      <div class="relative w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xl">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0v4m0 0h4m0-4v-3m0 0h-4"/>
        </svg>
      </div>
    </div>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
})

const riderIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-12 h-12">
      <div class="absolute inset-0 bg-orange-500/50 rounded-full animate-pulse"></div>
      <div class="relative w-12 h-12 bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-white shadow-2xl transform transition-transform duration-300 hover:scale-110">
        <span class="text-2xl">🛵</span>
      </div>
    </div>
  `,
  className: '',
  iconSize: [48, 48],
  iconAnchor: [24, 24]
})

// Haversine formula for distance calculation in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return parseFloat((R * c).toFixed(2))
}

const LiveTracking = ({ order }) => {
  const socket = useSocket()
  const [copiedOtp, setCopiedOtp] = useState(false)
  const [showItems, setShowItems] = useState(false)

  // Extract base order details
  const primaryShopOrder = order?.shopOrders?.[0] || {}
  const shopName = primaryShopOrder?.shop?.name || 'Pizzeria Bella Vita'
  const [currentStatus, setCurrentStatus] = useState(
    primaryShopOrder?.status || order?.status || 'pending'
  )

  // User Real-time GPS Location state
  const baseLat = Number(order?.deliveryAddress?.latitude) || 25.4358
  const baseLng = Number(order?.deliveryAddress?.longitude) || 78.5684
  const [customerLoc, setCustomerLoc] = useState({
    lat: baseLat,
    lng: baseLng
  })

  // Detect current live GPS location by default
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomerLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        },
        (err) => console.warn('Geolocation fallback to address lat/lng:', err.message),
        { enableHighAccuracy: true }
      )
    }
  }, [])

  // Position Shop at realistic distance (~1.8 km) from user's current GPS location
  const restaurantLat = customerLoc.lat + 0.012
  const restaurantLng = customerLoc.lng - 0.014

  // Rider initial position (between restaurant & customer)
  const [riderLocation, setRiderLocation] = useState({
    lat: customerLoc.lat + 0.007,
    lng: customerLoc.lng - 0.007
  })

  // Update rider position when customer location changes initially
  useEffect(() => {
    setRiderLocation({
      lat: customerLoc.lat + 0.007,
      lng: customerLoc.lng - 0.007
    })
  }, [customerLoc.lat, customerLoc.lng])

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false)
  const simulationIntervalRef = useRef(null)

  // Listen to live socket events
  useEffect(() => {
    if (!socket) return

    const handleLocationUpdate = (data) => {
      if (data && data.latitude && data.longitude) {
        setRiderLocation({
          lat: Number(data.latitude),
          lng: Number(data.longitude)
        })
      }
    }

    const handleStatusUpdate = (data) => {
      if (data && (data.orderId === order?._id || data.status)) {
        setCurrentStatus(data.status)
      }
    }

    socket.on('updateDeliveryLocation', handleLocationUpdate)
    socket.on('update-status', handleStatusUpdate)

    return () => {
      socket.off('updateDeliveryLocation', handleLocationUpdate)
      socket.off('update-status', handleStatusUpdate)
    }
  }, [socket, order?._id])

  // Live simulation of delivery rider path moving towards user's live GPS location
  useEffect(() => {
    if (isSimulating) {
      let step = 0
      const totalSteps = 30
      simulationIntervalRef.current = setInterval(() => {
        step += 1
        const progress = Math.min(step / totalSteps, 1)

        // Interpolate rider location from restaurant towards user current location
        const newLat = restaurantLat + (customerLoc.lat - restaurantLat) * progress
        const newLng = restaurantLng + (customerLoc.lng - restaurantLng) * progress

        setRiderLocation({ lat: newLat, lng: newLng })

        // Update status progression based on simulation steps
        if (progress > 0.1 && progress < 0.4) {
          setCurrentStatus('preparing')
        } else if (progress >= 0.4 && progress < 0.95) {
          setCurrentStatus('out of delivery')
        } else if (progress >= 0.95) {
          setCurrentStatus('delivered')
          setIsSimulating(false)
          clearInterval(simulationIntervalRef.current)
        }
      }, 1200)
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
      }
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
      }
    }
  }, [isSimulating, customerLoc.lat, customerLoc.lng, restaurantLat, restaurantLng])

  // Calculate distance & estimated delivery time to user's real-time location
  const remainingKm = calculateDistance(
    riderLocation.lat,
    riderLocation.lng,
    customerLoc.lat,
    customerLoc.lng
  )
  const totalShopDistanceKm = calculateDistance(
    restaurantLat,
    restaurantLng,
    customerLoc.lat,
    customerLoc.lng
  )
  const calculatedEtaMinutes = Math.max(3, Math.ceil(remainingKm * 4 + 4))

  // Delivery Steps Definition
  const steps = [
    {
      status: 'pending',
      label: 'Order Confirmed',
      desc: 'Your order has been received by the restaurant',
      icon: FiShoppingBag
    },
    {
      status: 'preparing',
      label: 'Preparing Your Food',
      desc: 'Chef is preparing your fresh order',
      icon: FiPackage
    },
    {
      status: 'out of delivery',
      altStatus: 'out_for_delivery',
      label: 'Out for Delivery',
      desc: 'Rider is on the way to your address',
      icon: FiTruck
    },
    {
      status: 'delivered',
      label: 'Order Delivered',
      desc: 'Food delivered safely! Enjoy your meal',
      icon: FiCheckCircle
    }
  ]

  const getStepIndex = (status) => {
    const s = String(status).toLowerCase()
    if (s === 'delivered') return 3
    if (s === 'out of delivery' || s === 'out_for_delivery') return 2
    if (s === 'preparing') return 1
    return 0
  }

  const currentStepIndex = getStepIndex(currentStatus)

  // Map Bounds calculations to fit Shop, Rider, and User Location
  const mapBounds = useMemo(() => {
    return [
      [restaurantLat, restaurantLng],
      [riderLocation.lat, riderLocation.lng],
      [customerLoc.lat, customerLoc.lng]
    ]
  }, [restaurantLat, restaurantLng, riderLocation, customerLoc.lat, customerLoc.lng])

  // OTP details
  const deliveryOtp = primaryShopOrder?.deliveryOtp || '4829'
  const deliveryBoyName =
    primaryShopOrder?.assignedDeliveryBoy?.fullName ||
    primaryShopOrder?.assignedDeliveryBoy?.name ||
    'Rahul Sharma'
  const deliveryBoyPhone =
    primaryShopOrder?.assignedDeliveryBoy?.mobile || '+91 98765 43210'

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedOtp(true)
    setTimeout(() => setCopiedOtp(false), 2000)
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Map & ETA Column (8 Cols) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
        {/* Live Leaflet Map Container */}
        <div className="relative rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl h-[480px] lg:h-[580px] z-0">
          <MapContainer
            center={[customerLoc.lat, customerLoc.lng]}
            zoom={14}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', borderRadius: '1.5rem' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AutoFitMap bounds={mapBounds} />

            {/* Restaurant Marker */}
            <Marker position={[restaurantLat, restaurantLng]} icon={restaurantIcon}>
              <Popup>
                <div className="p-1 text-slate-900 font-sans">
                  <p className="font-bold text-sm">🏬 {shopName}</p>
                  <p className="text-xs text-gray-600">Restaurant ({totalShopDistanceKm} km from you)</p>
                </div>
              </Popup>
            </Marker>

            {/* Rider Marker */}
            <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
              <Popup>
                <div className="p-1 text-slate-900 font-sans">
                  <p className="font-bold text-sm">🛵 {deliveryBoyName}</p>
                  <p className="text-xs text-gray-600">On the way ({remainingKm} km from your current location)</p>
                </div>
              </Popup>
            </Marker>

            {/* User Current Location Marker */}
            <Marker position={[customerLoc.lat, customerLoc.lng]} icon={customerIcon}>
              <Popup>
                <div className="p-1 text-slate-900 font-sans">
                  <p className="font-bold text-sm">📍 Your Current Real-time Location</p>
                  <p className="text-xs text-gray-600">{order?.deliveryAddress?.text || 'Delivery Destination'}</p>
                </div>
              </Popup>
            </Marker>

            {/* Route Polylines */}
            <Polyline
              positions={[
                [restaurantLat, restaurantLng],
                [riderLocation.lat, riderLocation.lng]
              ]}
              color="#f97316"
              weight={4}
              opacity={0.7}
              dashArray="6, 6"
            />
            <Polyline
              positions={[
                [riderLocation.lat, riderLocation.lng],
                [customerLoc.lat, customerLoc.lng]
              ]}
              color="#22c55e"
              weight={5}
              opacity={0.8}
            />
          </MapContainer>

          {/* Floating ETA & Distance Overlay Card */}
          <div className="absolute top-4 left-4 right-4 sm:right-auto z-[400] pointer-events-auto">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-strong px-5 py-4 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl bg-black/60 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg animate-pulse">
                  <FiClock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    {currentStatus === 'delivered' ? 'Status' : 'Estimated Arrival'}
                  </p>
                  <p className="text-2xl font-extrabold text-white">
                    {currentStatus === 'delivered'
                      ? 'Arrived 🎉'
                      : `${calculatedEtaMinutes} mins`}
                  </p>
                </div>
              </div>

              <div className="h-8 w-[1px] bg-white/15 hidden sm:block" />

              <div className="hidden sm:flex flex-col text-xs text-gray-300 bg-white/10 px-3 py-2 rounded-xl">
                <div className="flex items-center gap-1.5 font-semibold text-orange-400">
                  <FiNavigation className="w-3.5 h-3.5" />
                  <span>{remainingKm} km to your GPS location</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Shop is {totalShopDistanceKm} km away
                </div>
              </div>
            </motion.div>
          </div>

          {/* Interactive Live Simulation Controller */}
          <div className="absolute bottom-4 left-4 z-[400] pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-2xl border transition-all ${
                isSimulating
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-black/70 hover:bg-black/90 text-white border-white/20 backdrop-blur-md'
              }`}
            >
              {isSimulating ? (
                <>
                  <FiPause className="w-4 h-4" /> Pause Live Simulation
                </>
              ) : (
                <>
                  <FiPlay className="w-4 h-4 text-orange-400" /> Simulate Live Rider Movement
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Delivery Address Details Card */}
        <div className="glass rounded-2xl p-5 border border-white/10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
            <FiMapPin className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Delivery Destination (Current GPS)</span>
              <span className="font-mono text-[10px] text-orange-400">
                {customerLoc.lat.toFixed(4)}, {customerLoc.lng.toFixed(4)}
              </span>
            </h4>
            <p className="text-sm font-medium text-gray-200">
              {order?.deliveryAddress?.text || 'Current Device Geolocation Address'}
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar - Timeline & Partner Details (5 Cols) */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        {/* Delivery OTP Security Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-5 border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <FiShield className="w-4 h-4" /> Delivery Security Code
            </div>
            <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-mono">
              REQUIRED AT DOOR
            </span>
          </div>

          <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-orange-500/20 mt-2">
            <div>
              <p className="text-xs text-gray-400">Share this OTP with delivery boy:</p>
              <p className="text-3xl font-mono font-black text-orange-400 tracking-widest">
                {deliveryOtp}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(deliveryOtp)}
              className="p-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 transition-colors flex items-center gap-1 text-xs font-medium"
            >
              {copiedOtp ? <FiCheck className="w-4 h-4 text-green-400" /> : <FiCopy className="w-4 h-4" />}
              {copiedOtp ? 'Copied' : 'Copy'}
            </button>
          </div>
        </motion.div>

        {/* Delivery Partner Card */}
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">Delivery Partner</h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold border border-green-500/30">
              Assigned ({remainingKm} km away)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-white/20">
              {deliveryBoyName[0]}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">{deliveryBoyName}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <FiStar className="w-3.5 h-3.5 fill-current" /> 4.9
                </span>
                <span>•</span>
                <span>2,400+ deliveries</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={`tel:${deliveryBoyPhone}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-orange-500/20"
            >
              <FiPhone className="w-4 h-4" />
              Call Rider
            </a>
            <button
              onClick={() => alert(`Connecting chat with ${deliveryBoyName}...`)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold text-sm transition-colors border border-white/10"
            >
              <FiMessageSquare className="w-4 h-4" />
              Chat
            </button>
          </div>
        </div>

        {/* Order Status Timeline Stepper */}
        <div className="glass rounded-2xl p-5 border border-white/10">
          <h3 className="font-bold text-base mb-4">Order Progress</h3>

          <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              const StepIcon = step.icon

              return (
                <div key={step.status} className="relative flex items-start gap-4 z-10">
                  {/* Status Indicator Icon Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                      isCompleted
                        ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/20'
                        : 'bg-zinc-800 text-gray-500 border border-white/10'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <p
                        className={`font-semibold text-sm ${
                          isCompleted ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Items & Payment Accordion Summary */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <button
            onClick={() => setShowItems(!showItems)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div>
              <p className="font-bold text-sm">Order Items & Summary</p>
              <p className="text-xs text-gray-400">
                {order?.shopOrders?.flatMap(so => so.shopOrderItems || [])?.length || 0} items • Paid via{' '}
                <span className="uppercase text-orange-400 font-semibold">
                  {order?.paymentMethod || 'Online'}
                </span>
              </p>
            </div>
            {showItems ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {showItems && (
            <div className="p-4 pt-0 border-t border-white/10 space-y-3">
              <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                {(order?.shopOrders?.flatMap(so => so.shopOrderItems || []) || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-gray-300">
                    <span>
                      {item.name || item.item?.name} x {item.quantity}
                    </span>
                    <span className="font-semibold text-white">
                      ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm font-bold">
                <span>Total Paid</span>
                <span className="text-orange-400">₹{order?.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LiveTracking
