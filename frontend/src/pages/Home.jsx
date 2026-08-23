import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icons } from '../components/common/Icons';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <Icons.Star /> Premium Delivery
          </div>
          <h1>Real Gourmet Food<br />Delivered To<br />Your Door</h1>
          <p className="hero-desc">
            Order from top real restaurants nearby. From Haldiram's Chole Bhature to Domino's Pizza & Behrouz Biryani, delivered fresh in 25 minutes.
          </p>
          <div className="hero-actions">
            <Link to="/restaurants" className="btn-primary no-underline">
              Order Now <Icons.ArrowRight />
            </Link>
            <a href="#how" className="btn-secondary no-underline">How It Works</a>
          </div>
          <div className="hero-stats">
            <div className="stat-item"><h3>Real</h3><p>Local Shops</p></div>
            <div className="stat-item"><h3>20min</h3><p>Avg Delivery</p></div>
            <div className="stat-item"><h3>4.9★</h3><p>Top Ratings</p></div>
          </div>
        </div>
        <div className="hero-image-wrap">
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=800&fit=crop" alt="Real Gourmet Food" />
          </div>
          <div className="hero-floating-card hfc-1">
            <div className="hfc-icon"><Icons.Truck /></div>
            <div className="hfc-text"><h4>Free Delivery</h4><p>On orders over ₹199</p></div>
          </div>
          <div className="hero-floating-card hfc-2">
            <div className="hfc-icon"><Icons.Clock /></div>
            <div className="hfc-text"><h4>Fast Kitchen Prep</h4><p>15 mins average</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}




