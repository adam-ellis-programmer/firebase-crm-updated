import { getFunctions, httpsCallable } from 'firebase/functions'
import { agents } from './agents'
import { getCurrentAuthState } from '../crm context/CrmAction'

const functions = getFunctions()
const adminAddUser = httpsCallable(functions, 'adminAddUser')

const seedData = async () => {
  const authState = await getCurrentAuthState()
  const orgId = authState.claims.orgId
  const orgName = authState.claims.orgName

  try {
    console.log('Starting to seed agents...')
    console.log('Using dynamic orgId:', orgId)
    console.log('Using dynamic orgName:', orgName)

    // Use Promise.all for better error handling and parallel execution
    const results = await Promise.all(
      agents.map(async (agent, index) => {
        // Create a new agent object with dynamic orgId and orgName
        const dynamicAgent = {
          ...agent,
          orgId: orgId, // Use dynamic orgId
          orgName: orgName, // Use dynamic orgName
          defaultHandBack: {
            id: orgId, // Use dynamic orgId
            name: 'Test User',
          },
          reportsTo: {
            id: orgId, // Use dynamic orgId
            name: 'Test User',
          },
        }

        console.log('Dynamic agent data---->', dynamicAgent)

        try {
          console.log(`Seeding agent ${index + 1}:`, dynamicAgent.email)
          const result = await adminAddUser({ data: dynamicAgent })

          console.log(`✅ Successfully created agent: ${dynamicAgent.email}`)
          return result
        } catch (error) {
          console.error(
            `❌ Failed to create agent ${dynamicAgent.email}:`,
            error
          )
          throw error
        }
      })
    )

    console.log('🎉 All agents seeded successfully!', results)
    return results
  } catch (error) {
    console.error('💥 Seeding failed:', error)
    throw error
  }
}

// Export for use in other files
export { seedData }
