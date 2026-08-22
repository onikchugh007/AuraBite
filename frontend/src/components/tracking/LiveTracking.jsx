import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiClock, FiMapPin, FiPhone, FiMessageSquare, FiStar } from 'react-icons/fi'
import { useSocket } from '../../context/SocketContext'

const LiveTracking = ({ order }) => {
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(order?.estimatedTime || 25)
  const socket = useSocket()

  useEffect(() => {
    if (socket) {
      socket.on('updateDeliveryLocation', (data) => {
        if (data.deliveryBoyId === order?.deliveryBoyId) {
          setDeliveryLocation({
            lat: data.latitude,
            lng: data.longitude
          })
        }
      })
    }
    return () => socket?.off('updateDeliveryLocation')
  }, [socket, order?.deliveryBoyId])

  const steps = [
    { status: 'confirmed', label: 'Order Confirmed', time: '12:30 PM' },
    { status: 'preparing', label: 'Preparing', time: '12:35 PM' },
    { status: 'ready', label: 'Ready for Pickup', time: '12:45 PM' },
    { status: 'out_for_delivery', label: 'Out for Delivery', time: '12:50 PM' },
    { status: 'delivered', label: 'Delivered', time: '1:10 PM' },
  ]

  const currentStepIndex = steps.findIndex(s => s.status === order?.status)

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Map Section */}
      <div className="lg:col-span-2 rounded-3xl overflow-hidden glass h-[500px] relative bg-accent flex items-center justify-center">
        {deliveryLocation ? (
          <div className="w-full h-full relative">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890!2d-74.0060!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjMiTiA3NMKwMDAnMjEuNiJX!5e0!3m2!1sen!2sus!4v1234567890"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <FiMapPin className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-gray-400">Initializing live tracking...</p>
          </div>
        )}

        {/* ETA Overlay */}
        <div className="absolute top-4 left-4 glass-strong px-6 py-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center animate-pulse-glow">
              <FiClock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Estimated Arrival</p>
              <p className="text-2xl font-bold gradient-text">{estimatedTime} min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Info */}
      <div className="space-y-4">
        {/* Delivery Partner Card */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-4">Delivery Partner</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xl font-bold">
              {order?.deliveryBoyName?.[0] || 'D'}
            </div>
            <div>
              <p className="font-semibold">{order?.deliveryBoyName || 'David'}</p>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                <span>4.9</span>
                <span>•</span>
                <span>2.5k deliveries</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <FiPhone className="w-5 h-5" />
              Call
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <FiMessageSquare className="w-5 h-5" />
              Chat
            </button>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-4">Order Status</h3>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-colors ${index <= currentStepIndex
                        ? 'bg-orange-500 border-orange-500'
                        : 'bg-transparent border-gray-600'
                      }`}
                  />
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 my-1 transition-colors ${index < currentStepIndex ? 'bg-orange-500' : 'bg-gray-700'
                        }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p
                    className={`font-medium ${index <= currentStepIndex ? 'text-white' : 'text-gray-500'
                      }`}
                  >
                    {step.label}
                  </p>
                  {index <= currentStepIndex && (
                    <p className="text-sm text-gray-400">{step.time}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveTracking
