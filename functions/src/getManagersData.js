// for funcitons that handle initial payed sign up
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')

// Initialize Firestore
const db = getFirestore()
// all data for team manager
const getManagersData = onCall(async (request) => {
  const managersId = request.data.data.managersId
  const orgId = request.data.data.orgId
  const data = request.data.data
  const auth = request.auth.token.claims

  // managers id needs to be changed to whoeveris logged in
  // not the compnay id

  const clients = await getData(managersId, orgId)
  //...
  try {
    return { orgId, managersId, data: request.data, data, clients, auth }
  } catch (error) {
    console.log(error)
    throw new HttpsError('internal', 'Error creating new user: ' + error.message)
  }
})

// test
// !Array.isArray(clients))
// used in reports to page
async function getData(managersId, orgId) {
  const clients = []
  const dataRef = db.collection('customers')
  const snapshot = await dataRef
    // check org
    .where('orgId', '==', orgId)
    // check managers
    .where('reportsTo.id', '==', managersId)
    .get()
  if (snapshot.empty) {
    console.log('No matching documents.')
    return
  }

  snapshot.forEach((doc) => {
    console.log(doc.id, '=>', doc.data())
    clients.push({ id: doc.id, data: doc.data() })
  })

  return clients
}

module.exports = {
  getManagersData,
}
