import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icons } from '../components/common/Icons';

/* --- Components defined for the GoldBite Home Page --- */

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <Icons.Star /> Premium Delivery
          </div>
          <h1>Gourmet Food<br />Delivered To<br />Your Door</h1>
          <p className="hero-desc">
            Experience restaurant-quality meals without leaving home. From sizzling steaks
            to fresh sushi, we deliver the finest flavors in under 30 minutes.
          </p>
          <div className="hero-actions">
            <Link to="/restaurants" className="btn-primary no-underline">
              Order Now <Icons.ArrowRight />
            </Link>
            <a href="#how" className="btn-secondary no-underline">How It Works</a>
          </div>
          <div className="hero-stats">
            <div className="stat-item"><h3>500+</h3><p>Restaurants</p></div>
            <div className="stat-item"><h3>25min</h3><p>Avg Delivery</p></div>
            <div className="stat-item"><h3>50k+</h3><p>Happy Customers</p></div>
          </div>
        </div>
        <div className="hero-image-wrap">
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=800&fit=crop" alt="Premium grilled steak" />
          </div>
          <div className="hero-floating-card hfc-1">
            <div className="hfc-icon"><Icons.Truck /></div>
            <div className="hfc-text"><h4>Free Delivery</h4><p>On orders over $35</p></div>
          </div>
          <div className="hero-floating-card hfc-2">
            <div className="hfc-icon"><Icons.Clock /></div>
            <div className="hfc-text"><h4>Fast Delivery</h4><p>Average 25 minutes</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const categories = [
    { name: 'Burgers', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
    { name: 'Pizza', img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&h=200&fit=crop' },
    { name: 'Sushi', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop' },
    { name: 'Steak', img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200&h=200&fit=crop' },
    { name: 'Salads', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop' },
    { name: 'Pasta', img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop' },
    { name: 'Dessert', img: 'https://images.unsplash.com/photo-1551024601-56377d7a17b9?w=200&h=200&fit=crop' },
    { name: 'Drinks', img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop' },
  ];
  const navigate = useNavigate();

  return (
    <section className="categories">
      <div className="section-header reveal">
        <span className="script-text">Cravings</span>
        <h2>Browse by Category</h2>
        <p>Explore our wide selection of cuisines from top-rated restaurants in your area.</p>
      </div>
      <div className="categories-grid">
        {categories.map((cat, idx) => (
          <div
            className="category-card reveal"
            key={idx}
            style={{ transitionDelay: `${idx * 0.1}s` }}
            onClick={() => navigate(`/restaurants?search=${cat.name}`)}
          >
            <div className="cat-circle"><img src={cat.img} alt={cat.name} /></div>
            <span>{cat.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRests = async () => {
      try {
        const { data } = await axios.get('/api/shop/get-by-city/New York');
        setRestaurants(data.slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch restaurants", err);
      }
    };
    fetchRests();
  }, []);

  const getDummyImg = (idx) => {
    const imgs = [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop'
    ];
    return imgs[idx % imgs.length];
  }

  if (restaurants.length === 0) return (
    <section className="featured" id="restaurants">
      <div className="section-header reveal active">
        <span className="script-text">Discover</span>
        <h2>Featured Restaurants</h2>
        <p>No restaurants found in New York yet. Check back soon!</p>
      </div>
    </section>
  );

  return (
    <section className="featured" id="restaurants">
      <div className="section-header reveal">
        <span className="script-text">Discover</span>
        <h2>Featured Restaurants</h2>
        <p>Hand-picked favorites delivering the best flavors to your neighborhood right now.</p>
      </div>
      <div className="restaurants-grid">
        {restaurants.map((r, idx) => (
          <div
            className="restaurant-card reveal"
            key={idx}
            style={{ transitionDelay: `${idx * 0.1}s` }}
            onClick={() => navigate(`/restaurant/${r._id}`)}
          >
            <div className="rest-img">
              <img src={r.image || getDummyImg(idx)} alt={r.name} />
              {idx === 0 && <span className="rest-badge">Top Rated</span>}
              {idx === 1 && <span className="rest-badge">Free Delivery</span>}
              <button className="rest-fav" onClick={(e) => { e.stopPropagation(); }}><Icons.Heart /></button>
            </div>
            <div className="rest-info">
              <h3>{r.name}</h3>
              <div className="rest-meta">
                <span className="rating"><Icons.Star /> {r.rating || (4.5 + idx * 0.1).toFixed(1)}</span>
                <span><Icons.Clock /> {r.deliveryTime || '20-30'} min</span>
                <span><Icons.Truck /> {idx % 2 === 0 ? 'Free' : '$1.99'}</span>
              </div>
              <div className="rest-tags">
                {(r.cuisine && r.cuisine.length > 0 ? r.cuisine : ['Gourmet', 'Specialty']).map((t, i) => (
                  <span className="tag" key={i}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/restaurants" className="btn-secondary no-underline">View All Restaurants</Link>
      </div>
    </section>
  );
}

function PopularDishes() {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const { data } = await axios.get('/api/item/get-by-city/New York');
        setDishes(data.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch dishes", err);
      }
    };
    fetchDishes();
  }, []);

  const dummyDishes = [
    { category: 'Trending', name: 'Wagyu Beef Burger', desc: 'Premium A5 wagyu patty with caramelized onions, aged cheddar, and truffle aioli on a brioche bun. Served with rosemary fries.', price: '$24', discount: '20% OFF', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop' },
    { category: "Chef's Pick", name: 'Truffle Ribeye Steak', desc: '12oz prime ribeye, grilled to perfection, topped with shaved black truffle and herb butter. Served with roasted garlic mashed potatoes.', price: '$48', discount: null, img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&h=500&fit=crop' },
    { category: 'Healthy', name: 'Salmon Poke Bowl', desc: 'Fresh Atlantic salmon, avocado, edamame, cucumber, and mango over sushi rice with sesame soy dressing and crispy shallots.', price: '$22', discount: 'NEW', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop' },
    { category: 'Sweet', name: 'Lava Cake Deluxe', desc: 'Warm chocolate cake with a molten center, paired with Madagascar vanilla ice cream and raspberry coulis.', price: '$14', discount: null, img: 'https://images.unsplash.com/photo-1551024601-56377d7a17b9?w=500&h=500&fit=crop' }
  ];

  const displayDishes = dishes.length > 0 ? dishes : dummyDishes;

  return (
    <section className="popular" id="dishes">
      <div className="section-header reveal">
        <span className="script-text">Menu</span>
        <h2>Popular Dishes</h2>
        <p>The most loved items from our top restaurants, delivered fresh and fast.</p>
      </div>
      <div className="dishes-grid">
        {displayDishes.map((dish, idx) => (
          <div className="dish-item reveal" key={idx}>
            <div className="dish-image">
              <div className="dish-plate"><img src={dish.image || dish.img} alt={dish.name} /></div>
              {(dish.discount || dish.tags?.[0]) && (
                <div className="dish-badge">
                  {(dish.discount || dish.tags?.[0]).split(' ')[0]}
                  <span>{(dish.discount || dish.tags?.[0]).split(' ')[1] || 'OFF'}</span>
                </div>
              )}
            </div>
            <div className="dish-content">
              <h3>{dish.category || 'Specialty'}</h3>
              <h4>{dish.name}</h4>
              <p>{dish.description || dish.desc}</p>
              <div className="dish-footer">
                <span className="dish-price">${dish.price}</span>
                <button className="btn-primary" onClick={() => { }}>Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: <Icons.UtensilsCrossed />, title: 'Choose', desc: 'Browse menus from hundreds of local restaurants and select your favorites.' },
    { icon: <Icons.ShoppingCartIcon />, title: 'Order', desc: 'Customize your meal, add to cart, and pay securely online or with cash.' },
    { icon: <Icons.MapPinIcon />, title: 'Track', desc: 'Follow your order in real-time from the kitchen to your doorstep.' },
    { icon: <Icons.Smile />, title: 'Enjoy', desc: 'Receive your food hot and fresh. Dig in and enjoy every bite!' }
  ];
  return (
    <section className="how-it-works" id="how">
      <div className="section-header reveal">
        <span className="script-text">Process</span>
        <h2>How It Works</h2>
        <p>Getting restaurant-quality food delivered is easier than ever. Just follow these simple steps.</p>
      </div>
      <div className="steps-grid">
        {steps.map((step, idx) => (
          <div className="step-card reveal" key={idx} style={{ transitionDelay: `${idx * 0.15}s` }}>
            <div className="step-num">{idx + 1}</div>
            <div className="step-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DownloadApp() {
  return (
    <section className="download-app">
      <div className="download-container">
        <div className="download-content reveal">
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
        <div className="download-image reveal">
          <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=700&fit=crop" alt="Food delivery app on phone" />
        </div>
      </div>
    </section>
  );
}

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
}

export default Home;
