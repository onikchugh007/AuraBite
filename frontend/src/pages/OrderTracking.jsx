import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import LiveTracking from '../components/tracking/LiveTracking'
import axios from 'axios'

const OrderTracking = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      let response
      try {
        response = await axios.get(`/api/order/${orderId}`)
      } catch {
        response = await axios.get(`/api/order/get-order-by-id/${orderId}`)
      }
      setOrder(response.data)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Could not load order tracking details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-4 border-orange-500/30 border-t-orange-500 rounded-full mb-4"
        />
        <p className="text-gray-400 font-medium animate-pulse">Loading live tracking details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4">
        <div className="max-w-md mx-auto text-center glass p-8 rounded-3xl border border-white/10">
          <FiAlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-400 mb-6">{error || "We couldn't find details for this order."}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchOrder}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <FiRefreshCw /> Retry
            </button>
            <Link
              to="/orders"
              className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium"
            >
              <FiArrowLeft /> Back to Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/orders"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                Live Order Tracking
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  LIVE
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-mono">
                Order #{order._id?.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Placed on:</span>
            <span className="font-semibold text-gray-200">
              {new Date(order.createdAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </motion.div>

        {/* Live Tracking Core Component */}
        <LiveTracking order={order} />
      </div>
    </div>
  )
}

export default OrderTracking
