import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiPlus, FiMinus, FiArrowRight, FiShoppingBag } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice'

const Cart = () => {
  const { items, total } = useSelector(state => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const deliveryFee = items.length > 0 ? (total > 50 ? 0 : 5.99) : 0
  const tax = total * 0.08
  const finalTotal = total + deliveryFee + tax

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag className="w-16 h-16 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Looks like you haven't added anything yet</p>
          <Link to="/restaurants" className="btn-primary inline-flex items-center gap-2">
            Browse Restaurants
            <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass rounded-2xl p-4 flex gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{item.name}</h3>
                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{item.restaurantName}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 glass px-2 py-1 rounded-xl">
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item._id, quantity: Math.max(0, item.quantity - 1) }))}
                          className="p-1 rounded-lg hover:bg-white/10"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                          className="p-1 rounded-lg hover:bg-white/10"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-lg font-bold gradient-text">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-400' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold gradient-text">${finalTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <FiArrowRight />
                </button>

                <button
                  onClick={() => dispatch(clearCart())}
                  className="w-full mt-3 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-400"
                >
                  Clear Cart
                </button>
              </div>

              {/* Promo Code */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-2">Have a promo code?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500 outline-none text-sm"
                  />
                  <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
