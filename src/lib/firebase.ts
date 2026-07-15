import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

// Firebase configuration for planning-with-ai-5e22a project
const firebaseConfig = {
  apiKey: "AIzaSyDJ4pRpeLqBhbHD4AACRd8JVzODrO3q1fQ",
  authDomain: "planning-with-ai-5e22a.firebaseapp.com",
  projectId: "planning-with-ai-5e22a",
  storageBucket: "planning-with-ai-5e22a.firebasestorage.app",
  messagingSenderId: "36656519176",
  appId: "1:36656519176:web:2ef73fd78a7451a5f519bd"
}

// Initialize Firebase
let app: FirebaseApp
let db: Firestore
let auth: Auth

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    console.log('Firebase initialized successfully')
  } else {
    app = getApps()[0]
    db = getFirestore(app)
    auth = getAuth(app)
  }
} catch (error) {
  console.error('Error initializing Firebase:', error)
  // Create placeholder instances that will be replaced when proper config is provided
  app = {} as FirebaseApp
  db = {} as Firestore
  auth = {} as Auth
}

export { app, db, auth, firebaseConfig }
