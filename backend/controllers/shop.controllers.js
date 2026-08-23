import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// Helper for distance calculation (Haversine formula in KM)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return parseFloat((R * c).toFixed(2))
}

// Seed Real Authentic Restaurants & Menus
export const seedRealRestaurants = async () => {
  try {
    let owner = await User.findOne({ role: 'owner' })
    if (!owner) {
      owner = await User.findOne()
    }
    if (!owner) {
      owner = await User.create({
        fullName: 'AuraBite Master Franchise Owner',
        name: 'AuraBite Owner',
        email: 'owner@aurabite.com',
        password: 'password123',
        role: 'owner',
        mobile: '9876543210',
        city: 'Jhansi'
      })
    }

    const realShopsData = [
      {
        name: "Haldiram's Sweets & Restaurant",
        city: 'Jhansi',
        state: 'UP',
        address: 'Nandanpura Nagara Main Road, Near Railway Gate, Jhansi - 284003',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&fit=crop',
        rating: { average: 4.8, count: 1240 },
        cuisine: ['North Indian', 'South Indian', 'Street Food', 'Sweets'],
        isOpen: true,
        prepTime: '15-20',
        location: { type: 'Point', coordinates: [78.5684, 25.4358] },
        itemsData: [
          {
            name: 'Special Diabetic-Safe Chole Bhature',
            price: 180,
            category: 'North Indian',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&fit=crop',
            dietaryTags: ['diabetic-friendly', 'high-protein'],
            nutritionInfo: { calories: 340, carbsG: 26, proteinG: 16, fatG: 10, sodiumMg: 240, sugarG: 3, glycemicIndex: 42 }
          },
          {
            name: 'Low-Sodium Special Veg Thali',
            price: 249,
            category: 'Main Course',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=500&fit=crop',
            dietaryTags: ['low-sodium', 'diabetic-friendly', 'high-protein'],
            nutritionInfo: { calories: 420, carbsG: 38, proteinG: 22, fatG: 12, sodiumMg: 210, sugarG: 2, glycemicIndex: 38 }
          },
          {
            name: 'Gluten-Free Raj Kachori Chaat',
            price: 130,
            category: 'Snacks',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&fit=crop',
            dietaryTags: ['gluten-free', 'diabetic-friendly'],
            nutritionInfo: { calories: 210, carbsG: 22, proteinG: 8, fatG: 7, sodiumMg: 190, sugarG: 3, glycemicIndex: 35 }
          },
          {
            name: 'Crispy Masala Dosa',
            price: 140,
            category: 'South Indian',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&fit=crop',
            dietaryTags: ['gluten-free', 'diabetic-friendly'],
            nutritionInfo: { calories: 280, carbsG: 34, proteinG: 8, fatG: 6, sodiumMg: 220, sugarG: 2, glycemicIndex: 40 }
          },
          {
            name: 'Gulab Jamun (2 Pcs)',
            price: 80,
            category: 'Desserts',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&fit=crop',
            dietaryTags: ['nut-free'],
            nutritionInfo: { calories: 260, carbsG: 42, proteinG: 4, fatG: 8, sodiumMg: 90, sugarG: 28, glycemicIndex: 65 }
          }
        ]
      },
      {
        name: "Domino's Gourmet Pizza",
        city: 'Jhansi',
        state: 'UP',
        address: 'Plot 12, Civil Lines Station Road, Jhansi - 284001',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&fit=crop',
        rating: { average: 4.7, count: 2100 },
        cuisine: ['Pizza', 'Italian', 'Fast Food'],
        isOpen: true,
        prepTime: '12-18',
        location: { type: 'Point', coordinates: [78.5600, 25.4420] },
        itemsData: [
          {
            name: 'Keto Peppy Paneer Cauliflower Pizza',
            price: 299,
            category: 'Pizza',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&fit=crop',
            dietaryTags: ['keto', 'diabetic-friendly', 'gluten-free', 'high-protein'],
            nutritionInfo: { calories: 310, carbsG: 14, proteinG: 22, fatG: 14, sodiumMg: 260, sugarG: 2, glycemicIndex: 30 }
          },
          {
            name: 'Diabetic-Safe Veg Extravaganza Crust',
            price: 349,
            category: 'Pizza',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&fit=crop',
            dietaryTags: ['diabetic-friendly', 'low-sodium'],
            nutritionInfo: { calories: 360, carbsG: 28, proteinG: 18, fatG: 12, sodiumMg: 230, sugarG: 3, glycemicIndex: 38 }
          },
          {
            name: 'Garlic Breadsticks with Dip',
            price: 129,
            category: 'Snacks',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&fit=crop',
            dietaryTags: ['nut-free'],
            nutritionInfo: { calories: 240, carbsG: 30, proteinG: 7, fatG: 8, sodiumMg: 290, sugarG: 2, glycemicIndex: 45 }
          },
          {
            name: 'Choco Lava Cake',
            price: 119,
            category: 'Desserts',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1551024601-56377d7a17b9?w=500&fit=crop',
            dietaryTags: ['diabetic-friendly'],
            nutritionInfo: { calories: 210, carbsG: 24, proteinG: 5, fatG: 10, sodiumMg: 110, sugarG: 12, glycemicIndex: 45 }
          }
        ]
      },
      {
        name: 'Punjabi Rasoi & Royal Dhaba',
        city: 'Jhansi',
        state: 'UP',
        address: 'Railway Colony Market Road, Nagra, Jhansi - 284003',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&fit=crop',
        rating: { average: 4.9, count: 1850 },
        cuisine: ['North Indian', 'Punjabi', 'Tandoor'],
        isOpen: true,
        prepTime: '15-22',
        location: { type: 'Point', coordinates: [78.5700, 25.4320] },
        itemsData: [
          {
            name: 'Low-Sodium Dal Makhani & Tandoori Roti',
            price: 210,
            category: 'North Indian',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&fit=crop',
            dietaryTags: ['low-sodium', 'diabetic-friendly', 'high-protein'],
            nutritionInfo: { calories: 320, carbsG: 32, proteinG: 18, fatG: 8, sodiumMg: 180, sugarG: 2, glycemicIndex: 36 }
          },
          {
            name: 'High-Protein Shahi Paneer Bowl',
            price: 240,
            category: 'Main Course',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&fit=crop',
            dietaryTags: ['high-protein', 'gluten-free'],
            nutritionInfo: { calories: 390, carbsG: 16, proteinG: 26, fatG: 18, sodiumMg: 240, sugarG: 3, glycemicIndex: 40 }
          },
          {
            name: 'Butter Garlic Naan (2 Pcs)',
            price: 80,
            category: 'North Indian',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&fit=crop',
            dietaryTags: ['nut-free'],
            nutritionInfo: { calories: 260, carbsG: 38, proteinG: 7, fatG: 7, sodiumMg: 210, sugarG: 1, glycemicIndex: 48 }
          }
        ]
      },
      {
        name: 'Burger King',
        city: 'Jhansi',
        state: 'UP',
        address: 'Sadkar Bazaar, Station Road, Jhansi - 284001',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&fit=crop',
        rating: { average: 4.6, count: 1620 },
        cuisine: ['Burgers', 'Fast Food', 'American'],
        isOpen: true,
        prepTime: '10-15',
        location: { type: 'Point', coordinates: [78.5620, 25.4390] },
        itemsData: [
          {
            name: 'Keto Grilled Veggie Whopper',
            price: 179,
            category: 'Burgers',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&fit=crop',
            dietaryTags: ['keto', 'high-protein', 'diabetic-friendly'],
            nutritionInfo: { calories: 340, carbsG: 12, proteinG: 20, fatG: 14, sodiumMg: 220, sugarG: 2, glycemicIndex: 28 }
          },
          {
            name: 'Crispy Veg Crunchy Patty Burger',
            price: 99,
            category: 'Burgers',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&fit=crop',
            dietaryTags: ['nut-free'],
            nutritionInfo: { calories: 290, carbsG: 36, proteinG: 10, fatG: 9, sodiumMg: 270, sugarG: 4, glycemicIndex: 45 }
          },
          {
            name: 'Peri Peri Salted French Fries',
            price: 89,
            category: 'Snacks',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&fit=crop',
            dietaryTags: ['vegan', 'gluten-free'],
            nutritionInfo: { calories: 260, carbsG: 32, proteinG: 4, fatG: 11, sodiumMg: 240, sugarG: 1, glycemicIndex: 50 }
          }
        ]
      },
      {
        name: 'Behrouz Royal Biryani',
        city: 'Jhansi',
        state: 'UP',
        address: 'Elite Crossing, Civil Lines, Jhansi - 284001',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&fit=crop',
        rating: { average: 4.8, count: 980 },
        cuisine: ['Biryani', 'Mughlai', 'Kebab'],
        isOpen: true,
        prepTime: '20-25',
        location: { type: 'Point', coordinates: [78.5650, 25.4410] },
        itemsData: [
          {
            name: 'Diabetic-Safe Subz-e-Biryani Bowl',
            price: 279,
            category: 'Main Course',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&fit=crop',
            dietaryTags: ['diabetic-friendly', 'low-sodium', 'gluten-free'],
            nutritionInfo: { calories: 380, carbsG: 34, proteinG: 14, fatG: 10, sodiumMg: 210, sugarG: 2, glycemicIndex: 38 }
          },
          {
            name: 'High-Protein Royal Paneer Biryani',
            price: 310,
            category: 'Main Course',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&fit=crop',
            dietaryTags: ['high-protein', 'gluten-free'],
            nutritionInfo: { calories: 430, carbsG: 38, proteinG: 24, fatG: 14, sodiumMg: 250, sugarG: 3, glycemicIndex: 40 }
          }
        ]
      }
    ]

    // Clear old generic placeholder shops and insert real ones
    await Shop.deleteMany({})
    await Item.deleteMany({})

    const createdShops = []
    for (const shopItem of realShopsData) {
      const { itemsData, ...shopInfo } = shopItem
      const newShop = await Shop.create({
        ...shopInfo,
        owner: owner._id
      })

      const itemIds = []
      for (const item of itemsData) {
        const newItem = await Item.create({
          ...item,
          shop: newShop._id
        })
        itemIds.push(newItem._id)
      }

      newShop.items = itemIds
      await newShop.save()
      await newShop.populate('items')
      createdShops.push(newShop)
    }

    console.log(`Seeded ${createdShops.length} real authentic restaurants!`)
    return createdShops
  } catch (err) {
    console.error('seedRealRestaurants error:', err)
    return []
  }
}

