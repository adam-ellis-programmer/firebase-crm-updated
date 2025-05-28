const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { admin, db, getFirestore } = require('./firebase.config')
// index.js (root functions folder)
require('dotenv').config()
// follow node inport / export
const { newAccSignUp } = require('./src/accountSignUp')
const { adminAddUser } = require('./src/addAgent')
const { deleteAgent } = require('./src/deleteAgent')
const { getClaims, updateAccess } = require('./src/changeAccess')
const { changeReportsTo } = require('./src/changeReportsTo')
const { authTest, singleUpdate, simpleQuery } = require('./src/testFuncitons')
const { getAllAgentsByOrg } = require('./src/getData')
const { getManagersData } = require('./src/getManagersData')
const { sendEmail } = require('./src/handleEmails')
const { trackEmailOpen } = require('./src/trackEmailOpen')
const { sendWelcomeEmails } = require('./src/handleSignUpEmails')
const {
  getRolesData,
  getAgentData,
  changePermissons,
  getAllAgents,
} = require('./src/getRolesData')

// handle auth / signup add / remove
exports.authTest = authTest
exports.adminAddUser = adminAddUser
exports.singleUpdate = singleUpdate
exports.newAccSignUp = newAccSignUp
exports.simpleQuery = simpleQuery
exports.deleteAgent = deleteAgent
exports.getClaims = getClaims
exports.updateAccess = updateAccess
exports.changeReportsTo = changeReportsTo
exports.getRolesData = getRolesData
exports.getAgentData = getAgentData
exports.changePermissons = changePermissons
exports.getAllAgents = getAllAgents
exports.sendEmail = sendEmail
exports.sendWelcomeEmails = sendWelcomeEmails
exports.trackEmailOpen = trackEmailOpen

// handle data
exports.getAllAgentsByOrg = getAllAgentsByOrg
exports.getManagersData = getManagersData

exports.listAllUsers = onCall((request) => {
  const users = []

  const listAllUsers = (nextPageToken) => {
    return admin
      .auth()
      .listUsers(1000, nextPageToken)
      .then((listUsersResult) => {
        listUsersResult.users.forEach((userRecord) => {
          users.push(userRecord.toJSON())
        })
        if (listUsersResult.pageToken) {
          return listAllUsers(listUsersResult.pageToken)
        }
        return users
      })
      .catch((error) => {
        throw new HttpsError(
          'internal',
          'Failed to list users: ' + error.message
        )
      })
  }

  return listAllUsers()
    .then((fetchedUsers) => {
      console.log('Successfully fetched all users:', fetchedUsers.length)
      return { users: fetchedUsers }
    })
    .catch((error) => {
      console.error('Error in listAllUsers:', error)
      throw new HttpsError('internal', 'Failed to list users: ' + error.message)
    })
})

// ====================
// ====================
// ====================
// ====================
// ====================
// ====================
// ====================
// ====================

// generateAccessToken ensures secure authentication
// handlePayPalResponse ensures reliable error handling

// Base URL for PayPal API - switches between sandbox and production
// const PAYPAL_BASE = process.env.FUNCTIONS_EMULATOR
//   ? 'https://api-m.sandbox.paypal.com'

const PAYPAL_BASE = 'https://api-m.sandbox.paypal.com' // Force sandbox for now

/**
 * Generates an OAuth 2.0 access token for PayPal API authentication
 * @returns {Promise<string>} The PayPal access token
 */
async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error(
      'Missing PayPal API credentials. Please add them to your environment variables.'
    )
  }

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  try {
    const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const data = await response.json()

    if (data.error) {
      console.error('PayPal token error:', data)
      throw new Error(data.error_description)
    }

    return data.access_token
  } catch (error) {
    console.error('Failed to generate PayPal access token:', error)
    throw error
  }
}

/**
 * Handles the response from PayPal API calls
 * @param {Response} response - The fetch response from PayPal
 * @returns {Promise<Object>} Parsed response data
 */
