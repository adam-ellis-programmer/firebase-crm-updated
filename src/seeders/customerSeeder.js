import { getFunctions, httpsCallable } from 'firebase/functions'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { getCurrentAuthState } from '../crm context/CrmAction'
import { customerTemplates } from './customers'

// Sample customer data templates - 30 unique customers to ensure each agent gets unique customers

// Function to get geolocation for an address
const getGeoLocation = async (address) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.REACT_APP_GEO_KEY}`
    )
    const geocodeData = await response.json()

    if (geocodeData.status === 'OK' && geocodeData.results[0]) {
      return {
        geoLocation: {
          lat: geocodeData.results[0].geometry.location.lat,
          lng: geocodeData.results[0].geometry.location.lng,
        },
        formattedAddress: geocodeData.results[0].formatted_address,
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error)
  }

  // Return default values if geocoding fails
  return {
    geoLocation: { lat: 0, lng: 0 },
    formattedAddress: address,
  }
}

// Function to format phone number
const formatPhoneNumber = (phone) => {
  const n = phone.replace(/\D/g, '') // Remove non-digits
  if (n.length === 11) {
    const nRegex = /^(\d{5})(\d{3})(\d{3})$/
    return n.replace(nRegex, '($1)-$2-$3')
  }
  return phone
}

// Function to create a single customer
const createCustomer = async (
  customerTemplate,
  agent,
  orgId,
  orgName,
  customerIndex
) => {
  const custId = crypto.randomUUID()

  // Make email unique by adding agent info and customer index
  const uniqueEmail = customerTemplate.email.replace(
    '@',
    `+${agent.data.firstName.toLowerCase()}${customerIndex}@`
  )

  // Get geolocation data
  const locationData = await getGeoLocation(customerTemplate.address)

  // Create customer data
  const userData = {
    name: customerTemplate.name,
    email: uniqueEmail,
    phone: formatPhoneNumber(customerTemplate.phone),
    company: customerTemplate.company,
    address: customerTemplate.address,
    ...locationData,
    orgId: orgId,
    orgName: orgName,
    agentId: agent.id,
    signUpagent: `${agent.data.firstName} ${agent.data.lastName}`,
    agentUid: agent.id,
    dateOfSignUp: new Date().toLocaleString('en-GB'),
    timestamp: serverTimestamp(),
    reportsTo: agent.data.reportsTo,
    custId: custId,
    docAccessLevel: agent.data.roleLevel,
    progress: 0,
    urlData: {
      url:
        process.env.REACT_APP_PROFILE_URL ||
        'https://res.cloudinary.com/travel-adam/image/upload/v1730033562/generic%20placeholders/profile_-_1_xdhi62.png',
    },
  }

  // Create stats data
  const statsData = {
    name: customerTemplate.name,
    email: uniqueEmail,
    custId: custId,
    amountSpent: 0,
    numberOfOrders: 0,
    rating: 0,
    orgId: orgId,
    points: 0,
    goldCustomer: 0,
    company: customerTemplate.company,
    signUpagent: `${agent.data.firstName} ${agent.data.lastName}`,
    agentUid: agent.id,
  }

  try {
    // Save to Firestore
    await setDoc(doc(db, 'customers', custId), userData)
    await setDoc(doc(db, 'stats', custId), statsData)

    console.log(
      `✅ Created customer: ${customerTemplate.name} for agent: ${agent.data.firstName} ${agent.data.lastName}`
    )
    return {
      success: true,
      customer: customerTemplate.name,
      agent: `${agent.data.firstName} ${agent.data.lastName}`,
    }
  } catch (error) {
    console.error(
      `❌ Failed to create customer ${customerTemplate.name}:`,
      error
    )
    throw error
  }
}

// Main seeder function
const seedCustomers = async () => {
  try {
    console.log('🚀 Starting customer seeding process...')

    // Get current auth state
    const authState = await getCurrentAuthState()
    const orgId = authState.claims.orgId
    const orgName = authState.claims.orgName

    // Get all agents in the organization
    const functions = getFunctions()
    const getAllAgentsByOrg = httpsCallable(functions, 'getAllAgentsByOrg')
    const agentData = await getAllAgentsByOrg({ orgId: orgId })

    if (!agentData.data.success || !agentData.data.agentData.length) {
      throw new Error(
        'No agents found in organization. Please seed agents first.'
      )
    }

    const agents = agentData.data.agentData
    console.log(
      `📋 Found ${agents.length} agents. Creating 5 customers for each...`
    )

    const results = []

    // Create 5 customers for each agent
    for (const agent of agents) {
      console.log(
        `👤 Creating customers for agent: ${agent.data.firstName} ${agent.data.lastName}`
      )

      for (let i = 0; i < 5; i++) {
        // Use modulo to cycle through customer templates if we have more customers than templates
        const templateIndex =
          (i + agents.indexOf(agent) * 5) % customerTemplates.length
        const customerTemplate = customerTemplates[templateIndex]

        try {
          const result = await createCustomer(
            customerTemplate,
            agent,
            orgId,
            orgName,
            i + 1
          )
          results.push(result)

          // Add small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(
            `Failed to create customer ${i + 1} for agent ${
              agent.data.firstName
            }:`,
            error
          )
          results.push({
            success: false,
            customer: customerTemplate.name,
            agent: `${agent.data.firstName} ${agent.data.lastName}`,
            error: error.message,
          })
        }
      }
    }

    // Summary
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log(`🎉 Customer seeding completed!`)
    console.log(`✅ Successfully created: ${successful} customers`)
    if (failed > 0) {
      console.log(`❌ Failed to create: ${failed} customers`)
    }

    return {
      success: true,
      totalCreated: successful,
      totalFailed: failed,
      results: results,
    }
  } catch (error) {
    console.error('💥 Customer seeding failed:', error)
    throw error
  }
}

export { seedCustomers }