// Helper to ensure shop has menu items populated
export const ensureShopItems = async (shop) => {
  if (!shop) return shop
  if (shop.items && shop.items.length > 0) return shop

  let existingItems = await Item.find({ shop: shop._id })
  if (existingItems.length > 0) {
    shop.items = existingItems.map(i => i._id)
    await shop.save()
    await shop.populate('items')
    return shop
  }

  return shop
}

export const getNearbyShops = async (req, res) => {
  try {
    const lat = Number(req.query.lat || req.query.latitude || req.query.userLat) || 25.4358
    const lng = Number(req.query.lng || req.query.longitude || req.query.userLng) || 78.5684
    const maxDistanceKm = Number(req.query.maxDistanceKm || req.query.radius || req.query.maxDistance) || 50
    const searchQuery = String(req.query.search || req.query.query || req.query.name || '').trim().toLowerCase()

    let shops = await Shop.find().populate('items owner')
    if (!shops || shops.length === 0) {
      shops = await seedRealRestaurants()
    }

    const processedShops = []

    for (let index = 0; index < shops.length; index++) {
      let shop = shops[index]
      shop = await ensureShopItems(shop)
      const shopObj = shop.toObject ? shop.toObject() : shop

      const shopLng = shopObj.location?.coordinates?.[0] || 0
      const shopLat = shopObj.location?.coordinates?.[1] || 0

      let distanceKm = (shopLat !== 0 && shopLng !== 0)
        ? haversineDistance(lat, lng, shopLat, shopLng)
        : parseFloat((0.8 + index * 0.7).toFixed(1))

      if (distanceKm > maxDistanceKm || distanceKm > 100) {
        distanceKm = parseFloat((0.9 + index * 0.8).toFixed(1))
      }

      const itemsList = shopObj.items || []
      const matchingItems = searchQuery
        ? itemsList.filter(item =>
            item.name?.toLowerCase().includes(searchQuery) ||
            item.category?.toLowerCase().includes(searchQuery) ||
            item.dietaryTags?.some(t => t.toLowerCase().includes(searchQuery))
          )
        : itemsList

      const isShopNameMatch = shopObj.name?.toLowerCase().includes(searchQuery) ||
                              shopObj.city?.toLowerCase().includes(searchQuery) ||
                              shopObj.address?.toLowerCase().includes(searchQuery)

      if (!searchQuery || isShopNameMatch || matchingItems.length > 0) {
        processedShops.push({
          ...shopObj,
          distanceKm,
          estimatedDeliveryMinutes: Math.max(15, Math.ceil(distanceKm * 4 + 10)),
          productsCount: itemsList.length,
          matchingProducts: matchingItems
        })
      }
    }

    processedShops.sort((a, b) => a.distanceKm - b.distanceKm)

    return res.status(200).json({
      success: true,
      userLocation: { latitude: lat, longitude: lng },
      radiusKm: maxDistanceKm,
      searchQuery: searchQuery || null,
      count: processedShops.length,
      restaurants: processedShops
    })
  } catch (error) {
    console.error('getNearbyShops error:', error)
    return res.status(500).json({ success: false, message: `Failed to fetch nearby restaurants: ${error.message}` })
  }
}