async function handlePayPalResponse(response) {
  const jsonResponse = await response.json()

  if (!response.ok) {
    console.error('PayPal API error:', jsonResponse)
    throw new Error(jsonResponse.message || 'PayPal API error')
  }

  return jsonResponse
}

/**
 * Creates a PayPal order for the transaction
 */
exports.createPayPalOrder = onCall(async (request) => {
  try {
    const { amount, currency = 'GBP', productId } = request.data

    if (!amount || !productId) {
      throw new Error('Amount and productId are required')
    }

    const accessToken = await generateAccessToken()

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toString(),
          },
          description: `Order for product ${productId}`,
          custom_id: productId,
        },
      ],
      application_context: {
        brand_name: process.env.BRAND_NAME || 'Your Store',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
      },
    }

    const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    })

    const orderData = await handlePayPalResponse(response)

    // Store order details in your database if needed
    // await admin.firestore().collection('orders').doc(orderData.id).set({
    //   userId: request.auth.uid,
    //   productId,
    //   amount,
    //   status: 'CREATED',
    //   createdAt: admin.firestore.FieldValue.serverTimestamp()
    // });

    return orderData
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    throw new Error(`Failed to create PayPal order: ${error.message}`)
  }
})

/**
 * Captures payment for a created PayPal order
 */
exports.capturePayPalPayment = onCall(async (request) => {
  try {
    const { orderId } = request.data

    if (!orderId) {
      throw new Error('OrderId is required')
    }

    const accessToken = await generateAccessToken()

    const response = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const captureData = await handlePayPalResponse(response)

    captureData.test = 'hello'

    // Update order status in your database if needed
    // await admin.firestore().collection('orders').doc(orderId).update({
    //   status: 'COMPLETED',
    //   paymentDetails: captureData,
    //   updatedAt: admin.firestore.FieldValue.serverTimestamp()
    // });

    return captureData
  } catch (error) {
    console.error('Error capturing PayPal payment:', error)
    throw new Error(`Failed to capture PayPal payment: ${error.message}`)
  }
})

/**
 * Optional: Verifies PayPal webhook events
 */
exports.handlePayPalWebhook = onCall(async (request) => {
  if (!request.auth) {
    throw new Error('Unauthorized')
  }

  try {
    const { event_type, resource } = request.data

    // Handle different webhook events
    switch (event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Handle successful payment
        // await handleSuccessfulPayment(resource);
        break
      case 'PAYMENT.CAPTURE.DENIED':
        // Handle denied payment
        // await handleFailedPayment(resource);
        break
      // Add other webhook events as needed
    }

    return { success: true }
  } catch (error) {
    console.error('Error processing PayPal webhook:', error)
    throw new Error(`Failed to process PayPal webhook: ${error.message}`)
  }
})

// make into a non exports and call  from server
// pass in id, claims, and any other data
// that we need here
exports.handleDatabaseSignUp = onCall(async (request) => {
  try {
    const db = getFirestore()
    const userData = { ...request.data }
    const userId = request.data.id

    const accRef = db.collection('organizations').doc(userId)
    const userRef = db.collection('agents').doc(userId)

    const reportsTo = {
      id: userId,
      name: `${userData.firstName} ${userData.lastName}`,
    }

    // Create account data WITHOUT claims
    const accData = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      accUsers: 0,
      accUsersLimit: 10,
      totalSpent: 0,
      salesMade: 0,
    }
    delete accData.claims // Only delete claims from account data

    // Create agent data WITH claims
    const agent = {
      ...userData, // Keeps the claims
      reportsTo,
    }

    // set account
    await accRef.set(accData)
    // set agent
    await userRef.set(agent)

    return {
      success: true,
      data: accData,
      agentData: agent,
    }
  } catch (error) {
    console.error('Error in handleDatabaseSignUp:', error)
    throw new Error('Failed to create database user')
  }
})

// exports.handleWelcomeEmails = onCall(async (request) => {
//   return request.data
// })

async function getData() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1')
    const json = await response.json()

    return {
      data: json,
      msg: 'hello from the server',
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

async function handleDatabaseEntries(params) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1')
    const json = await response.json()

    return {
      data: json,
      msg: 'hello from the server',
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}
