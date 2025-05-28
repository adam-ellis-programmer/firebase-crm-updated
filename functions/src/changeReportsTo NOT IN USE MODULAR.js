const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')

// Initialize Firestore
const db = getFirestore()
// Idempotency
const changeReportsTo = onCall(async (request) => {
  const { formData } = request.data
  const agent = formData.agent
  const newReportsTo = formData.newReportsTo

  try {
    // Execute all updates in a single transaction
    const result = await executeTransaction(agent, newReportsTo)

    return {
      success: true,
      newReportsTo,
      agent,
      upDatedAgent: result.upDatedAgent,
      upDatedOldRepTo: result.upDatedOldRepTo,
      upDatedNewRepTo: result.upDatedNewRepTo,
    }
  } catch (error) {
    console.error('Transaction failed:', error)
    throw new HttpsError('internal', 'Error changing reports to: ' + error.message)
  }
})

// Main transaction function that coordinates the three update operations
async function executeTransaction(agent, newReportsTo) {
  return db.runTransaction(async (transaction) => {
    // Get document references
    const agentRef = db.collection('agents').doc(agent.agentId)
    const oldManagerRef = db.collection('agents').doc(agent.currentRepTo)
    const newManagerRef = db.collection('agents').doc(newReportsTo.id)

    // Get current document states
    const agentDoc = await transaction.get(agentRef)
    const oldManagerDoc = await transaction.get(oldManagerRef)
    const newManagerDoc = await transaction.get(newManagerRef)

    // Check document existence
    if (!oldManagerDoc.exists) {
      throw new HttpsError('not-found', 'Old manager document not found')
    }
    if (!newManagerDoc.exists) {
      throw new HttpsError('not-found', 'New manager document not found')
    }

    // Use our separate functions to prepare the updates
    const agentUpdate = prepareAgentUpdate(newReportsTo)
    const oldManagerUpdate = prepareOldManagerUpdate(agent, oldManagerDoc.data())
    const newManagerUpdate = prepareNewManagerUpdate(agent, newManagerDoc.data())

    // Apply all updates within the transaction
    transaction.update(agentRef, agentUpdate.updateData)
    transaction.update(oldManagerRef, oldManagerUpdate.updateData)
    transaction.update(newManagerRef, newManagerUpdate.updateData)

    // Return results
    return {
      upDatedAgent: agentUpdate.result,
      upDatedOldRepTo: oldManagerUpdate.result,
      upDatedNewRepTo: newManagerUpdate.result,
    }
  })
}

// Prepare agent document update
function prepareAgentUpdate(newReportsTo) {
  const updatedRepTo = {
    id: newReportsTo.id,
    name: newReportsTo.name,
  }

  return {
    updateData: { reportsTo: updatedRepTo },
    result: true,
  }
}

// Prepare old manager document update
function prepareOldManagerUpdate(agent, oldManagerData) {
  const subArr = oldManagerData.subordinates || []
  const updatedArr = subArr.filter((id) => id !== agent.agentId)

  return {
    updateData: { subordinates: updatedArr },
    result: { updatedArr, subArr },
  }
}

// Prepare new manager document update
function prepareNewManagerUpdate(agent, newManagerData) {
  // Initialize as empty array if undefined
  const subArr = newManagerData.subordinates || []

  // Check if agent.agentId exists
  if (!agent.agentId) {
    throw new HttpsError('invalid-argument', 'Agent ID is undefined')
  }

  // Only add if not already in the array
  if (!subArr.includes(agent.agentId)) {
    subArr.push(agent.agentId)
  }

  return {
    updateData: { subordinates: subArr },
    result: { subArr },
  }
}

// Original standalone functions (kept for reference, not used in transaction)
// They would be used if you need to perform these operations outside of a transaction

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
  } catch (error) {
    console.log(error)
    throw new HttpsError(
      'internal',
      'Error updating sub arr (old managers): ' + error.message
    )
  }
}

async function updateNewRepToDoc(agent, newReportsTo) {
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
