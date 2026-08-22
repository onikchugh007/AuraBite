import { motion } from 'framer-motion'
import { FiStar, FiClock, FiMapPin, FiHeart } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const RestaurantCard = ({ restaurant, index }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
      <Link to={`/restaurant/${restaurant._id}`}>
        <div className="relative rounded-2xl overflow-hidden glass hover-lift">
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
            <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {restaurant.isOpen ? (
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold backdrop-blur-sm">
                  Open Now
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold backdrop-blur-sm">
                  Closed
                </span>
              )}
              {restaurant.isPopular && (
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold backdrop-blur-sm">
                  Popular
                </span>
              )}
            </div>

            {/* Like Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsLiked(!isLiked)
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-orange-500 transition-colors"
            >
              <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-orange-500 text-orange-500' : 'text-white'}`} />
            </button>

            {/* Distance Badge */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-sm">
              <FiMapPin className="w-4 h-4 text-orange-400" />
              <span>{restaurant.distance || '2.5'} km</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold group-hover:text-orange-400 transition-colors line-clamp-1">
                {restaurant.name}
              </h3>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400">
                <FiStar className="w-3 h-3 fill-current" />
                <span className="text-sm font-bold">{restaurant.rating || '4.5'}</span>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-3 line-clamp-1">
              {restaurant.cuisine?.join(' • ') || 'Italian • Pizza • Pasta'}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                <span>{restaurant.deliveryTime || '30-40'} min</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Delivery:</span>
                <span className={restaurant.deliveryFee === 0 ? 'text-green-400' : 'text-white'}>
                  {restaurant.deliveryFee === 0 ? 'Free' : `$${restaurant.deliveryFee}`}
                </span>
              </div>
            </div>

            {/* Hover Reveal */}
            <div className="mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(restaurant.tags || ['Spicy', 'Vegan', 'Gluten-Free']).map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-xs whitespace-nowrap">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default RestaurantCard
