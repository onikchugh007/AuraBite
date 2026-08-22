import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiClock, FiMapPin, FiStar, FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders/my-orders')
        setOrders(data)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter)

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-400'
      case 'cancelled': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-orange-400'
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-400">Track and manage all your orders</p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${filter === status
                  ? 'btn-primary'
                  : 'glass hover:bg-white/10'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
            </motion.button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full"
            />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 hover-lift cursor-pointer"
              >
                <Link to={`/track/${order._id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-bold text-lg">{order.restaurantName}</h3>
                        <span className={`font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{order.items?.length || 0} items</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-white">
                            ${order.totalAmount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mt-2">
                        Order ID: {order._id?.slice(-8)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {order.status === 'delivered' ? (
                          <div className="text-green-400 text-sm font-semibold">Delivered</div>
                        ) : (
                          <div className="text-orange-400 text-sm font-semibold">In Progress</div>
                        )}
                      </div>
                      <FiChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Start ordering from your favorite restaurants</p>
            <Link to="/restaurants" className="btn-primary inline-flex items-center gap-2">
              Browse Restaurants
              <FiChevronRight />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Orders
