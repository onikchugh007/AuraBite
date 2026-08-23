import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiCheckCircle, FiAlertTriangle, FiInfo, FiActivity,
  FiZap, FiShield, FiHeart, FiAward, FiArrowRight, FiCheck
} from 'react-icons/fi'
import axios from 'axios'

const AIMealSafetyModal = ({ item, onClose }) => {
  const [selectedConditions, setSelectedConditions] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const availableConditions = [
    { id: 'diabetes', label: 'Type 2 Diabetes / Low Sugar', icon: '🩸' },
    { id: 'hypertension', label: 'Hypertension / Low Sodium', icon: '🧂' },
    { id: 'celiac', label: 'Celiac / Gluten Sensitivity', icon: '🌾' },
    { id: 'keto', label: 'Keto / Low-Carb Diet', icon: '🥑' },
    { id: 'protein', label: 'High-Protein Muscle Gain', icon: '🏋️' }
  ]

  const toggleCondition = (condId) => {
    setSelectedConditions((prev) =>
      prev.includes(condId) ? prev.filter((c) => c !== condId) : [...prev, condId]
    )
  }

  const runAISafetyCheck = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/ai/check-meal-safety', {
        dishName: item?.name,
        nutritionInfo: item?.nutritionInfo || {
          calories: 350,
          carbsG: 35,
          proteinG: 15,
          fatG: 10,
          sodiumMg: 280,
          sugarG: 4,
          glycemicIndex: 42
        },
        dietaryTags: item?.dietaryTags || ['diabetic-friendly'],
        medicalConditions: selectedConditions
      })
      setResult(data)
    } catch (err) {
      console.error('AI Check Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runAISafetyCheck()
  }, [selectedConditions])

  const getScoreColor = (score) => {
    if (score >= 85) return 'from-emerald-500 to-green-500 text-emerald-400 border-emerald-500/30'
    if (score >= 60) return 'from-amber-500 to-yellow-500 text-amber-400 border-amber-500/30'
    return 'from-rose-600 to-red-500 text-rose-400 border-rose-500/30'
  }

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-2xl bg-[#121212] rounded-3xl p-6 border border-white/20 shadow-2xl overflow-hidden max-h-[88vh] overflow-y-auto my-auto text-white"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors cursor-pointer z-50 border border-white/10"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg border border-white/20 shrink-0">
            🥗
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-white">
              Full Nutrient & Health Check
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Evaluating <span className="text-orange-400 font-bold">{item?.name}</span> for your medical needs
            </p>
          </div>
        </div>

        {/* Medical Conditions Selector Chips */}
        <div className="mb-6 space-y-2.5 bg-zinc-900/80 p-4 rounded-2xl border border-white/10">
          <label className="block text-xs font-bold uppercase text-orange-400 tracking-wider flex items-center gap-1.5">
            <FiShield className="w-4 h-4" /> Select Your Medical Profile & Conditions:
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {availableConditions.map((cond) => {
              const isSelected = selectedConditions.includes(cond.id)
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => toggleCondition(cond.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/30 ring-2 ring-orange-500/30 scale-105'
                      : 'bg-zinc-800 text-gray-300 border-white/15 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <span>{cond.icon}</span>
                  <span>{cond.label}</span>
                  {isSelected && <FiCheck className="w-3.5 h-3.5 text-white ml-0.5" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* AI Loading State */}
        {loading && (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full mb-3"
            />
            <p className="text-sm font-semibold text-orange-400 animate-pulse">
              AI Analyzing Glycemic Index, Sodium, Carbs & Ingredients...
            </p>
          </div>
        )}

        {/* AI Result View */}
        {!loading && result && (
          <div className="space-y-5">
            {/* Safety Score Card */}
            <div
              className={`p-5 rounded-2xl border bg-gradient-to-r ${getScoreColor(
                result.safetyScore
              )}/10 flex flex-col sm:flex-row items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 bg-black/60 font-mono ${getScoreColor(
                    result.safetyScore
                  )}`}
                >
                  <span className="text-2xl font-black">{result.safetyScore}</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">/ 100</span>
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">{result.statusTitle}</h3>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Evaluated against <span className="font-bold text-orange-400">{selectedConditions.length}</span> active health criteria
                  </p>
                </div>
              </div>
            </div>

            {/* Health Safety Badges / Flags */}
            {result.flags && result.flags.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Verified Health Criteria:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.flags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5"
                    >
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      {flag.text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Health Warnings */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FiAlertTriangle className="w-4 h-4 text-rose-400" /> Medical Safety Warnings:
                </h4>
                <ul className="text-xs space-y-1 pl-5 list-disc text-gray-300">
                  {result.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Medical Recommendation */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiActivity className="w-4 h-4" /> Nutritional & Health Advice:
              </h4>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                "{result.aiRecommendation}"
              </p>
            </div>

            {/* Macro & Micronutrient Specs Meter Grid */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Detailed Nutritional Criteria Specs:
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                <div className="bg-zinc-900/90 p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] text-gray-400">Calories</p>
                  <p className="text-sm font-bold text-orange-400">{result.nutritionSummary.calories}</p>
                  <p className="text-[9px] text-gray-500">kcal</p>
                </div>
                <div className="bg-zinc-900/90 p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] text-gray-400">Carbs</p>
                  <p className="text-sm font-bold text-amber-400">{result.nutritionSummary.carbsG}g</p>
                  <p className="text-[9px] text-gray-500">Net Carbs</p>
                </div>
                <div className="bg-zinc-900/90 p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] text-gray-400">Protein</p>
                  <p className="text-sm font-bold text-green-400">{result.nutritionSummary.proteinG}g</p>
                  <p className="text-[9px] text-gray-500">Muscle</p>
                </div>
                <div className="bg-zinc-900/90 p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] text-gray-400">Sodium</p>
                  <p className="text-sm font-bold text-blue-400">{result.nutritionSummary.sodiumMg}</p>
                  <p className="text-[9px] text-gray-500">mg</p>
                </div>
                <div className="bg-zinc-900/90 p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] text-gray-400">Sugar</p>
                  <p className="text-sm font-bold text-purple-400">{result.nutritionSummary.sugarG}g</p>
                  <p className="text-[9px] text-gray-500">Added</p>
                </div>
                <div className="bg-zinc-900/90 p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] text-gray-400">Glycemic</p>
                  <p className="text-sm font-bold text-rose-400">{result.nutritionSummary.glycemicIndex}</p>
                  <p className="text-[9px] text-gray-500">GI Score</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default AIMealSafetyModal
