const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')

// Initialize Firestore
const db = getFirestore()

const authTest = onCall(async (request) => {
  const id = request.data.id
  try {
    const citiesRef = db.collection('organizations')
    const snapshot = await citiesRef.where('organizationId', '==', id).get()

    if (snapshot.empty) {
      console.log('No matching documents.')
      return { msg: 'no matches found', data: request.data }
    }

    // Create an array to store all matching documents
    const matches = []
    snapshot.forEach((doc) => {
      matches.push({ id: doc.id, data: doc.data() })
    })

    // Return the matches array
    return { success: true, matches }
  } catch (error) {
    console.log(error)
    throw new HttpsError('internal', 'Error querying database: ' + error.message)
  }
})

const singleUpdate = onCall(async (request) => {
  const id = request.data.id
  try {
    // First get the document
    const querySnapshot = await db
      .collection('organizations')
      .where('organizationId', '==', id)
      .get()

    if (querySnapshot.empty) {
      throw new HttpsError('not-found', 'No matching document found')
    }

    // Get the first matching document and its data
    const docRef = querySnapshot.docs[0].ref
    const docData = querySnapshot.docs[0].data()

    // Get current value (default to 0 if it doesn't exist)
    const currentUsers = docData.accUsers || 0

    // Now update with incremented value
    const res = await docRef.update({
      accUsers: currentUsers + 1,
    })

    return { msg: 'success', currentUsers, newValue: currentUsers + 1, res }
  } catch (error) {
    console.log(error)
    throw new HttpsError('internal', 'Error updating document: ' + error.message)
  }
})

const simpleQuery = onCall(async (request) => {
  const data = []
  // [START firestore_query_filter_eq_string]
  // Create a reference to the cities collection
  const citiesRef = db.collection('organizations')

  // Create a query against the collection
  const queryRef = citiesRef.where('organizationId', '==', 'HEL--9223343305')
  // [END firestore_query_filter_eq_string]

  const res = await queryRef.get()
  res.forEach((doc) => {
    console.log(doc.id, ' => ', doc.data())
    data.push({ id: doc.id, data: doc.data() })
  })

  return { success: true, data }
})

module.exports = {
  authTest,
  singleUpdate,
  simpleQuery,
}
