import express from 'express'
import { checkMealSafety, recommendVoiceFood } from '../controllers/ai.controllers.js'

const aiRouter = express.Router()

aiRouter.post('/check-meal-safety', checkMealSafety)
aiRouter.post('/voice-recommend', recommendVoiceFood)

export default aiRouter

