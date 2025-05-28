import { useState, useEffect } from 'react'
import FormRow from './FormRow'
import ComponentHeader from './ComponentHeader'
import { getManagers } from '../../crm context/CrmAction'
import { useAuthStatusTwo } from '../../hooks/useAuthStatusTwo'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { ROLES } from './roles'
const NewAgent = ({ data }) => {
  // console.log(data)
  const { claims } = useAuthStatusTwo()
  // console.log(claims)
  // return
  // console.log(claims)
  // GET ALL AGENTS WHERE ROLE > 1
  // GET ALL AGENTS WHERE ROLE > 1
  // GET ALL AGENTS WHERE ROLE > 1
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: 'Fiona',
    lastName: 'Ellis',
    email: 'fiona@gmail.com',
    password: '111111',
    reportsTo: null,
    role: '', // Add this
    roleLevel: 0,
  })

  // Update formData when claims load
  useEffect(() => {
    if (claims?.claims) {
      setFormData((prev) => ({
        ...prev,
        // missing data here !!
        orgName: claims.claims.orgName,
        orgId: claims.claims.orgId,
        defaultHandBack: {
          id: claims.defaultHandBack.id,
          name: claims.defaultHandBack.name,
        },
      }))
    }
  }, [claims])

  const formArr = Object.entries(formData)

  const handleFormInput = (e) => {
    const { name, value } = e.target

    // Special handling for role selection
    if (name === 'role') {
      const selectedOption = e.target.selectedOptions[0]
      const roleLevel = selectedOption.dataset.managerValue

      console.log(roleLevel)
      setFormData((prevState) => ({
        ...prevState,
        role: value, // This will be the role name (CEO, ADMIN, etc.)
        roleLevel: parseInt(roleLevel), // This will be the numeric level (4, 3, etc.)
      }))
    } else {
      // Handle other inputs normally
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

  const onSelectChange = (e) => {
    // const selectedFullName = e.target
    const selectedOption = e.target.selectedOptions[0] // Get the selected option
    const managerId = selectedOption.dataset.managerId // Get the data-manager-id value
    const managerName = selectedOption.value
    console.log({ managerId, managerName })
    setFormData((prev) => ({
      ...prev,
      reportsTo: {
        id: managerId,
        name: managerName,
      },
    }))
  }

  // on submit we have to check for
  // 1: -- organization id
  // 2: -- claims.manager = true

  //  ADD THE SUBORDINATES OBJ WITH ID, NAME, ROLE
  // const isFormComplete = Object.values(formData).every((value) => value !== '' && value !== null && value !== undefined)
  // const form = e.target
  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log(formData)

    // return
    setLoading(true)

    const functions = getFunctions()

    // Create a reference to your function
    const adminAddUser = httpsCallable(functions, 'adminAddUser')

    // Call the function
    try {
      const result = await adminAddUser({ data: formData })
      console.log(result.data)
      resetForm()
    } catch (error) {
      setLoading(false)
      console.error('Error:', error)
    }
  }

  function resetForm() {
    setFormData((prev) => ({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      reportsTo: { id: '', name: '' },
      organizationId: prev.organizationId,
      organization: prev.organization,
    }))
    setLoading(false)
  }

  // instead of using global state
  // make a specific server function
  // that handle the population
  // of user data for admin pannel

  const roleEntries = Object.entries(ROLES).filter(
    ([_, level]) => level <= claims?.claims?.roleLevel
  )

  return (
    <div>
      <form onSubmit={handleSubmit} className="admin-form">
        <ComponentHeader text={`add new agent`} />
        {/* Slice from index 0 to 4 to get only firstName, lastName, email, and password */}
        {formArr.slice(0, 4).map((item) => {
          const [key, value] = item
          return (
            <FormRow
              key={key}
              type={'text'}
              name={key}
              value={value}
              placeholder={`Enter ${key}`}
              onChange={handleFormInput}
              // added to stop duplicate on page
              formId="new-agent"
            />
          )
        })}

        <div className="select-row">
          <label className="admin-label" htmlFor="admin-label">
            Select Who Reports To
          </label>
          <select
            className="admin-select"
            id="admin-label"
            name="reportsTo"
            value={formData.reportsTo?.name || ''} // Change this to use the name property
            onChange={onSelectChange}
          >
            <option data-manager-id={'please-select'} value="">
              Select Manager
            </option>
            {data?.map((item) => {
              const { data } = item
              const fullName = `${data.firstName} ${data.lastName}`
              return (
                <option
                  data-manager-id={data.docId}
                  key={item.id}
                  value={fullName} // Add value here
                >
                  {fullName}
                </option>
              )
            })}
          </select>
        </div>

        {/*  */}

        <div className="select-row">
          <label className="role-select" htmlFor="role-select">
            Select Role
          </label>
          <select
            className="admin-select"
            id="role-select"
            name="role"
            value={formData.role || ''} // Make sure to add role to your formData state
            onChange={handleFormInput} // You can use the regular handleFormInput here
          >
            <option data-manager-id={'please-select'} value="">
              Select Role
            </option>
            {roleEntries?.map((item) => {
              const [key, value] = item

              return (
                <option
                  data-manager-id={value}
                  data-manager-value={value}
                  key={key}
                  value={key} // Add value here
                >
                  {key} access level {value}
                </option>
              )
            })}
          </select>
        </div>

        <div className="admin-btn-container">
          <button
            disabled={loading}
            className={`${
              loading ? 'admin-add-agent-btn admin-btn-disabled' : 'admin-add-agent-btn'
            }`}
          >
            {loading ? 'making user' : 'submit'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewAgent
