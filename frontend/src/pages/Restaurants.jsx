import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiMapPin, FiStar } from 'react-icons/fi'
import RestaurantCard from '../components/restaurants/RestaurantCard'
import axios from 'axios'

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await axios.get('/api/restaurants')
        setRestaurants(data)
        setFilteredRestaurants(data)
      } catch (error) {
        console.error('Error fetching restaurants:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurants()
  }, [])

  useEffect(() => {
    let filtered = restaurants

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCuisine !== 'all') {
      filtered = filtered.filter(r => r.cuisine?.includes(selectedCuisine))
    }

    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sortBy === 'delivery-time') {
      filtered.sort((a, b) => (a.deliveryTime || 999) - (b.deliveryTime || 999))
    } else if (sortBy === 'distance') {
      filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    }

    setFilteredRestaurants(filtered)
  }, [searchQuery, selectedCuisine, sortBy, restaurants])

  const cuisines = ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese']

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Browse Restaurants</h1>
          <p className="text-gray-400">Discover the best food delivery in your area</p>
        </motion.div>

        {/* Search and Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2 relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl glass focus:border-orange-500 outline-none"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-xl glass outline-none cursor-pointer"
          >
            <option value="rating">Highest Rated</option>
            <option value="delivery-time">Fastest Delivery</option>
            <option value="distance">Nearest</option>
          </select>

          {/* Filter */}
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="px-4 py-3 rounded-xl glass outline-none cursor-pointer"
          >
            <option value="all">All Cuisines</option>
            {cuisines.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Cuisine Tags */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['All', ...cuisines].map((cuisine) => (
            <motion.button
              key={cuisine}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedCuisine(cuisine === 'All' ? 'all' : cuisine)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${(cuisine === 'All' ? selectedCuisine === 'all' : selectedCuisine === cuisine)
                ? 'btn-primary'
                : 'glass hover:bg-white/10'
                }`}
            >
              {cuisine}
            </motion.button>
          ))}
        </div>

        {/* Restaurants Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full"
            />
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
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No restaurants found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Restaurants
