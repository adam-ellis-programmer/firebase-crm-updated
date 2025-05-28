// functions/firebase.config.js
const admin = require('firebase-admin')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')
// Initialize without config since we're using service account credentials
admin.initializeApp()

const db = admin.firestore()

module.exports = { db, admin, getFirestore, getAuth } // Export both db and admin
