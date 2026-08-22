import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiCreditCard, FiLock } from 'react-icons/fi'
import { motion } from 'framer-motion'

const RazorpayPayment = ({ amount, orderData, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handlePayment = async () => {
    setLoading(true)
    try {
      // Create order on backend
      const { data } = await axios.post('/api/order/create', {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        ...orderData
      })

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'AuraBite Food Delivery',
        description: 'Order Payment',
        order_id: data.id,
        handler: async (response) => {
          // Verify payment
          try {
            const verifyData = await axios.post('/api/order/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.orderId
            })
            
            if (verifyData.data.success) {
              onSuccess(verifyData.data.order)
            }
          } catch (error) {
            console.error('Verification error:', error)
          }
        },
        prefill: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          contact: orderData.customerPhone
        },
        theme: {
          color: '#ff6b35'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePayment}
      disabled={loading}
      className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <FiLock className="w-5 h-5" />
          Pay Securely ${amount.toFixed(2)}
          <FiCreditCard className="w-5 h-5" />
        </>
      )}
    </motion.button>
  )
}

export default RazorpayPayment
