import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { FiMic, FiZap } from 'react-icons/fi'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import AuraVoiceAssistModal from './components/common/AuraVoiceAssistModal'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Restaurants from './pages/Restaurants'
import RestaurantDetail from './pages/RestaurantDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderTracking from './pages/OrderTracking'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

// Protected Route
import ProtectedRoute from './components/auth/ProtectedRoute'

function AppContent() {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false)

  useEffect(() => {
    const handleOpenVoice = () => setIsVoiceOpen(true)
    window.addEventListener('open-voice-assist', handleOpenVoice)
    return () => window.removeEventListener('open-voice-assist', handleOpenVoice)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Main Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/track/:orderId" element={<OrderTracking />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Sticky Floating Mic Launcher Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-[99999]">
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-2xl shadow-orange-500/40 hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white/30 flex items-center justify-center relative group"
          title="Launch AI Voice Assist"
        >
          <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-orange-400 opacity-60"></span>
          <FiMic className="w-6 h-6 text-white relative z-10 group-hover:scale-110 transition-transform drop-shadow-md" />
        </button>
      </div>

      {/* AI Voice Assist Modal */}
      <AuraVoiceAssistModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <AppContent />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  )
}

export default App