function Categories() {
  const categories = [
    { name: 'North Indian', img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&h=200&fit=crop' },
    { name: 'Pizza', img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&h=200&fit=crop' },
    { name: 'Burgers', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
    { name: 'Biryani', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop' },
    { name: 'Chinese', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' },
    { name: 'South Indian', img: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=200&h=200&fit=crop' },
    { name: 'Desserts', img: 'https://images.unsplash.com/photo-1551024601-56377d7a17b9?w=200&h=200&fit=crop' },
    { name: 'Snacks', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop' },
  ];
  const navigate = useNavigate();

  return (
    <section className="categories">
      <div className="section-header">
        <span className="script-text">Cravings</span>
        <h2>Explore Your Cravings</h2>
        <p>Explore wide food categories from real-time available restaurants near you.</p>
      </div>
      <div className="categories-grid">
        {categories.map((cat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="category-card cursor-pointer"
            key={idx}
            onClick={() => navigate(`/restaurants?search=${encodeURIComponent(cat.name)}`)}
          >
            <div className="cat-circle"><img src={cat.img} alt={cat.name} /></div>
            <span>{cat.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeaturedRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRests = async () => {
      try {
        setLoading(true);
        let res;
        try {
          res = await axios.get('/api/shop/nearby');
        } catch {
          res = await axios.get('/api/restaurants');
        }
        const data = res.data?.restaurants || res.data || [];
        setRestaurants(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch real-time restaurants", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRests();
  }, []);

  return (
    <section className="featured" id="restaurants">
      <div className="section-header">
        <span className="script-text">Discover</span>
        <h2>Discover Real Restaurants</h2>
        <p>Top real-time available restaurants near your location delivering hot & fresh right now.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3" />
          <p className="text-gray-400 text-sm animate-pulse">Loading nearby real restaurants...</p>
        </div>
      ) : (
        <div className="restaurants-grid">
          {restaurants.map((r, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="restaurant-card cursor-pointer"
              key={idx}
              onClick={() => navigate(`/restaurant/${r._id}`)}
            >
              <div className="rest-img">
                <img src={r.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'} alt={r.name} />
                {idx === 0 && <span className="rest-badge">Top Rated</span>}
                {idx === 1 && <span className="rest-badge">Free Delivery</span>}
                <button className="rest-fav" onClick={(e) => { e.stopPropagation(); }}><Icons.Heart /></button>
              </div>
              <div className="rest-info">
                <h3>{r.name}</h3>
                <p className="text-xs text-gray-400 mb-2 truncate">📍 {r.address || 'Nagra Main Road'}, {r.city || 'Jhansi'}</p>
                <div className="rest-meta">
                  <span className="rating"><Icons.Star /> {typeof r.rating === 'object' ? (r.rating?.average || 4.8) : (r.rating || 4.8)}</span>
                  <span><Icons.Clock /> {r.estimatedDeliveryMinutes || r.deliveryTime || 25} min</span>
                  <span><Icons.Truck /> Free Delivery</span>
                </div>
                <div className="rest-tags">
                  {(r.cuisine && r.cuisine.length > 0 ? r.cuisine : ['North Indian', 'Specialty']).map((t, i) => (
                    <span className="tag" key={i}>{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/restaurants" className="btn-secondary no-underline">View All Real Restaurants</Link>
      </div>
    </section>
  );
}

function PopularDishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        let res;
        try {
          res = await axios.get('/api/item/all');
        } catch {
          res = await axios.get('/api/item');
        }
        const data = res.data || [];
        setDishes(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch dishes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  }, []);

  return (
    <section className="popular" id="dishes">
      <div className="section-header">
        <span className="script-text">Menu</span>
        <h2>Popular Real Menu Items</h2>
        <p>The most loved gourmet dishes available right now from real restaurants.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3" />
          <p className="text-gray-400 text-sm animate-pulse">Loading popular menu items...</p>
        </div>
      ) : (
        <div className="dishes-grid">
          {dishes.map((dish, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="dish-item"
              key={idx}
            >
              <div className="dish-image">
                <div className="dish-plate"><img src={dish.image} alt={dish.name} /></div>
                {dish.dietaryTags?.[0] && (
                  <div className="dish-badge">
                    {dish.dietaryTags[0]}
                  </div>
                )}
              </div>
              <div className="dish-content">
                <h3>{dish.category || 'Specialty'}</h3>
                <h4>{dish.name}</h4>
                <p className="text-xs text-gray-400 mb-2">🔥 {dish.nutritionInfo?.calories || 320} kcal • 🌾 {dish.nutritionInfo?.carbsG || 28}g Carbs</p>
                <div className="dish-footer">
                  <span className="dish-price">₹{dish.price}</span>
                  <button
                    className="btn-primary cursor-pointer"
                    onClick={() => dispatch(addToCart({ ...dish, quantity: 1 }))}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: <Icons.UtensilsCrossed />, title: 'Choose', desc: 'Browse real menus from top restaurants in your area.' },
    { icon: <Icons.ShoppingCartIcon />, title: 'Order', desc: 'Customize your meal, add to cart, and pay securely online or with cash.' },
    { icon: <Icons.MapPinIcon />, title: 'Track', desc: 'Follow your rider in real-time on OpenStreetMap from kitchen to door.' },
    { icon: <Icons.Smile />, title: 'Enjoy', desc: 'Receive your food hot and fresh. Dig in and enjoy every bite!' }
  ];
  return (
    <section className="how-it-works" id="how">
      <div className="section-header">
        <span className="script-text">Process</span>
        <h2>How It Works</h2>
        <p>Getting restaurant-quality food delivered is easier than ever. Just follow these simple steps.</p>
      </div>
      <div className="steps-grid">
        {steps.map((step, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="step-card"
            key={idx}
          >
            <div className="step-num">{idx + 1}</div>
            <div className="step-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function DownloadApp() {
  return (
    <section className="download-app">
      <div className="download-container">
        <div className="download-content">
          <span className="script-text">Get The App</span>
          <h2>Order Faster &<br />Track in Real-Time</h2>
          <p>
            Download our app for the best experience. Get exclusive deals, save your
            favorite orders, and track deliveries live from your phone.
          </p>
          <div className="store-btns">
            <a href="#" className="store-btn no-underline">
              <Icons.Apple />
              <div><span>Download on the</span><strong>App Store</strong></div>
            </a>
            <a href="#" className="store-btn no-underline">
              <Icons.Play />
              <div><span>Get it on</span><strong>Google Play</strong></div>
            </a>
          </div>
        </div>
        <div className="download-image">
          <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=700&fit=crop" alt="Food delivery app on phone" />
        </div>
      </div>
    </section>
  );
}

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="app"
    >
      <Hero />
      <Categories />
      <FeaturedRestaurants />
      <PopularDishes />
      <HowItWorks />
      <DownloadApp />
    </motion.div>
  );
};

export default Home;

