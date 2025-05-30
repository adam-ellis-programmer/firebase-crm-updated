

import { getFunctions, httpsCallable } from 'firebase/functions'
import { agents } from './agents'

const functions = getFunctions()
const deleteAgent = httpsCallable(functions, 'deleteAgent')

const removeAgents = async () => {
  try {
    console.log('🗑️ Starting to remove test agents...')

    // Use Promise.all for parallel deletion (faster)
    const results = await Promise.all(
      agents.map(async (agent, index) => {
        try {
          console.log(`🗑️ Removing agent ${index + 1}: ${agent.email}`)

          // Prepare the data for deleteAgent function
          const deleteData = {
            email: agent.email,
            orgId: agent.orgId,
            agentId: agent.id || agent.uid, // Use agent.id if available, fallback to uid
            handBackData: agent.defaultHandBack,
          }

          const result = await deleteAgent(deleteData)

          console.log(`✅ Successfully removed agent: ${agent.email}`)
          return {
            email: agent.email,
            success: true,
            data: result.data,
          }
        } catch (error) {
          console.error(
            `❌ Failed to remove agent ${agent.email}:`,
            error.message
          )
          return {
            email: agent.email,
            success: false,
            error: error.message,
          }
        }
      })
    )

    // Summary
    const successful = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)

    console.log(`\n🎉 Removal completed!`)
    console.log(`✅ Successfully removed: ${successful.length} agents`)
    console.log(`❌ Failed to remove: ${failed.length} agents`)

    if (failed.length > 0) {
      console.log('\n❌ Failed removals:')
      failed.forEach((f) => console.log(`  - ${f.email}: ${f.error}`))
    }

    if (successful.length > 0) {
      console.log('\n✅ Successfully removed:')
      successful.forEach((s) => console.log(`  - ${s.email}`))
    }

    return results
  } catch (error) {
    console.error('💥 Agent removal failed:', error)
    throw error
  }
}

// Export for use in other files
export { removeAgents }
