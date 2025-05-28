const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')

// Initialize Firestore
const db = getFirestore()

const changeReportsTo = onCall(async (request) => {
  const { formData } = request.data
  const agent = formData.agent
  const newReportsTo = formData.newReportsTo

  try {
    // Create a transaction
    const result = await db.runTransaction(async (transaction) => {
      // Get references to all documents we'll be updating
      const agentRef = db.collection('agents').doc(agent.agentId)
      const oldManagerRef = db.collection('agents').doc(agent.currentRepTo)
      const newManagerRef = db.collection('agents').doc(newReportsTo.id)

      // Get the current data (within the transaction)
      const agentDoc = await transaction.get(agentRef)
      const oldManagerDoc = await transaction.get(oldManagerRef)
      const newManagerDoc = await transaction.get(newManagerRef)

      // Check that documents exist
      if (!oldManagerDoc.exists) {
        throw new HttpsError('not-found', 'Old manager document not found')
      }

      if (!newManagerDoc.exists) {
        throw new HttpsError('not-found', 'New manager document not found')
      }

      // Prepare updates (using our existing functions logic)
      const updatedRepTo = {
        id: newReportsTo.id,
        name: newReportsTo.name,
      }

      // ** delete
      // Get the old manager's subordinates and filter out the agent
      const oldManagerSubArr = oldManagerDoc.data().subordinates || []
      const updatedOldManagerSubArr = oldManagerSubArr.filter(
        (id) => id !== agent.agentId
      )

      // ** add
      // Get the new manager's subordinates and add the agent
      const newManagerSubArr = newManagerDoc.data().subordinates || []
      if (!newManagerSubArr.includes(agent.agentId)) {
        newManagerSubArr.push(agent.agentId)
      }

      // ** update
      // Set all updates in the transaction
      transaction.update(agentRef, {
        reportsTo: updatedRepTo,
      })

      transaction.update(oldManagerRef, {
        subordinates: updatedOldManagerSubArr,
      })

      transaction.update(newManagerRef, {
        subordinates: newManagerSubArr,
      })

      // Return the updated data
      return {
        updatedAgent: true,
        updatedOldRepTo: {
          updatedArr: updatedOldManagerSubArr,
          subArr: oldManagerSubArr,
        },
        updatedNewRepTo: {
          subArr: newManagerSubArr,
        },
      }
    })

    return {
      success: true,
      newReportsTo,
      agent,
      upDatedAgent: result.updatedAgent,
      upDatedOldRepTo: result.updatedOldRepTo,
      upDatedNewRepTo: result.updatedNewRepTo,
    }
  } catch (error) {
    console.error('Transaction failed:', error)
    throw new HttpsError('internal', 'Error changing reports to: ' + error.message)
  }
})

// For reference only - these functions have been integrated into the transaction above
// but are kept here for clarity on what each part is doing

// update rep to object in agent document
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
