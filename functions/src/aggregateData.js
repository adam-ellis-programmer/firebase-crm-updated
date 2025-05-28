const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')

// Initialize Firestore
const db = getFirestore()

const adminAddUser = onCall(async (request) => {
  //...
  return { success: true }
})

// as we need live logs
// this can not be done
// and tested on the server
// data needs to be
// replecated localy
// get the data aggregation finished 
// on the client and come back to this 
// 
async function processData() {
  const result = {
    yearOrders: [],
    monthOrders: [],
    weekOrders: [],
    todayOrders: [],
    hourOrders: [], // New array for current hour's orders
  }

  const dataRef = db.collection('products')
  const snapshot = await dataRef.where('capital', '==', true).get()
  if (snapshot.empty) {
    console.log('No matching documents.')
    return
  }

  // in this loop we route the docs to
  // the specific arrays
  snapshot.forEach((doc) => {
    console.log(doc.id, '=>', doc.data())
  })
  //...
  return { result }
}

throw new Error('Failed to create database entry')
