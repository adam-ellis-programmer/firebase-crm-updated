// src/seeders/customerSeeder.js

import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { agents } from './agents'

const functions = getFunctions()
const db = getFirestore()
const adminAddUser = httpsCallable(functions, 'adminAddUser')

// Two dummy customers that match your exact structure
const dummyCustomers = [
  {
    name: 'John Smith',
    email: 'john.smith@gmail.com',
    phone: '(07777)-123-456',
    company: 'Tech Solutions Ltd',
    address: '10 Downing Street',
    formattedAddress: '10 Downing Street, Westminster, London SW1A 2AA, UK',
    geoLocation: {
      lat: 51.503396,
      lng: -0.127764,
    },
    progress: 0,
    docAccessLevel: 4,
    urlData: {
      url: 'https://res.cloudinary.com/travel-adam/image/upload/v1730033562/generic%20placeholders/profile_-_1_xdhi62.png',
    },
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@gmail.com',
    phone: '(07777)-987-654',
    company: 'Marketing Pro',
    address: '221B Baker Street',
    formattedAddress: '221B Baker Street, Marylebone, London NW1 6XE, UK',
    geoLocation: {
      lat: 51.523767,
      lng: -0.158455,
    },
    progress: 0,
    docAccessLevel: 4,
    urlData: {
      url: 'https://res.cloudinary.com/travel-adam/image/upload/v1730033562/generic%20placeholders/profile_-_1_xdhi62.png',
    },
  },
]

// Function to create customers for a specific agent
const createCustomersForAgent = async (agentResult, agentIndex) => {
  try {
    const agentData = agentResult.data.data
    const agentId = agentResult.data.uid
    const orgId = agentData.orgId
    const orgName = agentData.orgName
    const signUpAgent = `${agentData.firstName} ${agentData.lastName}`
    const reportsTo = agentData.reportsTo

    console.log(`👤 Creating customers for agent: ${agentData.email}`)

    const customerResults = await Promise.all(
      dummyCustomers.map(async (customerTemplate, customerIndex) => {
        try {
          // Generate unique customer ID
          const custId = uuidv4()

          // Make email and phone unique per agent
          const uniqueSuffix = `${agentIndex}${customerIndex}`
          const uniqueEmail = customerTemplate.email.replace(
            '@gmail.com',
            `${uniqueSuffix}@gmail.com`
          )
          const uniquePhone = customerTemplate.phone.replace(
            '777-',
            `${uniqueSuffix.padStart(3, '0')}-`
          )
          const uniqueName = `${customerTemplate.name} ${agentIndex}${customerIndex}`

          // Create customer data matching your exact structure
          const customerData = {
            ...customerTemplate,
            name: uniqueName,
            email: uniqueEmail,
            phone: uniquePhone,
            custId: custId,
            agentId: agentId,
            agentUid: agentId,
            orgId: orgId,
            orgName: orgName,
            signUpagent: signUpAgent,
            reportsTo: reportsTo,
            dateOfSignUp: new Date().toLocaleString('en-GB'),
            timestamp: serverTimestamp(),
          }

          console.log(`  📝 Creating customer: ${customerData.name}`)

          // Save to Firestore
          await setDoc(doc(db, 'customers', custId), customerData)

          console.log(
            `  ✅ Successfully created customer: ${customerData.name}`
          )

          return {
            success: true,
            customer: customerData,
            custId: custId,
          }
        } catch (error) {
          console.error(
            `  ❌ Failed to create customer ${customerTemplate.name}:`,
            error
          )
          return {
            success: false,
            customer: customerTemplate,
            error: error.message,
          }
        }
      })
    )

    return {
      agentEmail: agentData.email,
      agentId: agentId,
      customers: customerResults,
    }
  } catch (error) {
    console.error(`💥 Failed to create customers for agent:`, error)
    throw error
  }
}

// Updated main seeder function
const seedData = async () => {
  try {
    console.log('🚀 Starting to seed agents and customers...')

    // First, create all agents
    const agentResults = await Promise.all(
      agents.map(async (agent, index) => {
        try {
          console.log(`Seeding agent ${index + 1}:`, agent.email)
          const result = await adminAddUser({ data: agent })
          console.log(`✅ Successfully created agent: ${agent.email}`)
          return result
        } catch (error) {
          console.error(`❌ Failed to create agent ${agent.email}:`, error)
          throw error
        }
      })
    )

    console.log('🎉 All agents seeded successfully!')
    console.log('🏢 Now creating customers for each agent...')

    // Then, create customers for each agent
    const customerResults = await Promise.all(
      agentResults.map(async (agentResult, index) => {
        if (agentResult.data && agentResult.data.success) {
          return await createCustomersForAgent(agentResult, index)
        } else {
          console.log(
            `⚠️ Skipping customer creation for failed agent at index ${index}`
          )
          return null
        }
      })
    )

    // Filter out null results
    const validCustomerResults = customerResults.filter(
      (result) => result !== null
    )

    // Calculate totals
    const totalCustomers = validCustomerResults.reduce(
      (acc, agentCustomers) => {
        return acc + agentCustomers.customers.filter((c) => c.success).length
      },
      0
    )

    const failedCustomers = validCustomerResults.reduce(
      (acc, agentCustomers) => {
        return acc + agentCustomers.customers.filter((c) => !c.success).length
      },
      0
    )

    console.log(`\n📊 SEEDING SUMMARY:`)
    console.log(`✅ Agents created: ${agentResults.length}`)
    console.log(`✅ Customers created: ${totalCustomers}`)
    console.log(`❌ Failed customers: ${failedCustomers}`)
    console.log(
      `📈 Average customers per agent: ${(
        totalCustomers / agentResults.length
      ).toFixed(1)}`
    )

    return {
      agents: agentResults,
      customers: validCustomerResults,
      summary: {
        totalAgents: agentResults.length,
        totalCustomers: totalCustomers,
        failedCustomers: failedCustomers,
      },
    }
  } catch (error) {
    console.error('💥 Seeding failed:', error)
    throw error
  }
}

// Alternative: Seed only customers for existing agents
const seedOnlyCustomers = async () => {
  try {
    console.log('🏢 Seeding customers only (assuming agents already exist)...')

    // Mock agent results structure (you'd replace this with actual agent data)
    const mockAgentResults = agents.map((agent, index) => ({
      data: {
        success: true,
        uid: `AGENT-TEST-${index}`,
        data: agent,
      },
    }))

    const customerResults = await Promise.all(
      mockAgentResults.map(async (agentResult, index) => {
        return await createCustomersForAgent(agentResult, index)
      })
    )

    const totalCustomers = customerResults.reduce((acc, agentCustomers) => {
      return acc + agentCustomers.customers.filter((c) => c.success).length
    }, 0)

    console.log(
      `✅ Created ${totalCustomers} customers for ${customerResults.length} agents`
    )

    return customerResults
  } catch (error) {
    console.error('💥 Customer-only seeding failed:', error)
    throw error
  }
}

// Export functions
export { seedData, seedOnlyCustomers, createCustomersForAgent }
