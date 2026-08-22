import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiMinus, FiShoppingBag, FiStar, FiActivity, FiShield } from 'react-icons/fi'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../store/cartSlice'
import AIMealSafetyModal from '../health/AIMealSafetyModal'

const FoodItemCard = ({ item }) => {
  const [quantity, setQuantity] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [showAISafetyModal, setShowAISafetyModal] = useState(false)
  const dispatch = useDispatch()

  if (!item) return null

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

  // Safe rating resolution
  const ratingValue = typeof item.rating === 'object'
    ? (item.rating?.average || 4.5)
    : (item.rating || 4.5)

  const dietaryTags = item.dietaryTags || ['diabetic-friendly']
  const nutritionInfo = item.nutritionInfo || {
    calories: 320,
    carbsG: 28,
    proteinG: 14,
    sodiumMg: 240,
    sugarG: 3,
    glycemicIndex: 40
  }

  return (
    <>
      <motion.div
        layout
        className="relative rounded-2xl overflow-hidden glass group hover-lift border border-white/10 flex flex-col justify-between"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative sm:w-44 h-44 sm:h-auto overflow-hidden shrink-0">
            <img
              src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {item.foodType && (
              <div
                className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-md ${
                  item.foodType === 'veg' ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {item.foodType}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-start mb-1 gap-2">
                <h3 className="font-bold text-base group-hover:text-orange-400 transition-colors">
                  {item.name}
                </h3>
                <span className="text-base font-bold text-orange-400 shrink-0">₹{item.price}</span>
              </div>

              {/* Health & Dietary Restriction Badges */}
              <div className="flex flex-wrap gap-1.5 my-2">
                {dietaryTags.map((tag) => {
                  if (tag === 'diabetic-friendly')
                    return (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                        🩸 Diabetic Safe
                      </span>
                    )
                  if (tag === 'low-sodium')
                    return (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                        🧂 Low Sodium
                      </span>
                    )
                  if (tag === 'gluten-free')
                    return (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        🌾 Gluten Free
                      </span>
                    )
                  if (tag === 'keto')
                    return (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                        🥑 Keto
                      </span>
                    )
                  if (tag === 'high-protein')
                    return (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        🏋️ High Protein
                      </span>
                    )
                  return (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-white/10 text-gray-300 text-[10px] font-bold">
                      {tag}
                    </span>
                  )
                })}
              </div>

              {/* Macro Specifications Bar */}
              <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 my-2">
                <span>🔥 {nutritionInfo.calories} kcal</span>
                <span>•</span>
                <span>🌾 {nutritionInfo.carbsG}g Carbs</span>
                <span>•</span>
                <span>💪 {nutritionInfo.proteinG}g Protein</span>
              </div>
            </div>

            {/* AI Safety Check Trigger & Add to Cart */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
              {/* AI Safety Checker Trigger Button */}
              <button
                onClick={() => setShowAISafetyModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                title="Run AI Meal Medical Safety Check"
              >
                <FiShield className="w-3.5 h-3.5 text-orange-400" />
                AI Safety Check
              </button>

              <AnimatePresence mode="wait">
                {quantity === 0 ? (
                  <motion.button
                    key="add"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleAddToCart}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white transition-all text-xs font-semibold border border-orange-500/30"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    ADD
                  </motion.button>
                ) : (
                  <motion.div
                    key="counter"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 glass px-2 py-1 rounded-xl border border-orange-500/30"
                  >
                    <button
                      onClick={() => updateQuantity(-1)}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"
                    >
                      <FiMinus className="w-3.5 h-3.5" />
                    </button>
                    <motion.span
                      key={quantity}
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="w-5 text-center font-bold text-xs text-white"
                    >
                      {quantity}
                    </motion.span>
                    <button
                      onClick={() => updateQuantity(1)}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
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
                className="text-white flex items-center gap-2 font-bold text-sm"
              >
                <FiShoppingBag className="w-6 h-6" />
                <span>Added to Cart!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Meal Safety Evaluation Modal */}
      {showAISafetyModal && (
        <AIMealSafetyModal item={item} onClose={() => setShowAISafetyModal(false)} />
      )}
    </>
  )
}

export default FoodItemCard
