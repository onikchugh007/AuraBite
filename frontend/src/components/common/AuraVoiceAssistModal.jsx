import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiMic, FiMicOff, FiSend, FiVolume2, FiVolumeX,
  FiShoppingBag, FiStar, FiZap, FiCheck, FiArrowRight
} from 'react-icons/fi'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../store/cartSlice'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AuraVoiceAssistModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [inputQuery, setInputQuery] = useState('')
  const [aiSpeechText, setAiSpeechText] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [addedItemIds, setAddedItemIds] = useState([])
  const [speechSupported, setSpeechSupported] = useState(true)

  const recognitionRef = useRef(null)

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        let currentTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript
        }
        setTranscript(currentTranscript)
        setInputQuery(currentTranscript)
      }

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } else {
      setSpeechSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) { }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Auto-speak AI response when it changes
  useEffect(() => {
    if (aiSpeechText && !isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(aiSpeechText)
      utterance.rate = 1.0
      utterance.pitch = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }, [aiSpeechText, isMuted])

  // Toggle Microphone
  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setTranscript('')
      setInputQuery('')
      setRecommendations([])
      setAiSpeechText('')
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
      }
    }
  }

  const [aiModelName, setAiModelName] = useState('Google Gemini AI')

  // Handle Query Submission
  const handleQuerySubmit = async (queryToSubmit) => {
    const text = (queryToSubmit || inputQuery || transcript).trim()
    if (!text) return

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    setIsThinking(true)
    setTranscript(text)
    setRecommendations([])

    try {
      const { data } = await axios.post('/api/ai/voice-recommend', {
        query: text
      })

      setAiSpeechText(data.speechText || 'Here are the best food recommendations for you!')
      setRecommendations(data.recommendations || [])
      if (data.aiModel) {
        setAiModelName(data.aiModel)
      } else {
        setAiModelName('Google Gemini AI Engine')
      }
    } catch (err) {
      console.error('Voice AI Error:', err)
      setAiSpeechText("Sorry, I had trouble finding dishes for that query. Try asking for spicy food, pizza, or budget meals!")
    } finally {
      setIsThinking(false)
    }
  }

  // Preset Prompts
  const presetQueries = [
    { label: '🌶️ Spicy food under ₹200', text: 'spicy food under 200' },
    { label: '🏋️ Healthy high-protein veg', text: 'healthy high protein veg' },
    { label: '🍕 Cheesy pizza or burger', text: 'cheesy pizza or burger' },
    { label: '🍰 Sweet low-sugar dessert', text: 'sweet low sugar dessert' }
  ]

  // Add Item to Cart
  const handleAddToCart = (item, e) => {
    e.stopPropagation()
    dispatch(addToCart(item))
    setAddedItemIds((prev) => [...prev, item._id])
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== item._id))
    }, 2000)
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0f0f13] rounded-3xl p-6 border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto my-auto text-white flex flex-col items-center"
      >
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-lg">
              <FiZap className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white flex items-center gap-1.5">
                Aura AI Voice Assist
              </h2>
              <p className="text-xs text-gray-400">No idea what to eat? Let AI handle it.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Mute Button */}
            <button
              onClick={() => {
                if (isSpeaking && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel()
                  setIsSpeaking(false)
                }
                setIsMuted(!isMuted)
              }}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${isMuted
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                  : 'bg-white/10 text-gray-200 border-white/10 hover:bg-white/20'
                }`}
              title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            >
              {isMuted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel()
                onClose()
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors cursor-pointer border border-white/10"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Glowing Fluid Orb Visualizer */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          {/* Outer Pulsing Glow Aura */}
          <motion.div
            animate={{
              scale: isListening ? [1, 1.25, 1] : isSpeaking ? [1, 1.15, 1] : [1, 1.05, 1],
              opacity: isListening ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3]
            }}
            transition={{ repeat: Infinity, duration: isListening ? 1.5 : 3, ease: 'easeInOut' }}
            className={`absolute w-44 h-44 rounded-full blur-2xl ${isListening
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600'
                : isThinking
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500'
                  : isSpeaking
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500'
                    : 'bg-gradient-to-r from-purple-600/40 via-indigo-600/40 to-cyan-600/40'
              }`}
          />

          {/* Rotating Holographic Glass Orb */}
          <motion.div
            animate={{
              rotate: isThinking ? 360 : [0, 180, 360],
              scale: isListening ? 1.1 : 1
            }}
            transition={{
              rotate: { repeat: Infinity, duration: isThinking ? 2 : 12, ease: 'linear' },
              scale: { duration: 0.3 }
            }}
            className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-2xl flex items-center justify-center border border-white/30 backdrop-blur-3xl"
          >
            <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden relative">
              {/* Internal Fluid Shimmer Layer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/30 to-rose-500/20 blur-md animate-pulse" />

              {/* Dynamic Icon inside Orb */}
              <div className="relative z-10 text-white text-3xl">
                {isThinking ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <FiZap className="text-amber-400" />
                  </motion.div>
                ) : isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <FiMic className="text-cyan-400" />
                  </motion.div>
                ) : isSpeaking ? (
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    <FiVolume2 className="text-emerald-400" />
                  </motion.div>
                ) : (
                  <FiZap className="text-purple-300 opacity-80" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Status Speech Caption */}
          <div className="mt-4 text-center">
            <p className="text-sm font-bold text-gray-200">
              {isListening
                ? "Go ahead, I'm listening..."
                : isThinking
                  ? "Analyzing food menu & finding recommendations..."
                  : isSpeaking
                    ? "Aura AI is speaking..."
                    : aiSpeechText
                      ? aiSpeechText
                      : "Tap microphone or type your craving below"}
            </p>

            {transcript && !aiSpeechText && (
              <p className="text-xs text-cyan-300 font-medium mt-1.5 max-w-md italic bg-cyan-950/40 px-3 py-1.5 rounded-full border border-cyan-500/30 inline-block">
                "{transcript}"
              </p>
            )}
          </div>
        </div>

        {/* Preset Prompt Chips */}
        <div className="w-full mb-4">
          <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1">
            <FiZap className="text-amber-400" /> Quick Voice Cravings:
          </p>
          <div className="flex flex-wrap gap-2">
            {presetQueries.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(preset.text)
                  handleQuerySubmit(preset.text)
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar with Mic & Send */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleQuerySubmit()
          }}
          className="w-full flex items-center gap-2 mb-6"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={speechSupported ? "Ask AI (e.g. 'spicy pasta under 250')..." : "Type your craving..."}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full bg-zinc-900/90 text-white placeholder-gray-500 text-sm rounded-2xl px-4 py-3 border border-white/15 focus:outline-none focus:border-cyan-500 transition-colors pr-10"
            />
          </div>

          {/* Mic Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-lg shrink-0 ${isListening
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white border-red-400 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400/40 hover:opacity-90'
                }`}
              title={isListening ? 'Stop Listening' : 'Start Listening'}
            >
              {isListening ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className="p-3 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold transition-colors shadow-lg cursor-pointer shrink-0"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>

        {/* Recommended Food Cards Carousel / Grid */}
        {recommendations.length > 0 && (
          <div className="w-full border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <FiShoppingBag /> Recommended Dishes ({recommendations.length})
              </h3>
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
                  onClose()
                  navigate('/restaurants')
                }}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                Browse All <FiArrowRight />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {recommendations.map((item) => {
                const isAdded = addedItemIds.includes(item._id)
                const shopId = item.shop?._id || item.shop
                return (
                  <div
                    key={item._id}
                    onClick={() => {
                      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
                      onClose()
                      if (shopId) {
                        navigate(`/restaurant/${shopId}`)
                      } else {
                        navigate('/restaurants')
                      }
                    }}
                    className="bg-zinc-900/90 rounded-2xl p-3 border border-white/10 hover:border-cyan-500/50 hover:bg-zinc-800/90 transition-all flex items-center gap-3 shadow-md group cursor-pointer"
                    title="Click to view this restaurant"
                  >
                    {/* Item Image */}
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                    />

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.foodType === 'veg' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{item.name}</h4>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{item.shop?.name || 'AuraBite Special'}</p>

                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-extrabold text-orange-400">₹{item.price}</span>
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                          <FiStar className="fill-amber-400 w-3 h-3" />
                          <span>{item.rating?.average || 4.5}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-md ${isAdded
                          ? 'bg-emerald-500 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      title="Add to Cart"
                    >
                      {isAdded ? <FiCheck className="w-4 h-4" /> : <FiShoppingBag className="w-4 h-4" />}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  )
}

export default AuraVoiceAssistModal
