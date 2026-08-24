import Item from '../models/item.model.js'

// AI Meal Safety & Medical Nutrient Check Controller
export const checkMealSafety = async (req, res) => {
  try {
    const { dishName, nutritionInfo, dietaryTags = [], medicalConditions = [] } = req.body

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

    // 1. Diabetes Evaluation
    const isDiabetic = medicalConditions.some(c => /diabet|sugar|glucose/i.test(c))
    if (isDiabetic || dietaryTags.includes('diabetic-friendly')) {
      if (sugar <= 5 && gi <= 50) {
        flags.push({ type: 'success', text: `🩸 Diabetic-Safe (Low GI: ${gi}, Sugar: ${sugar}g)` })
        recommendations.push('Ideal choice for blood glucose management without glycemic spikes.')
      } else if (sugar > 12 || gi > 65) {
        score -= 25
        warnings.push(`High Glycemic Index (${gi}) and ${sugar}g sugar may cause blood glucose spikes.`)
      }
    }

    // 2. Hypertension Evaluation
    const isHypertension = medicalConditions.some(c => /pressure|hyper|sodium|heart/i.test(c))
    if (isHypertension || dietaryTags.includes('low-sodium')) {
      if (sodium <= 300) {
        flags.push({ type: 'success', text: `🧂 Low Sodium (${sodium}mg - Heart Safe)` })
        recommendations.push('Sodium content is well within AHA single-meal guidelines (<300mg).')
      } else if (sodium > 750) {
        score -= 30
        warnings.push(`High sodium content (${sodium}mg) exceeds single-meal limits for hypertension.`)
      }
    }

    // 3. Gluten & Keto Evaluation
    if (medicalConditions.some(c => /celiac|gluten/i.test(c))) {
      if (dietaryTags.includes('gluten-free')) {
        flags.push({ type: 'success', text: '🌾 Certified Gluten-Free' })
      } else {
        score -= 20
        warnings.push('Dish may contain wheat or gluten cross-contamination.')
      }
    }

    if (protein >= 25 || dietaryTags.includes('high-protein')) {
      flags.push({ type: 'success', text: `🏋️ High Protein Boost (${protein}g)` })
    }

    score = Math.max(10, Math.min(100, score))
    const statusTitle = score >= 85 ? '✅ Balanced & Safe Choice' : score >= 60 ? '⚡ Moderate Compatibility' : '⚠️ Health Warning: Medical Limit Exceeded'

    let aiAdvice = recommendations.join(' ') || 'Balanced macro profile with wholesome nutrients.'

    // Dynamic Gemini AI Nutritional Analysis
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
                  text: `Give 2 short sentences of nutritional advice for "${dishName}" (${calories} kcal, ${protein}g protein, ${carbs}g carbs) for conditions: ${medicalConditions.join(', ') || 'healthy diet'}.`
                }]
              }]
            })
          }
        )
        if (geminiRes.ok) {
          const data = await geminiRes.json()
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) aiAdvice = text.trim()
        }
      } catch (err) {
        console.warn('Gemini advice fallback:', err.message)
      }
    }

    return res.status(200).json({
      dishName: dishName || 'Gourmet Dish',
      safetyScore: score,
      statusTitle,
      flags,
      warnings,
      aiRecommendation: aiAdvice,
      nutritionSummary: { calories, carbsG: carbs, proteinG: protein, fatG: fat, sodiumMg: sodium, sugarG: sugar, glycemicIndex: gi }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// AI Voice Food Recommendation Controller
export const recommendVoiceFood = async (req, res) => {
  try {
    const { query = '', prompt = '' } = req.body
    const userPrompt = (query || prompt || '').trim().toLowerCase()

    if (!userPrompt) {
      return res.status(400).json({ message: 'Query is required' })
    }

    let allItems = await Item.find().populate('shop', 'name image address city')
    if (!allItems || allItems.length === 0) {
      const { seedRealRestaurants } = await import('./shop.controllers.js')
      await seedRealRestaurants()
      allItems = await Item.find().populate('shop', 'name image address city')
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim()
    if (apiKey && !apiKey.includes('add your')) {
      try {
        const itemsSummary = allItems.slice(0, 20).map(i => ({
          id: i._id.toString(),
          name: i.name,
          price: i.price,
          category: i.category,
          foodType: i.foodType
        }))

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `User query: "${userPrompt}". Menu: ${JSON.stringify(itemsSummary)}. Select up to 4 matching item IDs and a short spoken response in JSON: {"speechText":"...","recommendedItemIds":["id1"]}`
                }]
              }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          }
        )

        if (geminiRes.ok) {
          const data = await geminiRes.json()
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            const parsed = JSON.parse(text)
            const matchedItems = (parsed.recommendedItemIds || [])
              .map(id => allItems.find(item => item._id.toString() === id))
              .filter(Boolean)

            if (matchedItems.length > 0) {
              return res.status(200).json({
                speechText: parsed.speechText || 'Here are top picks for you!',
                recommendations: matchedItems
              })
            }
          }
        }
      } catch (err) {
        console.warn('Gemini recommend fallback:', err.message)
      }
    }

    // Heuristic Fallback
    const maxPriceMatch = userPrompt.match(/(?:under|below|less than|within|₹)\s*(\d+)/i)
    const maxPrice = maxPriceMatch ? parseInt(maxPriceMatch[1], 10) : null
    const foodType = /non veg|chicken|mutton/i.test(userPrompt) ? 'non veg' : /veg|paneer/i.test(userPrompt) ? 'veg' : null

    let filtered = allItems.filter(item => {
      if (maxPrice && item.price > maxPrice) return false
      if (foodType && item.foodType !== foodType) return false
      return true
    })

    if (filtered.length === 0) filtered = allItems.slice(0, 4)
    else filtered = filtered.slice(0, 4)

    return res.status(200).json({
      speechText: `Here are ${filtered.length} great picks matching your craving!`,
      recommendations: filtered
    })

  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
