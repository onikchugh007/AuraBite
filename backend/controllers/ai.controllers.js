// AI Controller for Health & Medical Meal Safety Evaluation

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
    let statusTitle = '✅ Safe & Highly Recommended for Your Health Profile'

    if (score < 60) {
      status = 'unsafe'
      statusTitle = '⚠️ Health Warning: Medical Criteria Not Met'
    } else if (score < 85) {
      status = 'warning'
      statusTitle = '⚡ Moderate Compatibility: Consume with Care'
    }

    if (recommendations.length === 0) {
      recommendations.push('Balanced macro profile with wholesome nutrients for daily wellness.')
    }

    return res.status(200).json({
      dishName: dishName || 'Gourmet Dish',
      safetyScore: score,
      safetyStatus: status,
      statusTitle,
      flags,
      warnings,
      aiRecommendation: recommendations.join(' '),
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
    return res.status(500).json({ message: `AI Safety Check failed: ${error.message}` })
  }
}
