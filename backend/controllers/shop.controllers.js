import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// Helper to ensure shop has menu items populated with dietary and nutritional info
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

  const sampleItemsData = [
    {
      name: `${shop.name || 'Special'} Diabetic-Safe Pizza`,
      price: 249,
      category: 'Pizza',
      foodType: 'veg',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&fit=crop',
      dietaryTags: ['diabetic-friendly', 'gluten-free'],
      nutritionInfo: { calories: 320, carbsG: 28, proteinG: 14, fatG: 8, sodiumMg: 240, sugarG: 3, glycemicIndex: 40 }
    },
    {
      name: 'Keto High-Protein Chicken Bowl',
      price: 229,
      category: 'Main Course',
      foodType: 'non veg',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop',
      dietaryTags: ['keto', 'high-protein', 'diabetic-friendly', 'low-sodium'],
      nutritionInfo: { calories: 380, carbsG: 8, proteinG: 38, fatG: 16, sodiumMg: 210, sugarG: 2, glycemicIndex: 25 }
    },
    {
      name: 'Low-Sodium Paneer Tikka Salad',
      price: 219,
      category: 'North Indian',
      foodType: 'veg',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&fit=crop',
      dietaryTags: ['low-sodium', 'diabetic-friendly', 'high-protein', 'gluten-free'],
      nutritionInfo: { calories: 310, carbsG: 18, proteinG: 22, fatG: 12, sodiumMg: 180, sugarG: 3, glycemicIndex: 35 }
    },
    {
      name: 'Vegan Gluten-Free Hakka Noodles',
      price: 169,
      category: 'Chinese',
      foodType: 'veg',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&fit=crop',
      dietaryTags: ['vegan', 'gluten-free', 'nut-free'],
      nutritionInfo: { calories: 290, carbsG: 38, proteinG: 10, fatG: 6, sodiumMg: 260, sugarG: 3, glycemicIndex: 45 }
    },
    {
      name: 'Sugar-Free Avocado Berry Parfait',
      price: 129,
      category: 'Desserts',
      foodType: 'veg',
      image: 'https://images.unsplash.com/photo-1551024601-56377d7a17b9?w=500&fit=crop',
      dietaryTags: ['diabetic-friendly', 'keto', 'vegan', 'gluten-free'],
      nutritionInfo: { calories: 180, carbsG: 12, proteinG: 6, fatG: 9, sodiumMg: 45, sugarG: 2, glycemicIndex: 28 }
    }
  ]

  const createdIds = []
  for (const itemData of sampleItemsData) {
    const newItem = await Item.create({
      ...itemData,
      shop: shop._id
    })
    createdIds.push(newItem._id)
  }

  shop.items = createdIds
  await shop.save()
  await shop.populate('items')
  return shop
}

export const seedSampleShops = async () => {
  try {
    const count = await Shop.countDocuments()
    if (count > 0) {
      let shops = await Shop.find().populate('items')
      for (let i = 0; i < shops.length; i++) {
        if (!shops[i].items || shops[i].items.length === 0) {
          shops[i] = await ensureShopItems(shops[i])
        }
      }
      return shops
    }

    let owner = await User.findOne({ role: 'owner' })
    if (!owner) {
      owner = await User.findOne()
    }
    if (!owner) {
      owner = await User.create({
        fullName: 'Master Chef Owner',
        name: 'Master Chef Owner',
        email: 'chef@aurabite.com',
        password: 'password123',
        role: 'owner',
        mobile: '9876543210',
        city: 'New York'
      })
    }

    const sampleShops = [
      {
        name: 'NutriFit Gourmet & MedKitchen',
        city: 'New York',
        state: 'NY',
        address: '124 Wellness Boulevard, Downtown',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&fit=crop',
        owner: owner._id,
        itemsData: [
          {
            name: 'Diabetic-Safe Cauliflower Pizza',
            price: 249,
            category: 'Pizza',
            foodType: 'veg',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&fit=crop',
            dietaryTags: ['diabetic-friendly', 'gluten-free', 'keto'],
            nutritionInfo: { calories: 290, carbsG: 14, proteinG: 18, fatG: 12, sodiumMg: 220, sugarG: 2, glycemicIndex: 32 }
          },
          {
            name: 'Low-Sodium Grilled Salmon Bowl',
            price: 299,
            category: 'Main Course',
            foodType: 'non veg',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop',
            dietaryTags: ['low-sodium', 'high-protein', 'diabetic-friendly'],
            nutritionInfo: { calories: 410, carbsG: 12, proteinG: 42, fatG: 18, sodiumMg: 190, sugarG: 1, glycemicIndex: 22 }
          }
        ]
      }
    ]

    const createdShops = []
    for (const s of sampleShops) {
      const { itemsData, ...shopData } = s
      const shop = await Shop.create(shopData)

      const createdItems = []
      for (const item of itemsData) {
        const newItem = await Item.create({
          ...item,
          shop: shop._id
        })
        createdItems.push(newItem._id)
      }

      shop.items = createdItems
      await shop.save()
      await shop.populate('items')
      createdShops.push(shop)
    }

    return createdShops
  } catch (error) {
    console.error('Seed error:', error)
    return []
  }
}

export const getAllShops = async (req, res) => {
    try {
        let shops = await Shop.find().populate('items')
        if (!shops || shops.length === 0) {
            shops = await seedSampleShops()
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
            shops = await seedSampleShops()
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
            const allShops = await seedSampleShops()
            shop = allShops.find(s => String(s._id) === String(id)) || allShops[0]
        }
        shop = await ensureShopItems(shop)
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `get shop by id error ${error}` })
    }
}
