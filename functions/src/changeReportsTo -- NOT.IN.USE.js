// for funcitons that handle initial payed sign up
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')

// Initialize Firestore
const db = getFirestore()
const changeReportsTo = onCall(async (request) => {
  const { formData } = request.data

  const agent = formData.agent
  const newReportsTo = formData.newReportsTo

  const upDatedAgent = await updateAgentDoc(agent, newReportsTo)
  const upDatedOldRepTo = await updateOldRepToDoc(agent, newReportsTo)
  const upDatedNewRepTo = await updateNewRepToDoc(agent, newReportsTo)

  try {
    return {
      success: true,
      newReportsTo,
      agent,
      upDatedAgent,
      upDatedOldRepTo,
      upDatedNewRepTo,
    }
  } catch (error) {
    throw new HttpsError('internal', 'Error changing user access: ' + error.message)
  }
})

// update rep to object
async function updateAgentDoc(agent, newReportsTo) {
  try {
    const agentRef = db.collection('agents').doc(agent.agentId)

    const updatedRepTo = {
      id: newReportsTo.id,
      name: newReportsTo.name,
    }
    const res = await agentRef.update({
      reportsTo: updatedRepTo,
    })

    return res
  } catch (error) {
    throw new HttpsError(
      'internal',
      'Error updating reports to obj (agents): ' + error.message
    )
  }
}
// remove id from OLD rep to sub array
async function updateOldRepToDoc(agent, newReportsTo) {
  const managersRef = db.collection('agents').doc(agent.currentRepTo)
  const doc = await managersRef.get()
  if (!doc.exists) {
    console.log('No such document!')
  }

  try {
    const subArr = doc.data().subordinates

    const updatedArr = subArr.filter((id) => id !== agent.agentId)

    const res = await managersRef.update({
      subordinates: updatedArr,
    })
    return { res, updatedArr, subArr }
    //...
  } catch (error) {
    console.log(error)
    throw new HttpsError(
      'internal',
      'Error updating sub arr (old managers): ' + error.message
    )
  }
}
// add id to sub array in NEW managers array
async function updateNewRepToDoc(agent, newReportsTo) {
  // Fix for updateNewRepToDoc function
  try {
    const newManArray = db.collection('agents').doc(newReportsTo.id)
    const doc = await newManArray.get()

    if (!doc.exists) {
      console.log('No such document!')
      throw new HttpsError('not-found', 'Manager document not found')
    }

    // Initialize as empty array if undefined
    const subArr = doc.data().subordinates || []

    // Check if agent.agentId exists
    if (!agent.agentId) {
      throw new HttpsError('invalid-argument', 'Agent ID is undefined')
    }

    // Add the ID to the array
    subArr.push(agent.agentId)

    const res = await newManArray.update({
      subordinates: subArr,
    })

    return { subArr, res }
  } catch (error) {
    console.log(error)
    throw new HttpsError(
      'internal',
      'Error updating sub arr (new rep to): ' + error.message
    )
  }
}

module.exports = {
  changeReportsTo,
}
