import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiStar, FiClock, FiMapPin, FiPhone, FiArrowLeft } from 'react-icons/fi'
import FoodItemCard from '../components/menu/FoodItemCard'
import axios from 'axios'

const RestaurantDetail = () => {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true)
        let restaurantData
        try {
          const res = await axios.get(`/api/shop/get-by-id/${id}`)
          restaurantData = res.data
        } catch {
          const res = await axios.get(`/api/restaurants/${id}`)
          restaurantData = res.data
        }
        setRestaurant(restaurantData)
        setMenuItems(restaurantData?.items || [])
      } catch (error) {
        console.error('Error fetching restaurant details:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchRestaurantData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-4 border-orange-500/30 border-t-orange-500 rounded-full mb-3"
        />
        <p className="text-gray-400 text-sm animate-pulse">Loading menu & details...</p>
      </div>
    )
  }

  const categories = ['all', ...new Set(menuItems.map(item => item.category || 'Specialty'))]
  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => (item.category || 'Specialty') === selectedCategory)

  return (
    <div className="min-h-screen pt-20 pb-12">
      {restaurant ? (
        <>
          {/* Hero Banner */}
          <div className="relative h-80 sm:h-96 overflow-hidden mb-8">
            <img
              src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
              <Link
                to="/restaurants"
                className="p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
                Back to Restaurants
              </Link>
            </div>

            {/* Restaurant Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h1 className="text-3xl sm:text-5xl font-bold mb-3">{restaurant.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-200">
                    <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                      <FiStar className="w-4 h-4 fill-current text-amber-400" />
                      <span className="font-bold">{restaurant.rating || '4.8'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                      <FiClock className="w-4 h-4 text-orange-400" />
                      <span>{restaurant.deliveryTime || '25-35'} min</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                      <FiMapPin className="w-4 h-4 text-orange-400" />
                      <span>{restaurant.city || 'Downtown'}, {restaurant.state || 'NY'}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Restaurant Details */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 md:col-span-2 border border-white/10"
              >
                <h2 className="text-xl font-bold mb-3">About Restaurant</h2>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {restaurant.address ? `${restaurant.name} located at ${restaurant.address}.` : 'Serving authentic delicious gourmet meals with fresh ingredients.'}
                </p>

                <h3 className="font-bold text-sm mb-2 text-gray-300">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {['Gourmet Food', 'Fresh Ingredients', 'Fast Delivery'].map((c) => (
                    <span key={c} className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold border border-orange-500/30">
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6 border border-white/10"
              >
                <h3 className="font-bold text-base mb-4">Location & Contact</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <FiPhone className="w-5 h-5 text-orange-500 shrink-0" />
                    <span>+1 (555) 234-5678</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiMapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300">{restaurant.address || '124 Gourmet Boulevard'}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Menu Categories */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Menu Items</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                        ? 'btn-primary'
                        : 'glass hover:bg-white/10'
                      }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <FoodItemCard key={item._id} item={{ ...item, shop: restaurant._id }} />
                ))
              ) : (
                <div className="text-center py-12 col-span-full glass rounded-2xl border border-white/10">
                  <p className="text-gray-400">No menu items found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20 px-4">
          <h2 className="text-2xl font-bold mb-4">Restaurant Not Found</h2>
          <Link to="/restaurants" className="btn-primary px-6 py-2.5 rounded-xl">
            Back to Restaurants
          </Link>
        </div>
      )}
    </div>
  )
}

export default RestaurantDetail
