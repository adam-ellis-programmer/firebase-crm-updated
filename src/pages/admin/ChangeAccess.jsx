import React from 'react'
import { useState, useEffect } from 'react'
import ComponentHeader from './ComponentHeader'
import { getFunctions, httpsCallable } from 'firebase/functions'
import RadioRow from './RadioRow '
import CheckboxRow from './CheckboxRow'

const ChangeAccess = ({ claims }) => {
  const orgId = claims?.claims?.orgId
  const [alert, setAlert] = useState({
    msg: '',
    show: '',
  })
  const [roleData, setRoleData] = useState({})
  const [updateData, setUpdateData] = useState(null)
  const [agentData, setAgentData] = useState(null)
  const [selectedOption, setSelectedOption] = useState({}) // Default selected option
  const [loading, setLoading] = useState({
    populate: false,
    submit: false,
  })

  useEffect(() => {
    const getData = async () => {
      const functions = getFunctions()
      const getRolesData = httpsCallable(functions, 'getRolesData')
      const res = await getRolesData({ orgId })
      setRoleData(res.data.roles)
      setAgentData(res.data.agents)
    }
    getData()
    return () => {}
  }, [orgId])

  const handleRadioChange = (e) => {
    const options = e.target.dataset
    const role = e.target.value
    const roleLevel = options.rolelevel
    setSelectedOption((prevState) => ({
      ...prevState,
      role,
      roleLevel: parseInt(roleLevel),
    }))
  }

  const roleArr = Object.entries(roleData) // Only get the role entries

  const handleSelectAgent = async (e) => {
    handleLoading(false, true)

    const selectEl = document.getElementById('agent-select')
    const index = selectEl.selectedIndex
    const options = e.target.options[index].dataset
    const agentId = options.id
    const isNotValid = agentId === 'select-agent'

    if (isNotValid) {
      setAlert((prevState) => ({
        ...prevState,
        show: true,
        msg: 'please select an option',
      }))
      // reset obj to prevent bugs
      setSelectedOption({})
      handleLoading(false, false)
      reset(2000)
      return false
    }

    try {
      const functions = getFunctions()
      const getAgentData = httpsCallable(functions, 'getAgentData')
      const agentData = await getAgentData({ agentId })
      setUpdateData(agentData.data.minimizedData)
      setSelectedOption((prevState) => ({
        ...prevState,
        role: agentData.data.minimizedData.role,
        roleLevel: agentData.data.minimizedData.roleLevel,
      }))
      handleLoading(false, false)
    } catch (error) {
      handleLoading(false, false)
      console.log(error)
    }
  }

  function reset(time) {
    setTimeout(() => {
      setAlert((prevState) => ({
        ...prevState,
        show: false,
        msg: '',
      }))
    }, time)
  }

  const updateDataArr = updateData && Object.entries(updateData).slice(0, 4)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (Object.entries(selectedOption).length === 0) {
      console.log('please select an agent ')
      setAlert((prevState) => ({
        ...prevState,
        show: true,
        msg: 'please select an option',
      }))
      reset(2000)
      return
    }

    try {
      handleLoading(true, false)
      const { role, roleLevel } = selectedOption
      const { id } = updateData

      const functions = getFunctions()
      const changePermissons = httpsCallable(functions, 'changePermissons')
      const data = await changePermissons({
        role,
        roleLevel,
        id,
      })
      console.log('Selected role:', selectedOption)
      console.log(data)

      const getAgentData = httpsCallable(functions, 'getAgentData')
      const agentData = await getAgentData({ agentId: id })
      setUpdateData(agentData.data.minimizedData)
      handleLoading(false, false)
    } catch (error) {
      handleLoading(false, false)
      console.log(error)
    }
  }

  function handleLoading(submit, populate) {
    setLoading((prevState) => ({
      ...prevState,
      submit,
      populate,
    }))
  }

  // helper funciton
  function isEmptyObject(obj) {
    return (
      obj &&
      Object.keys(obj).length === 0 &&
      Object.getPrototypeOf(obj) === Object.prototype
    )
  }

  // The object exists (not null/undefined)
  // It has no keys
  // It's a plain object (not an array or other object type)
  return (
    <div>
      <form onSubmit={handleSubmit} className="admin-form">
        {alert.show && <div className="change-access-alert">{alert.msg}</div>}
        <ComponentHeader text={`change agent access`} />
        <select
          id="agent-select"
          onChange={handleSelectAgent}
          className="admin-select"
          name="agent-select"
        >
          <option data-id={'select-agent'} value={'select-agent'}>
            select agent
          </option>
          {agentData?.map((agent) => {
            const { id, data } = agent
            const name = `${data.firstName} ${data.lastName}`
            return (
              <option data-id={id} value={name} key={id}>
                {name}
              </option>
            )
          })}
        </select>
        <div className="change-access-form-grid">
          <div>
            <p className="change-access-header-p">update data</p>
            <div>
              {updateDataArr &&
                updateDataArr.map(([key, value]) => {
                  return (
                    <p className="change-access-item-p" key={key}>
                      <span>{key}</span> <span>{value}</span>
                    </p>
                  )
                })}
            </div>
          </div>

          <div>
            <p className="change-access-header-p">change access level</p>
            {roleArr.map(([key, value]) => {
              return (
                <RadioRow
                  key={key}
                  name={key}
                  id={key}
                  groupName="accessLevel"
                  value={key}
                  labelText={key + ' ' + value}
                  checked={selectedOption.role === key}
                  onChange={handleRadioChange}
                  rowKey={value}
                />
              )
            })}
          </div>
        </div>

        <div className="admin-btn-container">
          <button
            disabled={loading.submit || loading.populate}
            className={`${
              loading.submit
                ? 'admin-add-agent-btn admin-btn-disabled'
                : 'admin-add-agent-btn'
            }`}
          >
            {loading.submit
              ? 'updating...'
              : loading.populate
              ? 'populating data...'
              : 'update access'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChangeAccess
