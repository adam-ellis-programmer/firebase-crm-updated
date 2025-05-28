// for funcitons that handle initial payed sign up
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('../firebase.config')
const { getFirestore } = require('firebase-admin/firestore')
const { ceoPermissions } = require('./ceoPermissions')
const { ROLES } = require('./roles')
// Initialize Firestore
const db = getFirestore()
const newAccSignUp = onCall(async (request) => {
  try {
    // USE REGEX TO FIND \S REPLACE '' THE CAPS
    const data = request.data.data
    const ORG = request.data.data.orgName.slice(0, 4).toUpperCase()
    const name = data.firstName.slice(0, 4)
    const id = `ORG-${ORG}-${db.collection('organizations').doc().id}`
    const fullName = `${data.firstName} ${data.lastName}`
    // Create the user in Authentication
    const userRecord = await getAuth().createUser({
      uid: id,
      email: data.email,
      emailVerified: false,
      password: data.password,
      displayName: fullName, // Combine first and last name
      photoURL: 'http://www.example.com/12345678/photo.png',
      disabled: false,
    })

    // Set custom claims
    await getAuth().setCustomUserClaims(userRecord.uid, {
      claims: {
        roleLevel: ROLES['CEO'],
        role: 'CEO',
        orgId: id,
        agentId: id,
        orgName: data.orgName,
        testUser: true,
      },
      // move data back to org owner
      defaultHandBack: {
        id: id,
        name: fullName,
      },
    })

    // Get the updated user info with claims
    const user = await getAuth().getUser(userRecord.uid)

    // delete password from db
    delete data.password
    const agentObj = {
      ...data,
      claims: user.customClaims.claims,
      reportsTo: {
        id: id,
        name: fullName,
      },
    }

    // Create the database entry
    const dbResult = await makeDbEntry(agentObj, userRecord.uid, id)

    return { user, success: true, userRecord, dbResult, agentObj, dbResult }
  } catch (error) {
    console.log('Error creating new user:', error)
    throw new HttpsError(
      'internal',
      'Error creating new user: ' + error.message
    )
    // throw new Error(error.message)
  }
})

// ============
// MAKE DB ENTRY
// ============

async function makeDbEntry(userData, uid, id) {
  try {
    // Create a new document in the agents collection
    const agentRef = db.collection('agents').doc(uid)
    const orgRef = db.collection('organizations').doc(uid)

    // Prepare the agent data
    const agentData = {
      ...userData,
      createdAt: new Date(),
      // both the same on acc owner doc
      orgId: id,
      docId: id,
      permissions: ceoPermissions(),
      role: 'CEO',
      roleLevel: ROLES['CEO'],
      subordinates: [],
    }

    // no need for claims in org doc
    delete userData.claims
    const orgObj = {
      ...userData,
      accUsersLimit: 10,
      accUsers: 0,
      docId: id,
    }

    // Add the documents to Firestore
    await agentRef.set(agentData)
    await orgRef.set(orgObj)

    return { success: true, data: agentData }
  } catch (error) {
    console.error('Error making DB entry:', error)
    throw new Error('Failed to create database entry')
  }
}

module.exports = {
  newAccSignUp,
}
