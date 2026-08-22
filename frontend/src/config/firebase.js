import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpVulkEBigH_Wzr0nurrOoIOkW3M8sBEI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vingo-de19f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vingo-de19f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vingo-de19f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "946911885682",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:946911885682:web:a087dfa39757b819f045eb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QFG6Y239H9"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
