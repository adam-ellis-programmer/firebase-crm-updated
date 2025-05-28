// for funcitons that handle initial payed sign up
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')

// Initialize Firestore
const db = getFirestore()
const deleteAgent = onCall(async (request) => {
  const { email, orgId, agentId, handBackData } = request.data

  try {
    // get user before actual deletion
    const user = await getAuth().getUserByEmail(email)
    // get agent to delte id
    const agentToDeleteID = user.uid
    // remove agent id from managers subordinate array
    const getAgentDeleteData = await deleteSubordinateDB(agentToDeleteID)
    // Create array of operations
    const operations = await Promise.all([
      getAuth().getUserByEmail(email), // not used (get user)
      getAuth().deleteUser(agentToDeleteID), // delete auth
      deleteFromDB(agentToDeleteID), // delete from db
      handleOrgDocUpdate(orgId), // update the org record
      // handles delted agents customers
      changeManager(orgId, agentId, handBackData?.name || 'back to org'),
    ])

    const [toDeleteDetails, deleted, dBDelete, updData, updRecords] = operations

    const tempId = toDeleteDetails.uid
    return {
      tempId,
      success: true,
      user,
      agentToDeleteID,
      deleted,
      dBDelete,
      updData,
      updRecords,
      agentId,
      orgId,
      toDeleteDetails,
      getAgentDeleteData,
    }
  } catch (error) {
    console.error('Delete agent error:', error)
    throw new HttpsError('internal', `Error deleting user: ${error.message}`)
  }
})
// update organizations doc accUsers -1
// loop through and change
//  -- agentUid to org owner
//  -- reportsTo to org owner

// ==============
// delete agent from db
// ==============
async function deleteFromDB(id) {
  try {
    const res = await db.collection('agents').doc(id).delete()
    return { success: true, res }
  } catch (error) {
    console.log(error)
    throw new HttpsError(
      'internal',
      'Error deleting userhandleOrgDocUpdate deleteFromDB: ' + error.message
    )
  }
}

// opdate org doc
async function handleOrgDocUpdate(id) {
  try {
    // get organizations doc
    const orgRef = db.collection('organizations').doc(id)
    const doc = await orgRef.get()
    if (!doc.exists) {
      console.log('No such document!')
    } else {
      console.log('Document data:', doc.data())
      const oldAccUsers = doc.data().accUsers
      // update org record
      const res = await orgRef.update({ accUsers: oldAccUsers - 1 })
      return { success: true, id, document: doc.data(), res }
    }
  } catch (error) {
    throw new HttpsError(
      'internal',
      'Error deleting userhandleOrgDocUpdate handleOrgDocUpdate: ' + error.message
    )
  }
}

// loop docs and change manager
async function changeManager(orgId, repId, repName) {
  try {
    const custRef = db.collection('customers')
    const snapshot = await custRef
      .where('orgId', '==', orgId)
      .where('reportsTo.id', '==', repId)
      .get()

    if (snapshot.empty) {
      console.log('No matching documents.')
      return { message: 'No documents to update' }
    }

    const updatePromises = snapshot.docs.map((doc) =>
      doc.ref.update({
        reportsTo: {
          id: repId,
          name: repName,
        },
      })
    )

    await Promise.all(updatePromises)
    return {
      success: true,
      message: `Updated ${snapshot.size} documents`,
    }
  } catch (error) {
    throw new HttpsError('internal', 'Error deleting user: ' + error.message)
  }
}

// delete id from subordinate
// more clear parm names
// managerId: COMP-WAXC-KUXUU2EOjWgXC01ec24w
// agentId:
async function deleteSubordinateDB(agentId) {
  // get doc to get reportsToId (managerId)
  const agentRef = db.collection('agents').doc(agentId)
  const doc = await agentRef.get()
  if (!doc.exists) {
    return {
      success: false,
      msg: 'no document found ',
    }
  }

  const reportsToId = doc.data().reportsTo.id

  const managersRef = db.collection('agents').doc(reportsToId)
  const managersDoc = await managersRef.get()

  if (!managersDoc.exists) {
    throw new Error('No such document!')
  }

  const managersData = managersDoc.data()

  const subordinatesArray = managersData.subordinates

  const updatedArray = subordinatesArray.filter((id) => id !== agentId)

  // filter or splice the subordinates array
  // ...
  await managersRef.update({
    subordinates: updatedArray,
  })

  return {
    data: doc.data(),
    reportsTo: doc.data().reportsTo,
    reportsToId,
    success: true,
    managerData: managersData,
    subordinatesArray,
    updatedArray,
  }
}

module.exports = {
  deleteAgent,
}
