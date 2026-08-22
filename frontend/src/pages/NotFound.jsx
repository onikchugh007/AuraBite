import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiArrowRight } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-9xl font-bold gradient-text mb-4 select-none">404</div>
        <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Oops! The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <FiHome className="w-5 h-5" />
          Back to Home
          <FiArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound
