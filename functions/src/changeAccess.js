// for funcitons that handle initial payed sign up
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')

// Initialize Firestore
const db = getFirestore()
const getClaims = onCall(async (request) => {
  const email = request.data.email
  try {
    // get user
    const user = await getAuth().getUserByEmail(email)
    // init id
    const id = user.uid
    const claims = user.customClaims.claims

    return { claims, user, id, success: true }
  } catch (error) {
    throw new HttpsError('internal', 'Error changing user access: ' + error.message)
  }
})

const updateAccess = onCall(async (request) => {
  const data = request.data.data
  const email = request.data.data.email

  //   leave amd try to use this
  //   to see what error was
  const updatedClaims = {
    ...data,
  }
  delete data.email

  try {
    // get user
    const user = await getAuth().getUserByEmail(email)
    // init id
    const id = user.uid
    // spread out data
    await getAuth().setCustomUserClaims(id, {
      claims: {
        ...data,
      },
    })
    // get updated user
    const updatedUser = await getAuth().getUserByEmail(email)
    const dbUpdate = await updateDb(id, data)
    return { data, email, updatedUser, id, dbUpdate }
  } catch (error) {
    throw new HttpsError('internal', 'Error changing user access: ' + error.message)
  }
})

// we have to look on
// different parts of the
// documentation to find
// different parts to make the
// chain of code do what we
// want it to do
async function updateDb(id, updateData) {
  //.. loop and get if starts with
  try {
    const agentRef = db.collection('agents').doc(id)
    const doc = await agentRef.get()
    if (!doc.exists) {
      console.log('No such document!')
    } else {
      const exIstingClaims = doc.data().claims
      const res = await agentRef.update({
        claims: {
          ...exIstingClaims,
          admin: updateData.admin,
          ceo: updateData.ceo,
          manager: updateData.manager,
          sales: updateData.sales,
          superAdmin: updateData.superAdmin,
        },
      })
      return { data: doc.data(), exIstingClaims, updateData }
    }
  } catch (error) {
    throw new HttpsError('internal', 'Error changing user access: ' + error.message)
  }
}

module.exports = {
  getClaims,
  updateAccess,
}
