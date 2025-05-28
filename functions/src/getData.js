// for funcitons that handle initial payed sign up
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')

// Initialize Firestore
const db = getFirestore()

// get all agents by org
const getAllAgentsByOrg = onCall(async (request) => {
  const id = request.data.orgId

  const agentData = []
  //...
  try {
    const citiesRef = db.collection('agents')
    const snapshot = await citiesRef.where('orgId', '==', id).get()
    if (snapshot.empty) {
      console.log('No matching documents.')
      return
    }

    snapshot.forEach((doc) => {
      agentData.push({ id: doc.id, data: doc.data() })
      console.log(doc.id, '=>', doc.data())
    })
    return { success: true, res: request.data, id, agentData }
  } catch (error) {
    throw new HttpsError('internal', 'Error changing user access: ' + error.message)
  }
})

module.exports = {
  getAllAgentsByOrg,
}
