import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiHome, FiAlertCircle, FiCreditCard, FiTruck } from 'react-icons/fi'
import RazorpayPayment from '../components/checkout/RazorpayPayment'
import LocationPickerMap from '../components/checkout/LocationPickerMap'
import { clearCart } from '../store/cartSlice'
import { useAuth } from '../context/AuthContext'

const Checkout = () => {
  const { items, total } = useSelector(state => state.cart)
  const { user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    address: 'UPHC Nagra, Nandanpura Nagara Road, Railway Colony, Jhansi - 284003, UP, India',
    latitude: 25.4358,
    longitude: 78.5684,
    phone: user?.phone || '9876543210',
    instructions: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [orderPlaced, setOrderPlaced] = useState(false)

  const deliveryFee = total > 50 ? 0 : 5.99
  const tax = total * 0.08
  const finalTotal = total + deliveryFee + tax

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLocationChange = ({ text, latitude, longitude }) => {
    setFormData(prev => ({
      ...prev,
      address: text,
      latitude: latitude || prev.latitude,
      longitude: longitude || prev.longitude
    }))
  }

  const handlePaymentSuccess = async (order) => {
    setOrderPlaced(true)
    dispatch(clearCart())

    setTimeout(() => {
      navigate(`/track/${order._id}`)
    }, 1200)
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center glass p-8 rounded-3xl border border-white/10">
          <FiAlertCircle className="w-16 h-16 mx-auto text-orange-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout & Location Graph</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form & Real-time Location Picker Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-Time Interactive Delivery Location Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiMapPin className="text-orange-500" />
                Delivery Location
              </h2>
              <LocationPickerMap
                defaultAddress={formData.address}
                onAddressChange={handleLocationChange}
              />
            </motion.div>

            {/* Payment Method Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiCreditCard className="text-orange-500" />
                Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${
                    paymentMethod === 'cod'
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <FiTruck className="w-6 h-6 text-orange-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-400">Pay when food arrives</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${
                    paymentMethod === 'online'
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <FiCreditCard className="w-6 h-6 text-orange-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">UPI / Credit / Debit Card</p>
                    <p className="text-xs text-gray-400">Pay securely online</p>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Contact Information & Special Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-2xl p-6 border border-white/10 space-y-4"
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiPhone className="text-orange-500" />
                Contact Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={user?.fullName || user?.name || 'Valued Customer'}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl glass outline-none opacity-60 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl glass focus:border-orange-500 outline-none text-sm text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  placeholder="e.g. Leave at gate, ring doorbell..."
                  className="w-full px-4 py-2.5 rounded-xl glass focus:border-orange-500 outline-none text-sm text-white resize-none"
                  rows="2"
                />
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="glass rounded-2xl p-6 space-y-6 border border-white/10">
              <h2 className="text-xl font-bold">Order Summary</h2>

              {/* Items */}
              <div className="max-h-64 overflow-y-auto space-y-3 pb-4 border-b border-white/10">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-400 font-semibold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax & Charges</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="text-2xl font-black text-orange-400">₹{finalTotal.toFixed(2)}</span>
                </div>

                {!orderPlaced ? (
                  <RazorpayPayment
                    amount={finalTotal}
                    paymentMethod={paymentMethod}
                    orderData={{
                      customerName: user?.fullName || user?.name,
                      customerEmail: user?.email,
                      customerPhone: formData.phone,
                      address: formData.address,
                      latitude: formData.latitude,
                      longitude: formData.longitude,
                      instructions: formData.instructions,
                      items: items
                    }}
                    onSuccess={handlePaymentSuccess}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-3 py-4 bg-green-500/20 rounded-xl text-green-400 border border-green-500/30"
                  >
                    <span className="text-2xl">✓</span>
                    <span className="font-semibold">Order Placed! Redirecting...</span>
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
