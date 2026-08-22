import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiUser, FiArrowRight, FiHome, FiAlertCircle } from 'react-icons/fi'
import RazorpayPayment from '../components/checkout/RazorpayPayment'
import { clearCart } from '../store/cartSlice'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Checkout = () => {
  const { items, total } = useSelector(state => state.cart)
  const { user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    address: '',
    phone: user?.phone || '',
    instructions: ''
  })
  const [orderPlaced, setOrderPlaced] = useState(false)

  const deliveryFee = total > 50 ? 0 : 5.99
  const tax = total * 0.08
  const finalTotal = total + deliveryFee + tax

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePaymentSuccess = async (order) => {
    setOrderPlaced(true)
    dispatch(clearCart())

    setTimeout(() => {
      navigate(`/track/${order._id}`)
    }, 2000)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <FiAlertCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiMapPin className="text-orange-500" />
                Delivery Address
              </h2>
              <div>
                <label className="block text-sm font-medium mb-2">Full Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete delivery address"
                  className="w-full px-4 py-3 rounded-xl glass focus:border-orange-500 outline-none resize-none"
                  rows="3"
                  required
                />
              </div>
            </motion.div>

            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiPhone className="text-orange-500" />
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl glass outline-none opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl glass focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Special Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiHome className="text-orange-500" />
                Special Instructions
              </h2>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                placeholder="Add any special instructions for delivery (optional)"
                className="w-full px-4 py-3 rounded-xl glass focus:border-orange-500 outline-none resize-none"
                rows="3"
              />
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="glass rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-bold">Order Summary</h2>

              {/* Items */}
              <div className="max-h-64 overflow-y-auto space-y-3 pb-4 border-b border-white/10">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-400' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold gradient-text">${finalTotal.toFixed(2)}</span>
                </div>

                {!orderPlaced ? (
                  <RazorpayPayment
                    amount={finalTotal}
                    orderData={{
                      customerName: user?.name,
                      customerEmail: user?.email,
                      customerPhone: formData.phone,
                      address: formData.address,
                      instructions: formData.instructions,
                      items: items.map(i => ({ name: i.name, quantity: i.quantity }))
                    }}
                    onSuccess={handlePaymentSuccess}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-3 py-4 bg-green-500/20 rounded-xl text-green-400"
                  >
                    <span className="text-2xl">✓</span>
                    <span className="font-semibold">Order Placed!</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
