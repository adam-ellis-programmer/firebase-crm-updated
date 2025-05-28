// for funcitons that handle initial payed sign up
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')
const { ROLES } = require('./roles')
const { setAccess } = require('./setAgentPermissions')

// Initialize Firestore
const db = getFirestore()
const getRolesData = onCall(async (request) => {
  const { orgId } = request.data

  try {
    const agents = await getAgents(orgId)

    return {
      roles: ROLES,
      agents,
    }
  } catch (error) {
    console.log(error)
    throw new HttpsError('internal', `Error Geting access data: ${error.message}`)
  }
})

const getAllAgents = onCall(async (request) => {
  const { orgId } = request.data

  try {
    const agents = await getAgents(orgId)

    return { agents, success: true }
  } catch (error) {
    console.log(error)
    throw new HttpsError('internal', `Error Geting agents data: ${error.message}`)
  }
})

async function getAgents(orgId) {
  const agents = []
  try {
    // add .where here
    const agentsRef = db.collection('agents').where('claims.orgId', '==', orgId)
    const snapshot = await agentsRef.get()
    snapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data())
      agents.push({ id: doc.id, data: doc.data() })
    })

    return agents
  } catch (error) {
    throw new HttpsError('internal', `Error Geting agents data: ${error.message}`)
  }
}

// =============
// get single agent to update claims
// =============
const getAgentData = onCall(async (request) => {
  const { agentId } = request.data
  try {
    const agentRef = db.collection('agents').doc(agentId)
    const doc = await agentRef.get()
    if (!doc.exists) {
      return { success: false, msg: 'no such document' }
    }

    const minimizedData = {
      firstName: doc.data().firstName,
      lastName: doc.data().lastName,
      role: doc.data().role,
      roleLevel: doc.data().roleLevel,
      id: doc.id,
    }

    return { data: doc.data(), id: doc.id, minimizedData }
  } catch (error) {
    throw new HttpsError('internal', `Error Geting agent data: ${error.message}`)
  }
})

// update authClaims
// update database
const changePermissons = onCall(async (request) => {
  const { id, role, roleLevel } = request.data

  try {
    const operations = await Promise.all([getAuth().getUser(id)])
    const [agentToUpdate] = operations

    const agentClaims = agentToUpdate.customClaims

    const newClaims = {
      ...agentClaims,
      claims: {
        ...agentClaims.claims,
        role,
        roleLevel,
      },
    }

    const updatedClaims = await getAuth().setCustomUserClaims(id, newClaims)

    const getUpdatedUser = await getAuth().getUser(id)
    const updatedDoc = await updateDatabase(id, role, roleLevel)
    return {
      id,
      role,
      roleLevel,
      agentToUpdate,
      getUpdatedUser,
      updatedClaims: newClaims,
      updatedDoc,
    }
  } catch (error) {
    throw new HttpsError('internal', `Error Updating agent data: ${error.message}`)
  }
})

async function updateDatabase(id, role, roleLevel) {
  try {
    const agentRef = db.collection('agents').doc(id)
    const doc = await agentRef.get()

    if (!doc.exists) {
      console.log('No such document!')
      return { success: false, message: 'Document not found' }
    }

    const newPermissions = setAccess(role)

    // Update the document with new role, roleLevel and permissions
    const res = await agentRef.update({
      'claims.role': role,
      'claims.roleLevel': roleLevel,
      permissions: newPermissions, // Fixed spelling from "permissons" to "permissions"
      role,
      roleLevel,
    })

    return {
      success: true,
      message: 'Document updated successfully',
      response: res,
    }
  } catch (error) {
    throw new HttpsError('internal', `Error Updating document data: ${error.message}`)
  }
}
module.exports = {
  getRolesData,
  getAgentData,
  changePermissons,
  getAllAgents,
}
