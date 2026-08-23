import { motion } from 'framer-motion'
import { FiStar, FiClock, FiMapPin, FiHeart, FiShoppingBag, FiTruck } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const RestaurantCard = ({ restaurant, index }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const distanceVal = restaurant.distanceKm !== undefined
    ? restaurant.distanceKm
    : (restaurant.distance || 1.8)

  const prepTimeVal = restaurant.prepTime || '15-20'
  const deliveryTimeVal = restaurant.estimatedDeliveryMinutes || restaurant.deliveryTime || '25-35'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.1 }}
      className="group relative"
    >
      <Link to={`/restaurant/${restaurant._id}`}>
        <div className="relative rounded-2xl overflow-hidden glass hover-lift border border-white/10 flex flex-col justify-between h-full">
          {/* Image Container */}
          <div className="relative h-48 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 shimmer" />
            )}
            <img
              src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
              alt={restaurant.name}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Status & Popular Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-3 py-1 rounded-full bg-green-500/30 text-green-300 text-xs font-bold backdrop-blur-md border border-green-500/40">
                Open Now
              </span>
              <span className="px-3 py-1 rounded-full bg-orange-500/30 text-orange-300 text-xs font-bold backdrop-blur-md border border-orange-500/40">
                Top Rated
              </span>
            </div>

            {/* Like Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsLiked(!isLiked)
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-orange-500 transition-colors border border-white/20"
            >
              <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-orange-500 text-orange-500' : 'text-white'}`} />
            </button>

            {/* Distance & Prep Badge on Image */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-semibold">
                <FiMapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>{distanceVal} km away</span>
              </div>
              <div className="flex items-center gap-1 bg-orange-500/80 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold">
                <span>🍳 Prep: {prepTimeVal} mins</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-1 gap-2">
                <h3 className="text-lg font-bold group-hover:text-orange-400 transition-colors line-clamp-1">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-500/20 text-green-400 shrink-0">
                  <FiStar className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold">
                    {typeof restaurant.rating === 'object' ? (restaurant.rating?.average || '4.5') : (restaurant.rating || '4.5')}
                  </span>
                </div>
              </div>

              {/* Full Address */}
              <p className="text-xs text-gray-300 flex items-center gap-1 line-clamp-1">
                <FiMapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>{restaurant.address || 'Nagra Main Road'}, {restaurant.city || 'Jhansi'}</span>
              </p>

              {/* Cuisines */}
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                {restaurant.cuisine?.join(' • ') || 'Indian • Gourmet Pizza • Fast Food'}
              </p>
            </div>

            {/* Prep Time & Delivery Time Details Bar */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-1 text-amber-300 font-semibold">
                <FiClock className="w-3.5 h-3.5 text-amber-400" />
                <span>Total: {deliveryTimeVal} mins</span>
              </div>
              <div className="flex items-center gap-1 text-green-400 font-semibold">
                <FiTruck className="w-3.5 h-3.5" />
                <span>Free Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default RestaurantCard
