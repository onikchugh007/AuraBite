import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiStar, FiClock, FiMapPin, FiPhone } from 'react-icons/fi'
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
        const { data: restaurantData } = await axios.get(`/api/restaurants/${id}`)
        setRestaurant(restaurantData)

        const { data: menuData } = await axios.get(`/api/restaurants/${id}/menu`)
        setMenuItems(menuData)
      } catch (error) {
        console.error('Error fetching restaurant details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurantData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full"
        />
      </div>
    )
  }

  const categories = ['all', ...new Set(menuItems.map(item => item.category || 'Other'))]
  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => (item.category || 'Other') === selectedCategory)

  return (
    <div className="min-h-screen pt-24 pb-12">
      {restaurant && (
        <>
          {/* Hero Banner */}
          <div className="relative h-96 overflow-hidden mb-8">
            <img
              src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent" />

            {/* Restaurant Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h1 className="text-5xl font-bold mb-4">{restaurant.name}</h1>
                  <div className="flex flex-wrap gap-4 text-white">
                    <div className="flex items-center gap-2">
                      <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold">{restaurant.rating || '4.5'} ({restaurant.reviews || '1.2K'} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-5 h-5" />
                      <span>{restaurant.deliveryTime || '30-40'} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-5 h-5" />
                      <span>{restaurant.distance || '2.5'} km away</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4">
            {/* Restaurant Details */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 md:col-span-2"
              >
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-gray-400 mb-6">
                  {restaurant.description || 'Premium dining experience with authentic flavors and warm ambiance'}
                </p>

                <h3 className="font-bold mb-3">Cuisines</h3>
                <div className="flex flex-wrap gap-2">
                  {(restaurant.cuisine || ['Italian', 'Mediterranean']).map((c) => (
                    <span key={c} className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-bold mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FiPhone className="w-5 h-5 text-orange-500" />
                    <span>{restaurant.phone || '+1 (555) 000-0000'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiMapPin className="w-5 h-5 text-orange-500" />
                    <span className="text-sm">{restaurant.address || 'City Center, Main Street'}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Menu Categories */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6">Menu</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === cat
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
            <div className="grid gap-4 mb-12">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <FoodItemCard key={item._id} item={item} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">No items in this category</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RestaurantDetail
