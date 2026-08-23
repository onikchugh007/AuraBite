// AI Controller for Health & Medical Meal Safety Evaluation
import Item from '../models/item.model.js'
import Shop from '../models/shop.model.js'

export const checkMealSafety = async (req, res) => {
  try {
    const { dishName, nutritionInfo, dietaryTags = [], medicalConditions = [], customNote } = req.body

    const calories = Number(nutritionInfo?.calories) || 350
    const carbs = Number(nutritionInfo?.carbsG) || 35
    const protein = Number(nutritionInfo?.proteinG) || 15
    const fat = Number(nutritionInfo?.fatG) || 10
    const sodium = Number(nutritionInfo?.sodiumMg) || 280
    const sugar = Number(nutritionInfo?.sugarG) || 4
    const gi = Number(nutritionInfo?.glycemicIndex) || 42

    let score = 100
    const flags = []
    const warnings = []
    const recommendations = []

    // 1. Evaluate Diabetes (Type 1 / Type 2)
    const isDiabeticCondition = medicalConditions.some(c =>
      c.toLowerCase().includes('diabet') || c.toLowerCase().includes('sugar') || c.toLowerCase().includes('glucose')
    )
    if (isDiabeticCondition || dietaryTags.includes('diabetic-friendly')) {
      if (sugar <= 5 && gi <= 50) {
        flags.push({ type: 'success', text: `🩸 Diabetic-Safe (Low GI: ${gi}, Sugar: ${sugar}g)` })
        recommendations.push('Ideal choice for managing blood glucose without glycemic spikes.')
      } else if (sugar > 12 || gi > 65) {
        score -= 25
        warnings.push(`High Glycemic Index (${gi}) and ${sugar}g sugar may cause blood glucose spikes.`)
        recommendations.push('Consider pairing with extra green salad or fiber to slow glucose absorption.')
      } else {
        flags.push({ type: 'info', text: `Moderate GI (${gi})` })
      }
    }

    // 2. Evaluate Hypertension / High Blood Pressure (Sodium Check)
    const isHypertension = medicalConditions.some(c =>
      c.toLowerCase().includes('pressure') || c.toLowerCase().includes('hyper') || c.toLowerCase().includes('sodium') || c.toLowerCase().includes('heart')
    )
    if (isHypertension || dietaryTags.includes('low-sodium')) {
      if (sodium <= 300) {
        flags.push({ type: 'success', text: `🧂 Low Sodium (${sodium}mg - Heart Safe)` })
        recommendations.push('Sodium content is well within American Heart Association guidelines (<300mg per serving).')
      } else if (sodium > 750) {
        score -= 30
        warnings.push(`High sodium content (${sodium}mg) exceeds recommended single-meal limits for hypertension.`)
        recommendations.push('Request low-salt preparation or ask for sauces/gravies on the side.')
      } else {
        flags.push({ type: 'info', text: `Moderate Sodium (${sodium}mg)` })
      }
    }

    // 3. Evaluate Celiac / Gluten Sensitivity
    const isGlutenSensitive = medicalConditions.some(c =>
      c.toLowerCase().includes('gluten') || c.toLowerCase().includes('celiac')
    )
    if (isGlutenSensitive || dietaryTags.includes('gluten-free')) {
      if (dietaryTags.includes('gluten-free')) {
        flags.push({ type: 'success', text: '🌾 Certified Gluten-Free Ingredients' })
      } else {
        score -= 20
        warnings.push('Dish may contain wheat, gluten, or cross-contaminated kitchen surfaces.')
        recommendations.push('Specify "Strict Gluten-Free Preparation" in order instructions.')
      }
    }

    // 4. Evaluate Keto / Low Carb
    const isKeto = medicalConditions.some(c => c.toLowerCase().includes('keto'))
    if (isKeto || dietaryTags.includes('keto')) {
      if (carbs <= 15) {
        flags.push({ type: 'success', text: `🥑 Keto-Approved (${carbs}g Net Carbs)` })
      } else if (carbs > 30) {
        score -= 20
        warnings.push(`${carbs}g carbs may exceed single-meal limits for ketosis.`)
      }
    }

    // 5. Evaluate High Protein / Fitness Goal
    if (protein >= 25 || dietaryTags.includes('high-protein')) {
      flags.push({ type: 'success', text: `🏋️ High Protein Boost (${protein}g Protein)` })
    }

    // Determine final status
    score = Math.max(10, Math.min(100, score))
    let status = 'safe'
    let statusTitle = '✅ Balanced & Nutrient-Rich Meal Choice'

    if (score < 60) {
      status = 'unsafe'
      statusTitle = '⚠️ Health Warning: Medical Criteria Not Met'
    } else if (score < 85) {
      status = 'warning'
      statusTitle = '⚡ Moderate Compatibility: Consume with Care'
    }

    let aiRecommendationText = recommendations.join(' ')
    if (!aiRecommendationText) {
      aiRecommendationText = 'Balanced macro profile with wholesome nutrients for daily wellness.'
    }

    // Try calling Gemini AI for real-time nutritional insights
    const apiKey = (process.env.GEMINI_API_KEY || '').trim()
    if (apiKey && !apiKey.includes('add your')) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Provide 2 concise sentences of expert nutritional advice for the dish "${dishName}" with macros (${calories} kcal, ${protein}g protein, ${carbs}g carbs, ${fat}g fat) for health conditions: ${medicalConditions.join(', ')}.`
                }]
              }]
            })
          }
        )
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
          if (aiText) {
            aiRecommendationText = aiText.trim()
          }
        }
      } catch (err) {
        console.warn('Gemini nutrient check error:', err.message)
      }
    }

    return res.status(200).json({
      dishName: dishName || 'Gourmet Dish',
      safetyScore: score,
      safetyStatus: status,
      statusTitle,
      flags,
      warnings,
      aiRecommendation: aiRecommendationText,
      nutritionSummary: {
        calories,
        carbsG: carbs,
        proteinG: protein,
        fatG: fat,
        sodiumMg: sodium,
        sugarG: sugar,
        glycemicIndex: gi
      }
    })

  } catch (error) {
    console.error('AI Meal Safety check error:', error)
    return res.status(500).json({ message: `Safety Check failed: ${error.message}` })
  }
}

// Real AI Integration (Google Gemini & OpenRouter / Groq Endpoints)
const queryGeminiAI = async (userPrompt, items) => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim()
  if (!apiKey || apiKey.includes('add your')) {
    return null
  }

  const itemsSummary = items.slice(0, 20).map(i => ({
    id: i._id.toString(),
    name: i.name,
    price: i.price,
    category: i.category,
    foodType: i.foodType,
    rating: i.rating?.average || 4.5,
    shop: i.shop?.name || 'AuraBite Restaurant'
  }))

  const promptMessage = `You are Aura AI, a smart gourmet food assistant for AuraBite app.
The user asked: "${userPrompt}"

Here are available restaurant menu items:
${JSON.stringify(itemsSummary)}

Select up to 4 best matching item IDs and write an enthusiastic 1-2 sentence spoken response.
Respond strictly in JSON:
{
  "speechText": "Your short spoken response here",
  "recommendedItemIds": ["id1", "id2"]
}`

  // 1. Try Google Gemini REST API
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptMessage }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    )

    if (res.ok) {
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        return { data: JSON.parse(text), model: 'Google Gemini 1.5 Flash' }
      }
    }
  } catch (err) {
    console.warn('Gemini endpoint attempt:', err.message)
  }

  // 2. Try OpenRouter API endpoint
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [
          { role: 'user', content: promptMessage }
        ]
      })
    })

    if (res.ok) {
      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content
      if (content) {
        const cleanContent = content.replace(/```json|```/g, '').trim()
        return { data: JSON.parse(cleanContent), model: 'Gemini (OpenRouter AI)' }
      }
    }
  } catch (err) {
    console.warn('OpenRouter endpoint attempt:', err.message)
  }

  // 3. Try Groq / OpenAI Compatible endpoint
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: promptMessage }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (res.ok) {
      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content
      if (content) {
        return { data: JSON.parse(content), model: 'Groq Real AI' }
      }
    }
  } catch (err) {
    console.warn('Groq endpoint attempt:', err.message)
  }

  return null
}

// AI Controller for Voice Recommendations
export const recommendVoiceFood = async (req, res) => {
  try {
    const { query = '', prompt = '' } = req.body
    const userPrompt = (query || prompt || '').trim().toLowerCase()

    if (!userPrompt) {
      return res.status(400).json({ message: 'Prompt or transcript is required' })
    }

    // Fetch items from DB
    let allItems = await Item.find().populate('shop', 'name image address city')
    if (!allItems || allItems.length === 0) {
      const { seedRealRestaurants } = await import('./shop.controllers.js')
      await seedRealRestaurants()
      allItems = await Item.find().populate('shop', 'name image address city')
    }

    // 1. Try Real AI model first if API key configured
    const aiResponse = await queryGeminiAI(userPrompt, allItems)
    if (aiResponse && aiResponse.data) {
      const { speechText, recommendedItemIds = [] } = aiResponse.data
      const modelName = aiResponse.model || 'Google Gemini AI'

      const matchedItems = recommendedItemIds
        .map(id => allItems.find(item => item._id.toString() === id))
        .filter(Boolean)

      if (matchedItems.length > 0) {
        return res.status(200).json({
          speechText: speechText || `Here are top picks recommended by AI!`,
          query: userPrompt,
          isRealAI: true,
          aiModel: modelName,
          recommendations: matchedItems.map(item => ({
            _id: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            foodType: item.foodType,
            rating: item.rating || { average: 4.5, count: 50 },
            nutritionInfo: item.nutritionInfo,
            dietaryTags: item.dietaryTags,
            shop: item.shop ? {
              _id: item.shop._id,
              name: item.shop.name,
              city: item.shop.city
            } : null
          }))
        })
      }
    }

    // 2. Fallback heuristic scoring engine
    let maxPrice = null
    const priceMatch = userPrompt.match(/(?:under|below|less than|within|around|\$|₹)\s*(\d+)/i) || userPrompt.match(/(\d+)\s*(?:rupees|rs|dollars|\$)/i)
    if (priceMatch) {
      maxPrice = parseInt(priceMatch[1], 10)
    }

    let foodTypeFilter = null
    if (userPrompt.includes('non veg') || userPrompt.includes('chicken') || userPrompt.includes('mutton') || userPrompt.includes('meat') || userPrompt.includes('fish')) {
      foodTypeFilter = 'non veg'
    } else if (userPrompt.includes('veg') || userPrompt.includes('paneer') || userPrompt.includes('vegetarian')) {
      foodTypeFilter = 'veg'
    }

    const keywords = []
    const categoryList = ['Snacks', 'Main Course', 'Desserts', 'Pizza', 'Burgers', 'Sandwiches', 'South Indian', 'North Indian', 'Chinese', 'Fast Food']
    categoryList.forEach(cat => {
      if (userPrompt.includes(cat.toLowerCase())) keywords.push(cat)
    })

    if (userPrompt.includes('spicy') || userPrompt.includes('hot') || userPrompt.includes('chilli')) keywords.push('spicy')
    if (userPrompt.includes('healthy') || userPrompt.includes('fit') || userPrompt.includes('diet')) keywords.push('healthy')
    if (userPrompt.includes('sweet') || userPrompt.includes('dessert') || userPrompt.includes('cake') || userPrompt.includes('ice cream')) keywords.push('sweet')
    if (userPrompt.includes('cheap') || userPrompt.includes('budget') || userPrompt.includes('affordable')) keywords.push('budget')
    if (userPrompt.includes('protein') || userPrompt.includes('muscle')) keywords.push('high-protein')
    if (userPrompt.includes('quick') || userPrompt.includes('fast')) keywords.push('fast food')

    const scoredItems = allItems.map(item => {
      let score = 50
      const itemName = item.name.toLowerCase()
      const itemCategory = (item.category || '').toLowerCase()
      const itemPrice = item.price || 0

      if (maxPrice) {
        if (itemPrice <= maxPrice) score += 30
        else score -= 40
      }

      if (foodTypeFilter) {
        if (item.foodType === foodTypeFilter) score += 25
        else score -= 30
      }

      keywords.forEach(kw => {
        const kwLower = kw.toLowerCase()
        if (itemName.includes(kwLower) || itemCategory.includes(kwLower)) score += 20
        if (item.dietaryTags && item.dietaryTags.some(tag => tag.includes(kwLower))) score += 25
      })

      if (item.rating && item.rating.average >= 4.5) score += 15
      return { item, score }
    })

    let topMatches = scoredItems
      .filter(entry => entry.score > 20)
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item)

    if (topMatches.length < 3) {
      topMatches = allItems.slice(0, 4)
    } else {
      topMatches = topMatches.slice(0, 4)
    }

    let speechText = `I found ${topMatches.length} great food picks for you!`
    if (maxPrice && foodTypeFilter) {
      speechText = `Here are the top ${foodTypeFilter} dishes under ₹${maxPrice} based on your craving!`
    } else if (maxPrice) {
      speechText = `I found these tasty options under ₹${maxPrice}!`
    } else if (foodTypeFilter) {
      speechText = `Here are top rated ${foodTypeFilter} recommendations matching your request!`
    } else if (keywords.length > 0) {
      speechText = `Here are top recommendations for ${keywords.join(', ')}!`
    }

    return res.status(200).json({
      speechText,
      query: userPrompt,
      isRealAI: false,
      note: 'Add GEMINI_API_KEY to backend/.env to unlock real Gemini AI model responses!',
      detectedFilters: { maxPrice, foodType: foodTypeFilter, keywords },
      recommendations: topMatches.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        foodType: item.foodType,
        rating: item.rating || { average: 4.5, count: 50 },
        nutritionInfo: item.nutritionInfo,
        dietaryTags: item.dietaryTags,
        shop: item.shop ? {
          _id: item.shop._id,
          name: item.shop.name,
          city: item.shop.city
        } : null
      }))
    })

  } catch (error) {
    console.error('Voice recommendation error:', error)
    return res.status(500).json({ message: `Voice AI service error: ${error.message}` })
  }
}


