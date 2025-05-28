// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
// const {REACT_APP_TYPE} = process.env

// SDK
import { getFirestore } from 'firebase/firestore' // database we are using
// can import admin sdk and then export it to the functions page
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  databaseURL: 'https://crm---v1-default-rtdb.europe-west1.firebasedatabase.app/',
}

// DATABASE_NAME.europe-west1.firebasedatabase.app
// Initialize Firebase
// passing the config into the firebase app
const app = initializeApp(firebaseConfig)

export const db = getFirestore()
export const database = getDatabase()
