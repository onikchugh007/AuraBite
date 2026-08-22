import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiMapPin, FiStar, FiActivity, FiShield, FiNavigation } from 'react-icons/fi'
import RestaurantCard from '../components/restaurants/RestaurantCard'
import axios from 'axios'

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('all')
  const [selectedHealthFilter, setSelectedHealthFilter] = useState('all')
  const [healthMode, setHealthMode] = useState(false)
  const [sortBy, setSortBy] = useState('distance')
  const [loading, setLoading] = useState(true)

  // Default GPS coords (Jhansi Nagra)
  const [userCoords, setUserCoords] = useState({ lat: 25.4358, lng: 78.5684 })
  const [locationName, setLocationName] = useState('Current GPS Location')

  // Auto-detect browser location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        (err) => console.warn('GPS fallback:', err.message),
        { enableHighAccuracy: true }
      )
    }
  }, [])

  // Fetch nearby restaurants from backend API using coordinates and search query
  useEffect(() => {
    const fetchNearbyRestaurants = async () => {
      try {
        setLoading(true)
        const params = {
          lat: userCoords.lat,
          lng: userCoords.lng,
          maxDistanceKm: 25,
          search: searchQuery
        }

        const { data } = await axios.get('/api/shop/nearby', { params })
        const list = data.restaurants || data || []
        setRestaurants(list)
        setFilteredRestaurants(list)
      } catch (error) {
        console.error('Error fetching nearby restaurants:', error)
        // Fallback to standard endpoint if nearby error
        try {
          const res = await axios.get('/api/restaurants')
          setRestaurants(res.data || [])
          setFilteredRestaurants(res.data || [])
        } catch (err) {
          console.error('Fallback error:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchNearbyRestaurants()
    }, 300)

    return () => clearTimeout(timer)
  }, [userCoords.lat, userCoords.lng, searchQuery])

  // Filter and Sort in Frontend
  useEffect(() => {
    let filtered = [...restaurants]

    if (selectedCuisine !== 'all') {
      filtered = filtered.filter(r =>
        r.cuisine?.some(c => c.toLowerCase() === selectedCuisine.toLowerCase()) ||
        r.category?.toLowerCase() === selectedCuisine.toLowerCase() ||
        r.items?.some(i => i.category?.toLowerCase() === selectedCuisine.toLowerCase())
      )
    }

    if (selectedHealthFilter !== 'all') {
      filtered = filtered.filter(r =>
        r.items?.some(i =>
          i.dietaryTags?.includes(selectedHealthFilter)
        )
      )
    }

    if (healthMode) {
      filtered = filtered.filter(r =>
        r.items?.some(i =>
          i.dietaryTags?.includes('diabetic-friendly') ||
          i.dietaryTags?.includes('low-sodium') ||
          i.dietaryTags?.includes('gluten-free')
        )
      )
    }

    if (sortBy === 'distance') {
      filtered.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating?.average || b.rating || 4.5) - (a.rating?.average || a.rating || 4.5))
    } else if (sortBy === 'delivery-time') {
      filtered.sort((a, b) => (a.estimatedDeliveryMinutes || 30) - (b.estimatedDeliveryMinutes || 30))
    }

    setFilteredRestaurants(filtered)
  }, [selectedCuisine, selectedHealthFilter, healthMode, sortBy, restaurants])

  const cuisines = ['Italian', 'Chinese', 'Indian', 'Burgers', 'Pizza']
  const healthFilters = [
    { id: 'all', label: 'All Health Types', icon: '🥗' },
    { id: 'diabetic-friendly', label: 'Diabetic Friendly (Low GI)', icon: '🩸' },
    { id: 'low-sodium', label: 'Low Sodium (Heart Safe)', icon: '🧂' },
    { id: 'gluten-free', label: 'Gluten Free', icon: '🌾' },
    { id: 'keto', label: 'Keto / Low Carb', icon: '🥑' },
    { id: 'high-protein', label: 'High Protein', icon: '🏋️' }
  ]

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & GPS Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-6 rounded-3xl border border-white/10"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-1 flex items-center gap-3">
              Nearby Restaurants & Menu Items
              {healthMode && (
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 animate-pulse">
                  HEALTH MODE ACTIVE
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
              <FiNavigation className="text-orange-400 w-4 h-4" />
              Showing restaurants selling food near <span className="text-white font-semibold">{userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}</span>
            </p>
          </div>

          {/* Health Mode Switch Button */}
          <button
            onClick={() => setHealthMode(!healthMode)}
            className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl border cursor-pointer ${
              healthMode
                ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white border-emerald-400 shadow-emerald-500/20 ring-4 ring-emerald-500/20'
                : 'bg-white/10 hover:bg-white/20 text-gray-200 border-white/10'
            }`}
          >
            <FiActivity className={`w-5 h-5 ${healthMode ? 'animate-bounce text-white' : 'text-emerald-400'}`} />
            <span>{healthMode ? '🩺 Health Mode ON' : '🩺 Switch to Health Mode'}</span>
          </button>
        </motion.div>

        {/* Medical & Dietary Restriction Filter Bar */}
        <div className="glass p-4 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-orange-400">
            <FiShield className="w-4 h-4" /> Filter by Medical & Health Need:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {healthFilters.map((h) => {
              const isSelected = selectedHealthFilter === h.id
              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedHealthFilter(h.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/30'
                      : 'bg-black/40 hover:bg-black/60 text-gray-300 border-white/10'
                  }`}
                >
                  <span>{h.icon}</span>
                  <span>{h.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search Bar for Restaurant Name or Product Name */}
          <div className="md:col-span-2 relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search nearby restaurants by name or products they sell (e.g. Pizza, Salad)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl glass focus:border-orange-500 outline-none text-white placeholder-gray-500 text-sm"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-xl glass outline-none cursor-pointer text-white bg-zinc-900 text-sm"
          >
            <option value="distance">Nearest Distance</option>
            <option value="rating">Highest Rated</option>
            <option value="delivery-time">Fastest Delivery</option>
          </select>

          {/* Cuisine Filter */}
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="px-4 py-3 rounded-xl glass outline-none cursor-pointer text-white bg-zinc-900 text-sm"
          >
            <option value="all">All Cuisines</option>
            {cuisines.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Restaurants Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full mb-3"
            />
            <p className="text-gray-400 text-sm animate-pulse">Fetching nearby restaurants & products...</p>
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 glass rounded-3xl p-8 border border-white/10 max-w-md mx-auto"
          >
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-2xl font-bold mb-2">No nearby restaurants found</h3>
            <p className="text-gray-400 mb-4">No matching restaurants or products found within range.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCuisine('all'); setSelectedHealthFilter('all'); setHealthMode(false); }}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Restaurants
