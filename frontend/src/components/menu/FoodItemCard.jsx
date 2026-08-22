import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiMinus, FiShoppingBag, FiStar } from 'react-icons/fi'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../store/cartSlice'

const FoodItemCard = ({ item }) => {
  const [quantity, setQuantity] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const dispatch = useDispatch()

  const handleAddToCart = () => {
    if (quantity === 0) {
      setQuantity(1)
      setIsAdding(true)
      setTimeout(() => setIsAdding(false), 500)
    }
    dispatch(addToCart({ ...item, quantity: quantity || 1 }))
  }

  const updateQuantity = (delta) => {
    const newQty = Math.max(0, quantity + delta)
    setQuantity(newQty)
    if (newQty > 0) {
      dispatch(addToCart({ ...item, quantity: newQty }))
    }
  }

  return (
    <motion.div
      layout
      className="relative rounded-2xl overflow-hidden glass group hover-lift"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-40 h-40 sm:h-auto overflow-hidden">
          <img
            src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {item.isBestseller && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-orange-500 text-xs font-bold">
              BESTSELLER
            </div>
          )}
          {item.isVegan && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-green-500 text-xs font-bold">
              🌱 VEGAN
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-lg group-hover:text-orange-400 transition-colors">
                {item.name}
              </h3>
              <span className="text-lg font-bold gradient-text">${item.price}</span>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
              {item.description || 'Freshly prepared with premium ingredients'}
            </p>
          </div>

          {/* Add to Cart Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{item.rating || '4.5'}</span>
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>{item.calories || '450'} cal</span>
            </div>

            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-orange-500 transition-colors font-medium"
                >
                  <FiPlus className="w-4 h-4" />
                  Add
                </motion.button>
              ) : (
                <motion.div
                  key="counter"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 glass px-2 py-1 rounded-xl"
                >
                  <button
                    onClick={() => updateQuantity(-1)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <motion.span
                    key={quantity}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-8 text-center font-bold"
                  >
                    {quantity}
                  </motion.span>
                  <button
                    onClick={() => updateQuantity(1)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-orange-500/90 backdrop-blur-sm z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-white"
            >
              <FiShoppingBag className="w-12 h-12" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default FoodItemCard
