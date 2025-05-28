const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')
const { setAccess } = require('./setAgentPermissions')
const { ROLES } = require('./roles')

// Initialize Firestore
const db = getFirestore()

const adminAddUser = onCall(async (request) => {
  try {
    const data = request.data.data
    const ORG = data.orgName.slice(0, 4).toUpperCase()
    const id = `AGENT-${ORG}-${db.collection('agents').doc().id}`

    // Create the user in Authentication
    const userRecord = await getAuth().createUser({
      uid: id,
      email: data.email,
      emailVerified: false,
      password: data.password,
      displayName: `${data.firstName} ${data.lastName}`,
      photoURL: 'http://www.example.com/12345678/photo.png',
      disabled: false,
    })

    // Get permissions for the role
    const permissions = setAccess(data.role)

    // Set minimal custom claims
    await getAuth().setCustomUserClaims(userRecord.uid, {
      claims: {
        roleLevel: data.roleLevel,
        role: data.role,
        orgId: data.orgId,
        orgName: data.orgName,
        agentId: id,
        disabled: false,
      },
      defaultHandBack: {
        id: data.defaultHandBack.id,
        name: data.defaultHandBack.name,
      },
    })

    // Get the updated user info
    const user = await getAuth().getUser(userRecord.uid)

    // delete password from db
    delete data.password

    const agentObj = {
      ...data,
      claims: user.customClaims.claims,
      permissions: permissions, // Add permissions here
      docId: id,
      createdAt: new Date(),
      orgId: data.orgId,
      disabled: false,
    }

    // Create the database entry
    const dbResult = await agentDbEntry(agentObj, id, data.orgId)
    const subRes = await addSubordinates(data.reportsTo.id, id)

    return {
      success: true,
      uid: userRecord.uid,
      data,
      user,
      dbEntry: dbResult,
      docId: id,
      orgId: data.orgId,
      hbD: data.defaultHandBack,
      subRes,
    }
  } catch (error) {
    console.log('Error creating new user:', error)
    throw new HttpsError(
      'internal',
      'Error creating new user from b/e: adminAddUser ' + error.message
    )
  }
})

async function agentDbEntry(userData, id, orgId) {
  try {
    const agentRef = db.collection('agents').doc(id)

    // Get permissions based on role
    const permissions = setAccess(userData.role)

    // Prepare the agent data with subordinates array and permissions
    const agentData = {
      ...userData,
      subordinates: [], // Initialize empty subordinates array here
      reportsTo: userData.reportsTo || null,
      permissions: permissions, // Add the permissions here
    }

    // Add the document to Firestore
    await agentRef.set(agentData)
    const updateData = await updateDocument(orgId)

    return { success: 'yes', data: agentData, updateData }
  } catch (error) {
    console.error('Error making DB entry:', error)
    throw new Error('Failed to create database entry')
  }
}
// look up atomic data
async function updateDocument(id) {
  // update ref
  const updateRef = db.collection('organizations').doc(id)

  // get doc ref
  const orgRef = db.collection('organizations').doc(id)

  // get doc
  const doc = await orgRef.get()

  if (!doc.exists) {
    return { msg: 'No Such document' }
  } else {
    // get current users
    const accUsersNum = doc.data().accUsers

    // update doc
    const res = await updateRef.update({ accUsers: accUsersNum + 1 })

    return { msg: 'success', accUsersNum, res }
  }
}
// add id to subordinates AUTH
async function addSubordinates(agentId, newSubId) {
  try {
    // Update only in Firestore
    const result = await addSubordinatesDB(agentId, newSubId)
    return {
      success: true,
      result,
    }
  } catch (error) {
    console.error('Error updating subordinates:', error)
    throw new Error(`Failed to update subordinates: ${error.message}`)
  }
}

async function addSubordinatesDB(docId, newAgentId) {
  try {
    const agentRef = db.collection('agents').doc(docId)
    const doc = await agentRef.get()

    if (!doc.exists) {
      throw new Error('No such document!')
    }

    const data = doc.data()
    const subordinates = data.subordinates || [] // Changed from data.claims.subordinates

    // Check if subordinate already exists
    if (subordinates.includes(newAgentId)) {
      return {
        success: false,
        message: 'Subordinate already exists',
      }
    }

    // Update the document
    await agentRef.update({
      subordinates: [...subordinates, newAgentId], // Store directly in document root
    })

    return {
      success: true,
      message: 'Subordinate added successfully',
    }
  } catch (error) {
    console.error('Error updating subordinates in DB:', error)
    throw new Error(`Failed to update subordinates in DB: ${error.message}`)
  }
}

// add id to sunordinates array
async function addSubordinatesDB(docId, newAgentId) {
  try {
    const agentRef = db.collection('agents').doc(docId)
    const doc = await agentRef.get()

    if (!doc.exists) {
      throw new Error('No such document!')
    }

    const data = doc.data()
    const subordinates = data.subordinates || [] // Changed from data.claims.subordinates

    // Check if subordinate already exists
    if (subordinates.includes(newAgentId)) {
      return {
        success: false,
        message: 'Subordinate already exists',
      }
    }

    // Update the document
    await agentRef.update({
      subordinates: [...subordinates, newAgentId], // Store directly in document root
    })

    return {
      success: true,
      message: 'Subordinate added successfully',
    }
  } catch (error) {
    console.error('Error updating subordinates in DB:', error)
    throw new Error(`Failed to update subordinates in DB: ${error.message}`)
  }
}
module.exports = {
  adminAddUser,
}
