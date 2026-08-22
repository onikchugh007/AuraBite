import express from 'express'
import { checkMealSafety } from '../controllers/ai.controllers.js'

const aiRouter = express.Router()

aiRouter.post('/check-meal-safety', checkMealSafety)

export default aiRouter
