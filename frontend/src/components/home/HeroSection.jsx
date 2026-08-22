import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowRight, FiPlay, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -100])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const floatingFoods = [
    { emoji: '🍕', delay: 0, x: 10, y: 20 },
    { emoji: '🍔', delay: 0.2, x: 80, y: 15 },
    { emoji: '🍜', delay: 0.4, x: 70, y: 60 },
    { emoji: '🥗', delay: 0.6, x: 15, y: 70 },
    { emoji: '🍱', delay: 0.8, x: 85, y: 75 },
    { emoji: '🌮', delay: 1, x: 50, y: 10 },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-accent to-secondary" />

        {/* Floating Food Emojis */}
        {floatingFoods.map((food, index) => (
          <motion.div
            key={index}
            className="absolute text-6xl opacity-20 select-none"
            style={{
              left: `${food.x}%`,
              top: `${food.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              delay: food.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {food.emoji}
          </motion.div>
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-orange-500/30 blur-3xl"
          style={{
            left: '10%',
            top: '20%',
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
          }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"
          style={{
            right: '20%',
            bottom: '10%',
            x: -mousePosition.x * 2,
            y: -mousePosition.y * 2,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            >
              <span className="flex items-center gap-1 text-orange-400">
                <FiStar className="w-4 h-4 fill-current" />
                <span className="text-sm font-semibold">4.9 Rating</span>
              </span>
              <span className="text-gray-400 text-sm">|</span>
              <span className="text-gray-300 text-sm">50K+ Happy Customers</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Taste the{' '}
              <span className="gradient-text">Extraordinary</span>
              <br />
              <span className="text-gray-400">Delivered to You</span>
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
              Experience culinary excellence with our curated selection of premium restaurants.
              From local favorites to gourmet delights, we bring the world to your doorstep.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/restaurants" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                Order Now
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <button className="flex items-center gap-3 px-6 py-4 rounded-xl glass hover:bg-white/10 transition-all group">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  <FiPlay className="w-5 h-5 fill-current" />
                </div>
                <span className="font-medium">Watch Video</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              {[
                { value: '500+', label: 'Restaurants' },
                { value: '30min', label: 'Avg Delivery' },
                { value: 'Free', label: 'Delivery' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - 3D Food Card */}
          <motion.div
            style={{ y: y1 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <motion.div
              className="relative w-full max-w-md"
              style={{
                rotateX: mousePosition.y * 0.5,
                rotateY: mousePosition.x * 0.5,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Main Food Image Card */}
              <div className="relative rounded-3xl overflow-hidden glass-strong p-2">
                <div className="relative rounded-2xl overflow-hidden aspect-square">
                  <img
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop"
                    alt="Delicious Food"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Floating Price Tag */}
                  <motion.div
                    className="absolute top-4 right-4 glass-strong px-4 py-2 rounded-xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span className="text-2xl font-bold gradient-text">$12.99</span>
                  </motion.div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold mb-1">Gourmet Pizza</h3>
                    <p className="text-sm text-gray-300">Italian Kitchen • 4.9 ★</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -left-8 top-1/4 glass-strong p-4 rounded-2xl"
                style={{ y: y2 }}
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 text-xl">🚀</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Fast Delivery</p>
                    <p className="text-xs text-gray-400">25-30 min</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-4 bottom-1/4 glass-strong p-4 rounded-2xl"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <span className="text-orange-400 text-xl">🔥</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Hot & Fresh</p>
                    <p className="text-xs text-gray-400">Just cooked</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