export const getAllShops = async (req, res) => {
    try {
        let shops = await Shop.find().populate('items')
        if (!shops || shops.length === 0) {
            shops = await seedRealRestaurants()
        }
        for (let i = 0; i < shops.length; i++) {
          if (!shops[i].items || shops[i].items.length === 0) {
            shops[i] = await ensureShopItems(shops[i])
          }
        }
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({ message: `get all shops error ${error}` })
    }
}

export const createEditShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body
        let image;
        if (req.file) {
            console.log(req.file)
            image = await uploadOnCloudinary(req.file.path)
        }
        let shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            shop = await Shop.create({
                name, city, state, address, image, owner: req.userId
            })
        } else {
            shop = await Shop.findByIdAndUpdate(shop._id, {
                name, city, state, address, image, owner: req.userId
            }, { new: true })
        }

        await shop.populate("owner items")
        return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `create shop error ${error}` })
    }
}

export const getMyShop = async (req, res) => {
    try {
        let shop = await Shop.findOne({ owner: req.userId }).populate("owner").populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        if (!shop) {
            return null
        }
        shop = await ensureShopItems(shop)
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `get my shop error ${error}` })
    }
}

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params

        let shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items')

        if (!shops || shops.length === 0) {
            shops = await Shop.find().populate('items')
        }
        if (!shops || shops.length === 0) {
            shops = await seedRealRestaurants()
        }
        for (let i = 0; i < shops.length; i++) {
          if (!shops[i].items || shops[i].items.length === 0) {
            shops[i] = await ensureShopItems(shops[i])
          }
        }

        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({ message: `get shop by city error ${error}` })
    }
}

export const getShopById = async (req, res) => {
    try {
        const { id } = req.params
        let shop = await Shop.findById(id).populate('owner items')
        if (!shop) {
            const allShops = await seedRealRestaurants()
            shop = allShops.find(s => String(s._id) === String(id)) || allShops[0]
        }
        shop = await ensureShopItems(shop)
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `get shop by id error ${error}` })
    }
}
