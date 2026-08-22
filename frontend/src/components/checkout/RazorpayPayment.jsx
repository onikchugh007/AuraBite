import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiCreditCard, FiLock } from 'react-icons/fi'
import { motion } from 'framer-motion'

const RazorpayPayment = ({ amount, orderData, onSuccess, paymentMethod = 'online' }) => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const navigate = useNavigate()

  const handlePayment = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const payload = {
        cartItems: (orderData.items || []).map(i => ({
          _id: i._id || i.id,
          id: i._id || i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          shop: i.shop || i.shopId
        })),
        paymentMethod: paymentMethod,
        deliveryAddress: {
          text: orderData.address || 'UPHC Nagra, Nandanpura Nagara Road, Railway Colony, Jhansi, UP',
          latitude: orderData.latitude || 25.4358,
          longitude: orderData.longitude || 78.5684
        },
        totalAmount: amount
      }

      const { data } = await axios.post('/api/order/place-order', payload)

      const orderId = data._id || data.orderId
      if (orderId) {
        onSuccess({ _id: orderId })
      } else {
        setErrorMsg('Failed to process order. Please try again.')
      }
    } catch (error) {
      console.error('Payment/Order placement error:', error)
      setErrorMsg(error.response?.data?.message || 'Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {errorMsg && (
        <p className="text-xs text-red-400 font-medium text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          {errorMsg}
        </p>
      )}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePayment}
        disabled={loading}
        className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-orange-500/20 cursor-pointer"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing Order...</span>
          </div>
        ) : (
          <>
            <FiLock className="w-5 h-5" />
            Pay & Place Order ₹{amount.toFixed(2)}
            <FiCreditCard className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </div>
  )
}

export default RazorpayPayment
