import React from 'react'
import FormRow from './FormRow'
import SelectRow from './SelectRow'
import { useEffect, useState } from 'react'
import { useAuthStatusTwo } from '../../hooks/useAuthStatusTwo'
import { getAgent, getAgents, updateAgentPermissions } from '../../crm context/CrmAction'
import CheckboxRow from './CheckboxRow'

const AccessPermissions = () => {
  const { claims } = useAuthStatusTwo()
  const [agentsData, setAgentsData] = useState(null)
  const [permissions, setPermissions] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [agentID, setAgentID] = useState(null)
  const [loading, setLoading] = useState(null)
  const [agentPermissions, setAgentPermissions] = useState(null)

  const PERMISSION_ORDER = [
    'customers',
    'products',
    'reports',
    'users',
    // Add all other categories in your desired order
  ]

  useEffect(() => {
    window.scrollTo({
      top: 0,
    })
    const getData = async () => {
      if (!claims?.claims?.orgId) return
      const data = await getAgents(claims?.claims?.orgId)
      console.log(data)
      setAgentsData(data)
    }

    getData()
    return () => {}
  }, [claims])

  const handleSelectAgentChange = async (e) => {
    setSelectedAgent(e.target.value)
    const dataId = e.target.selectedOptions[0].dataset.id
    setAgentID(dataId)
    const agent = await getAgent(dataId)
    setPermissions(agent.data.permissions)

    const permissions = {
      ...agent.data.permissions,
    }

    setAgentPermissions(permissions)
  }

  const perm = agentPermissions ? Object.entries(agentPermissions) : []

  const handlePermissionChange = (e, category, permission) => {
    console.log(category, permission)
    // Get the new checkbox value
    const newValue = e.target.checked

    // // Create a deep copy of the current permissions
    const updatedPermissions = JSON.parse(JSON.stringify(agentPermissions))

    // Update the specific permission
    updatedPermissions[category][permission] = newValue

    // // Update the state
    setAgentPermissions(updatedPermissions)

    // // Log the updated permissions (for debugging)
    console.log('Updated permissions:', updatedPermissions)
  }

  const handleSubmit = async () => {
    console.log(agentPermissions)
    try {
      setLoading(true)
      const res = await updateAgentPermissions(agentID, agentPermissions)
      console.log(res)

      // Reset states after successful submission
      setLoading(false)
      setAgentID(null)
      setPermissions(null)
      setAgentPermissions(null)
      setSelectedAgent('select-agent') // Reset the select dropdown

      // Optional: Show success message or notification
      alert('Permissions updated successfully!')
    } catch (error) {
      setLoading(false)
      console.log(error)
      // Optional: Show error message
      alert('Error updating permissions!')
    }
  }

  // select only selected permissions block
  // category admin | manager | ceo ...
  const handleSelectAll = (e, category) => {
    // Get the new checkbox value (checked or unchecked)
    const newValue = e.target.checked

    // Create a deep copy of current permissions
    const updatedPermissions = JSON.parse(JSON.stringify(agentPermissions))

    console.log(updatedPermissions[category])
    // Set all permissions within this category to the new value
    Object.keys(updatedPermissions[category]).forEach((permission) => {
      // permissions is CRUD create, read, update, delete
      updatedPermissions[category][permission] = newValue
    })

    // Update the state
    setAgentPermissions(updatedPermissions)
  }
  return (
    <div className="page-container">
      <section>
        <h2>controll agents crud functionality</h2>
        <form action="" className="change-access-form">
          <SelectRow
            value={selectedAgent}
            data={agentsData}
            text="please select agent"
            labelText="agent selector"
            onChange={handleSelectAgentChange}
          />
        </form>
      </section>

      <section className="permissions-grid">
        {perm?.map(([key, value]) => {
          const values = Object.entries(value)
          console.log(key)
          return (
            <ul key={key}>
              <p className="access-permissions-item-header">{key}</p>
              <li>
                {/* select all div */}
                <div className="access-select-all-div">
                  <label>
                    <span className="access-change-span">select all</span>
                  </label>
                  <input
                    className="access-change-check-box"
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e, key, value)}
                    // checked={false}
                    // defaultChecked={true}
                    // id={``}
                  />
                </div>
                <div>
                  {values?.map(([key2, value]) => {
                    return (
                      <ul key={key2}>
                        <li className="access-change-li">
                          <label htmlFor={key2}>
                            <span className="access-change-span">{key2}</span>
                          </label>
                          <input
                            onChange={(e) => handlePermissionChange(e, key, key2)}
                            className="access-change-check-box"
                            type="checkbox"
                            checked={value}
                            id={key2}
                          />
                        </li>
                      </ul>
                    )
                  })}
                </div>
              </li>
            </ul>
          )
        })}
      </section>
      <section>
        <div className="admin-btn-container change-permissions-btn-container">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`admin-add-agent-btn`}
          >
            {loading ? 'updating ...' : 'change'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default AccessPermissions
