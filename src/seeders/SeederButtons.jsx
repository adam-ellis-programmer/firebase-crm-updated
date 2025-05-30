import React, { useState } from 'react'
import { seedData } from './agentSeeder'
import { removeAgents } from './removeAgents'
import { seedCustomers } from './customerSeeder'

const SeederButtons = () => {
  const [loading, setLoading] = useState({
    agents: false,
    customers: false,
    removing: false,
  })

  const [status, setStatus] = useState({
    agents: null,
    customers: null,
    removing: null,
  })

  // Seed agents
  const handleAgentSeed = async () => {
    setLoading((prev) => ({ ...prev, agents: true }))
    setStatus((prev) => ({ ...prev, agents: null }))

    try {
      await seedData()
      setStatus((prev) => ({ ...prev, agents: 'success' }))
      console.log('✅ Agents seeded successfully!')
    } catch (error) {
      setStatus((prev) => ({ ...prev, agents: 'error' }))
      console.error('❌ Failed to seed agents:', error)
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }))
    }
  }

  // Remove agents
  const handleRemoveAgents = async () => {
    setLoading((prev) => ({ ...prev, removing: true }))
    setStatus((prev) => ({ ...prev, removing: null }))

    try {
      await removeAgents()
      setStatus((prev) => ({ ...prev, removing: 'success' }))
      console.log('✅ Agents removed successfully!')
    } catch (error) {
      setStatus((prev) => ({ ...prev, removing: 'error' }))
      console.error('❌ Failed to remove agents:', error)
    } finally {
      setLoading((prev) => ({ ...prev, removing: false }))
    }
  }

  // Seed customers
  const handleCustomersSeed = async () => {
    setLoading((prev) => ({ ...prev, customers: true }))
    setStatus((prev) => ({ ...prev, customers: null }))

    try {
      console.log('🚀 Starting customer seeding...')
      const result = await seedCustomers()
      setStatus((prev) => ({ ...prev, customers: 'success' }))
      console.log(`✅ Successfully created ${result.totalCreated} customers!`)
      if (result.totalFailed > 0) {
        console.log(`⚠️ ${result.totalFailed} customers failed to create`)
      }
    } catch (error) {
      setStatus((prev) => ({ ...prev, customers: 'error' }))
      console.error('❌ Failed to seed customers:', error)
    } finally {
      setLoading((prev) => ({ ...prev, customers: false }))
    }
  }

  const getButtonClass = (isLoading, status) => {
    let baseClass =
      'w-1/2 m-auto block text-white cursor-pointer px-4 py-2 rounded transition-colors '

    if (isLoading) {
      return baseClass + 'bg-gray-400 cursor-not-allowed'
    }

    switch (status) {
      case 'success':
        return baseClass + 'bg-green-500 hover:bg-green-600'
      case 'error':
        return baseClass + 'bg-red-500 hover:bg-red-600'
      default:
        return baseClass + 'bg-orange-500 hover:bg-orange-600'
    }
  }

  const getButtonText = (defaultText, isLoading, status) => {
    if (isLoading) return 'Loading...'
    if (status === 'success') return '✅ ' + defaultText
    if (status === 'error') return '❌ ' + defaultText
    return defaultText
  }

  return (
    <div className='p-4'>
      <h2 className='text-lg font-bold mb-4'>Database Seeder</h2>

      {/* Agent Controls */}
      <div className='mb-3 flex gap-2'>
        <button
          onClick={handleAgentSeed}
          disabled={loading.agents}
          className={getButtonClass(loading.agents, status.agents)}
        >
          {getButtonText('Seed Agents', loading.agents, status.agents)}
        </button>

        <button
          onClick={handleRemoveAgents}
          disabled={loading.removing}
          className={getButtonClass(loading.removing, status.removing)}
        >
          {getButtonText('Remove Agents', loading.removing, status.removing)}
        </button>
      </div>

      {/* Customer Controls */}
      <div className='mb-3 flex'>
        <button
          onClick={handleCustomersSeed}
          disabled={loading.customers}
          className={getButtonClass(loading.customers, status.customers)}
        >
          {getButtonText(
            'Seed Customers (5 per agent)',
            loading.customers,
            status.customers
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className='mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800'>
        <p>
          <strong>Instructions:</strong>
        </p>
        <ol className='list-decimal list-inside mt-2 space-y-1'>
          <li>
            First click "Seed Agents" to create agents in your organization
          </li>
          <li>
            Then click "Seed Customers" to create 5 customers for each agent
          </li>
          <li>Use "Remove Agents" to clean up if needed</li>
        </ol>
      </div>
    </div>
  )
}

export default SeederButtons
