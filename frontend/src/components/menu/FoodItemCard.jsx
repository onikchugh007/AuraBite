import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiMinus, FiShoppingBag, FiStar, FiActivity, FiShield, FiInfo } from 'react-icons/fi'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../store/cartSlice'
import AIMealSafetyModal from '../health/AIMealSafetyModal'

const FoodItemCard = ({ item }) => {
  const [quantity, setQuantity] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [showAISafetyModal, setShowAISafetyModal] = useState(false)
  const dispatch = useDispatch()

  if (!item) return null

  const handleAddToCart = (e) => {
    if (e) e.stopPropagation()
    if (quantity === 0) {
      setQuantity(1)
      setIsAdding(true)
      setTimeout(() => setIsAdding(false), 500)
    }
    dispatch(addToCart({ ...item, quantity: quantity || 1 }))
  }

  const updateQuantity = (delta, e) => {
    if (e) e.stopPropagation()
    const newQty = Math.max(0, quantity + delta)
    setQuantity(newQty)
    if (newQty > 0) {
      dispatch(addToCart({ ...item, quantity: newQty }))
    }
  }

  // Safe rating resolution
  const ratingValue = typeof item.rating === 'object'
    ? (item.rating?.average || 4.5)
    : (item.rating || 4.5)

  const dietaryTags = item.dietaryTags || ['diabetic-friendly']
  const nutritionInfo = item.nutritionInfo || {
    calories: 320,
    carbsG: 28,
    proteinG: 14,
    fatG: 10,
    sodiumMg: 240,
    sugarG: 3,
    glycemicIndex: 40
  }

  return (
    <>
      <motion.div
        layout
        whileHover={{ y: -2 }}
        onClick={() => setShowAISafetyModal(true)}
        className="relative rounded-2xl p-3 bg-zinc-900/90 border border-white/10 hover:border-orange-500/50 hover:bg-zinc-800/90 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-lg cursor-pointer group"
      >
        {/* Item Image */}
        <div className="relative w-full sm:w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-white/10">
          <img
            src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {item.foodType && (
            <div
              className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white shadow-md ${
                item.foodType === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {item.foodType}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between space-y-1.5">
          {/* Title & Price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors line-clamp-1">
              {item.name}
            </h3>
            <span className="text-sm font-extrabold text-orange-400 shrink-0">₹{item.price}</span>
          </div>

          {/* Quick Dietary Tags */}
          <div className="flex flex-wrap gap-1">
            {dietaryTags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 text-[10px] font-semibold border border-white/10">
                {tag === 'diabetic-friendly' ? '🩸 Diabetic Safe' : tag === 'high-protein' ? '🏋️ High Protein' : tag}
              </span>
            ))}
          </div>

          {/* Bottom Bar: Nutrient Info Click Hint & Add to Cart Button */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10 gap-2">
            <span className="text-[10px] text-gray-400 group-hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors">
              <FiInfo className="w-3 h-3 text-orange-400" />
              <span>Click item for nutrients</span>
            </span>

            {/* Add to Cart / Quantity Counter */}
            <div onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                {quantity === 0 ? (
                  <motion.button
                    key="add"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleAddToCart}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white transition-all text-xs font-bold border border-orange-500/40 cursor-pointer shadow-sm"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    ADD
                  </motion.button>
                ) : (
                  <motion.div
                    key="counter"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 bg-zinc-800 px-2 py-0.5 rounded-xl border border-orange-500/40"
                  >
                    <button
                      onClick={(e) => updateQuantity(-1, e)}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white cursor-pointer"
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center font-bold text-xs text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={(e) => updateQuantity(1, e)}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white cursor-pointer"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Success Added Overlay */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-orange-500/90 backdrop-blur-sm z-10 rounded-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-white flex items-center gap-2 font-bold text-xs"
              >
                <FiShoppingBag className="w-5 h-5" />
                <span>Added to Cart!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Calories, Protein & AI Safety Check Modal */}
      {showAISafetyModal && (
        <AIMealSafetyModal item={item} onClose={() => setShowAISafetyModal(false)} />
      )}
    </>
  )
}

export default FoodItemCard
