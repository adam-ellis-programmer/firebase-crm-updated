import { useState, useEffect } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, query, serverTimestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import {
  addAgentToDbFromAdmin,
  getListOfAgentsForAdminPage,
} from '../../crm context/CrmAction'
import { db } from '../../firebase.config'
import { doc, deleteDoc, writeBatch, getDocs, where } from 'firebase/firestore'
import Loader from '../../assets/Loader'
import AdminPageMModal from '../../modals/AdminPageMModal'
import { useAuthStatusTwo } from '../../hooks/useAuthStatusTwo'

function AdminPage() {
  const [managers, setManagers] = useState([])
  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState(null)
  const [loadingStates, setLoadingStates] = useState({
    permissions: false,
    signUp: false,
    delete: false,
  })

  const { claims } = useAuthStatusTwo()
  console.log(claims?.claims)

  const [disabledStates, setDisabledStates] = useState({
    populate: true,
    addModify: true,
    newAgent: true,
    delete: true,
  })

  const [oldReportsTO, setOldReportsTO] = useState({})
  const [newReportsTo, setNewReportsTo] = useState({})

  const [deleteData, setDeleteData] = useState(null)
  const auth = getAuth()
  const [agentData, setAgentData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getAgentUsers = async () => {
      const data = await getListOfAgentsForAdminPage('agents')
      setAgentData(data)
      setLoading(false)
    }
    getAgentUsers()
  }, [])

  const [permissions, setPermissions] = useState({
    adminEmail: 'hello@pub.com',
    admin: false,
    manager: false,
    ceo: false,
    sales: false,
    reportsTo: 'none chosen',
  })

  const [newAgent, setNewAgent] = useState(null)
  const [newAgentData, setNewAgentData] = useState({
    name: 'lisa jones',
    email: 'lisa@gmail.com',
    password: '111111',
    userReportsTo: 'none chosen',
  })

  const [deleteAgentData, setDeleteAgentData] = useState({
    agentEmailToDelete: '',
  })

  const { adminEmail, admin, manager, ceo, sales, reportsTo } = permissions
  const { name, email, password, userReportsTo } = newAgentData
  const { agentEmailToDelete } = deleteAgentData

  // Handles the loading states of the buttons
  // helper function to manage loading state
  const handleButtonLoading = (booleanValue, state) => {
    // takes in boolean value and the state ('permissions etc')
    setLoadingStates((prevState) => ({
      ...prevState,
      [state]: booleanValue,
    }))
  }
  const handleButtonDisabling = (booleanValue, button) => {
    // takes in boolean value and the state ('permissions etc')
    setDisabledStates((prevState) => ({
      ...prevState,
      [button]: booleanValue,
    }))
  }

  const changePermissions = async (e) => {
    e.preventDefault()
    handleButtonLoading(true, 'permissions')

    const callFirebaseFunction = async () => {
      const functions = getFunctions()
      const addAdminRole = httpsCallable(functions, 'addAdminRole')

      try {
        const result = await addAdminRole({
          email: adminEmail,
          admin,
          manager,
          ceo,
          sales,
          reportsTo,
        })

        if (result.data.status === 'ok') {
          setShowAlert(true)
          setAlertData(result)
          resetPermissionData()

          console.log(result.data.customClaims.reportsTo)

          const newReportsToData = {
            name: result.data.customClaims.reportsTo.name,
            id: result.data.customClaims.reportsTo.id,
          }

          // Wait for state update to complete before calling batchChanges
          batchChanges(newReportsToData)
        } else {
          console.log(result)
        }
      } catch (error) {
        console.log(`error: ${JSON.stringify(error)}`)
      } finally {
        handleButtonLoading(false, 'permissions')
      }
    }
    callFirebaseFunction()
  }

  const onMutate = (e) => {
    let boolean = null

    if (e.target.value === 'true') {
      boolean = false
    }
    if (e.target.value === 'false') {
      boolean = true
    }

    setPermissions((prevState) => ({
      ...prevState,
      [e.target.id]: boolean ?? e.target.value,
    }))
  }

  // Add this useEffect to handle adminEmail changes
  // onMutate function doesn't trigger immediately upon pasting
  // explicitly monitor changes to the adminEmail field and set the button state accordingly

  const onSignUpChange = (e) => {
    setNewAgentData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  // make sure we add on the custom claims
  const onAddNewAgent = async (e) => {
    e.preventDefault()

    console.log('clicked .....')
    handleButtonLoading(true, 'signUp')

    const agentId = `AG-${name.toUpperCase().slice(0, 4)}-${crypto
      .randomUUID()
      .toUpperCase()
      .slice(0, 4)}`

    const functions = getFunctions()

    try {
      // create auth user
      const makeNewUser = httpsCallable(functions, 'makeNewUser')
      const userRecord = await makeNewUser({
        email,
        password,
        name,
        organization: claims?.claims?.organization,
        organizationId: claims?.claims?.organizationId,
        reportsTo: 'me',
      })

      // console.log(userRecord)
      setNewAgent(userRecord)

      const agentOrigUid = userRecord.data.userRecord.uid
      console.log('Successfully created new user:', agentOrigUid)
      console.log('userRecord:', userRecord)

      const newAgentObj = {
        name: userRecord.data.userRecord.displayName,
        email: userRecord.data.userRecord.email,
        agentUid: agentOrigUid,
        timestamp: serverTimestamp(),
        agentId,
        tasksLength: 0,
        msgLength: 0,
        messages: [],
        reportsTo: userReportsTo,
        salesTeamIds: [],
        // claims from the logged in user
        organization: claims?.claims?.organization,
        organizationId: claims?.claims?.organizationId,
        claims: {
          admin: false,
          manager: false,
          ceo: false,
          sales: false,
          reportsTo: '',
          organization: false,
          organizationId: false,
        },
      }

      const data = await addAgentToDbFromAdmin('agents', agentOrigUid, newAgentObj)
      console.log(data)

      const getUpdatedData = await getListOfAgentsForAdminPage('agents')

      setAgentData(getUpdatedData)
      resetNewAgentData()
    } catch (error) {
      console.log('Error creating new user:', error)
    } finally {
      handleButtonLoading(false, 'signUp')
    }
  }

  const onChangeDelete = (e) => {
    setDeleteAgentData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const handleDeleteSubmit = (e) => {
    e.preventDefault()
    handleButtonLoading(true, 'delete')

    const functions = getFunctions()
    const deleteAgent = httpsCallable(functions, 'deleteAgent')

    deleteAgent({
      email: agentEmailToDelete,
    })
      .then((user) => {
        // console.log(user.data.userData)
        // console.log(user)
        setDeleteData(user.data.userData)
        deleteDoc(doc(db, 'agents', user.data.userData.uid))
        const updatedDomData = agentData.filter(
          (item) => item.id !== user.data.userData.uid
        )
        setAgentData(updatedDomData)
        resetDeleteData()
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        handleButtonLoading(false, 'delete')
      })
  }

  const resetPermissionData = () => {
    setPermissions({
      adminEmail: '',
      admin: false,
      manager: false,
      ceo: false,
      sales: false,
      reportsTo: 'none chosen',
    })
  }

  const resetNewAgentData = () => {
    setNewAgentData({
      name: '',
      email: '',
      password: '',
    })
  }

  const resetDeleteData = () => {
    setDeleteAgentData({
      agentEmailToDelete: '',
    })
  }

  useEffect(() => {
    const getData = async () => {
      const functions = getFunctions()
      const listAllUsers = httpsCallable(functions, 'listAllUsers')
      try {
        const result = await listAllUsers()
        const managers = []
        result.data.users.forEach((item) => {
          if (item?.customClaims?.claims.manager === true) {
            managers.push(item)
          }
        })
        setManagers(managers)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    getData()
  }, [])

  const handleSelectChange = (e) => {
    const value =
      e.target.value === 'none chosen' ? 'none chosen' : JSON.parse(e.target.value)
      console.log(value)
    setPermissions((prevState) => ({
      ...prevState,
      reportsTo: value,
    }))
  }
  const handleSelectChangeAdmin = (e) => {
    // value is an object -> parsed
    const value =
      e.target.value === 'none chosen' ? 'none chosen' : JSON.parse(e.target.value)

    setNewAgentData((prevState) => ({
      ...prevState,
      userReportsTo: value,
    }))
  }

  const handlePopulate = async (e) => {
    e.preventDefault()
    console.log('adminEmail value:', adminEmail) // Add this line
    // return
    const functions = getFunctions()
    const getUser = httpsCallable(functions, 'getUser')

    try {
      const res = await getUser({ email: adminEmail })

      const userClaims = res.data.customClaims.claims
      console.log('reports to name:', userClaims.reportsTo.name)

      setPermissions((prevState) => ({
        ...prevState,
        admin: userClaims?.admin || false,
        manager: userClaims?.manager || false,
        ceo: userClaims?.ceo || false,
        sales: userClaims?.sales || false,

        reportsTo: userClaims?.reportsTo ? userClaims.reportsTo.name : 'none chosen',
      }))
      return

      setOldReportsTO({
        id: userClaims?.claims.reportsTo.id,
        name: userClaims?.claims.reportsTo.name,
      })
    } catch (error) {
      console.log(error)
    }
  }

  // ** firebase batch updates ** //
  // funciton to change the id of the 'reports to' which changes the manager
  //::-->  atomic batch transaction
  async function batchChanges(newReportsToData) {
    try {
      const newID = newReportsToData.id
      const newName = newReportsToData.name
      const oldID = oldReportsTO.id

      const batch = writeBatch(db)

      // Query for the `customers` collection
      const customersQuery = query(
        collection(db, 'customers'),
        where('reportsTo.id', '==', oldID)
      )

      const customersQuerySnapshot = await getDocs(customersQuery)

      // Update the `customers` collection
      customersQuerySnapshot.forEach((document) => {
        batch.update(document.ref, {
          'reportsTo.id': newID,
          'reportsTo.name': newName,
        })
      })

      // Query for the `users` collection
      const usersQuery = query(
        collection(db, 'users'),
        where('reportsTo.id', '==', oldID)
      )
      const usersQuerySnapshot = await getDocs(usersQuery)

      // Update the `users` collection
      usersQuerySnapshot.forEach((document) => {
        batch.update(document.ref, {
          'reportsTo.id': newID,
          'reportsTo.name': newName,
        })
      })

      // Commit all changes in the batch
      await batch.commit()
      console.log('Batch update committed successfully')
    } catch (error) {
      console.error('Error during batch update:', error)
    }
  }

  // **** handle disable buttons *** //
  useEffect(() => {
    if (adminEmail.length > 5) {
      console.log('hello')
      handleButtonDisabling(false, 'populate')
      handleButtonDisabling(false, 'addModify')
    } else {
      handleButtonDisabling(true, 'populate')
      handleButtonDisabling(true, 'addModify')
    }
  }, [adminEmail]) // This will monitor changes to adminEmail.

  useEffect(() => {
    // Enable the button only if the `name` field is not empty
    if (name.trim() !== '') {
      handleButtonDisabling(false, 'newAgent')
    } else {
      handleButtonDisabling(true, 'newAgent')
    }
  }, [name]) // Monitor changes to the `name` field

  useEffect(() => {
    if (agentEmailToDelete.trim() !== '') {
      handleButtonDisabling(false, 'delete')
    } else {
      handleButtonDisabling(true, 'delete')
    }
  }, [agentEmailToDelete]) // Monitor changes to the `name` field

  return (
    <div>
      {/* <Test /> */}
      {showAlert && <AdminPageMModal alertData={alertData} setShowAlert={setShowAlert} />}
      <div className="admin-grid">
        <div className="agent-sign-up agent-sign-up-left">
          <div className="agent-inner-div-text">
            <div className="sign-in-text-container">
              <h1 className="sign-in-h1-text">Admin Panel</h1>
            </div>
            <div className="sign-in-text-container">
              <ul className="sign-in-info">
                <li className="sign-in-list">Control agents' access privileges</li>
                <li className="sign-in-list">Change Permissions</li>
                <li className="sign-in-list">Add and Delete Users</li>
                <li className="sign-in-list">Keep Track of who is logging in</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="agent-sign-up agent-sign-up-right">
          <div className="admin-controls-text-container">
            <p>Your Admin Controls</p>
          </div>
          <div className="sign-in-form-container">
            <div className="admin-control-header">
              <p className="admin-control-text">Change Admin Permissions</p>
            </div>
            <form onSubmit={changePermissions} className="agent-sign-in-form">
              <input
                onChange={onMutate}
                className="sign-up-input"
                type="text"
                id="adminEmail"
                placeholder="Enter Email to change / add admin"
                value={adminEmail}
              />
              <div className="checkbox-container">
                <div className="checkbox-inner">
                  <label className="admin-label" htmlFor="admin">
                    Admin
                  </label>
                  <input
                    className="admin-check"
                    onChange={onMutate}
                    type="checkbox"
                    id="admin"
                    value={admin}
                    checked={admin}
                  />
                </div>
                <div className="checkbox-inner">
                  <label className="admin-label" htmlFor="manager">
                    Manager
                  </label>
                  <input
                    className="admin-check"
                    type="checkbox"
                    id="manager"
                    onChange={onMutate}
                    value={manager}
                    checked={manager}
                  />
                </div>
                <div className="checkbox-inner">
                  <label className="admin-label" htmlFor="ceo">
                    CEO
                  </label>
                  <input
                    className="admin-check"
                    type="checkbox"
                    id="ceo"
                    onChange={onMutate}
                    value={ceo}
                    checked={ceo}
                  />
                </div>
                <div className="checkbox-inner">
                  <label className="admin-label" htmlFor="sales">
                    Sales
                  </label>
                  <input
                    className="admin-check"
                    type="checkbox"
                    id="sales"
                    onChange={onMutate}
                    value={sales}
                    checked={sales}
                  />
                </div>
              </div>
              <div className="reports-to-div">
                <label className="reports-to-label" htmlFor="reportsTo">
                  Reports To::----
                </label>
                <select
                  onChange={handleSelectChange}
                  className="manager-select"
                  name=""
                  id="reportsTo"
                  value={JSON.stringify(reportsTo)}
                >
                  <option value="none chosen">Please select</option>
                  {managers &&
                    managers.map((item, i) => (
                      <option
                        key={i}
                        value={JSON.stringify({ name: item.displayName, id: item.uid })}
                      >
                        {item.displayName}
                      </option>
                    ))}
                </select>
              </div>
              <button
                disabled={disabledStates.populate}
                onClick={handlePopulate}
                className="modify-agent-button"
              >
                Populate
              </button>
              <button
                disabled={loadingStates.permissions || disabledStates.addModify}
                className={`modify-agent-button ${
                  loadingStates.permissions && 'button-loading'
                }`}
              >
                {loadingStates.permissions ? 'Wait...' : 'Add / Modify Roles'}
              </button>
            </form>
          </div>
          <div className="sign-in-form-container">
            <div className="admin-control-header">
              <p className="admin-control-text">Add New User</p>
            </div>
            <form onSubmit={onAddNewAgent} className="agent-sign-in-form">
              <input
                onChange={onSignUpChange}
                className="sign-up-input"
                type="text"
                id="name"
                placeholder="Enter Name"
                value={name}
              />
              <input
                onChange={onSignUpChange}
                className="sign-up-input"
                type="email"
                id="email"
                placeholder="Enter Email"
                value={email}
              />
              <input
                onChange={onSignUpChange}
                className="sign-up-input"
                type="password"
                id="password"
                placeholder="Choose Password"
                value={password}
                autoComplete="true"
              />
              {/* add in reports to select box */}

              <div className="reports-to-div">
                <label className="reports-to-label" htmlFor="reportsTo">
                  Reports To
                </label>
                <select
                  onChange={handleSelectChangeAdmin}
                  className="manager-select"
                  name=""
                  id="userReportsTo"
                  value={JSON.stringify(userReportsTo)}
                >
                  <option value="none chosen">Please select</option>
                  {managers &&
                    managers.map((item, i) => (
                      <option
                        key={i}
                        value={JSON.stringify({ name: item.displayName, id: item.uid })}
                      >
                        {item.displayName}
                      </option>
                    ))}
                </select>
              </div>
              <button
                disabled={loadingStates.signUp || disabledStates.newAgent}
                className={`sign-up-agent-button ${
                  loadingStates.signUp && 'button-loading'
                }`}
              >
                {loadingStates.signUp ? 'Loading...' : 'Sign Up New Agent'}
              </button>
            </form>
          </div>
          <div className="sign-in-form-container">
            <div className="admin-control-header">
              <p className="admin-control-text">Delete User</p>
            </div>
            <form onSubmit={handleDeleteSubmit} className="agent-sign-in-form">
              <input
                onChange={onChangeDelete}
                className="sign-up-input"
                type="text"
                id="agentEmailToDelete"
                placeholder="Enter Email of agent to delete"
                value={agentEmailToDelete}
              />
              <button
                disabled={loadingStates.delete || disabledStates.delete}
                className={`modify-agent-button delete-agent ${
                  loadingStates.delete && 'button-loading'
                }`}
              >
                {loadingStates.delete ? 'deleting...' : 'Delete User'}
              </button>
            </form>
          </div>
        </div>
        <div className="agent-page-right">
          <div className="agent-page-right-header-container">
            <p>Active Agents</p>
          </div>
          <div className="user-list-container">
            <ul className="user-list-ul">
              {!loading &&
                agentData &&
                agentData.length > 0 &&
                agentData.map((item) => (
                  <li key={item.id} className="user-list-li">
                    <span className="user-list-info">{item.data.name}</span>
                    <span className="user-list-info">{item.data.email}</span>
                  </li>
                ))}
            </ul>
            {loading && <Loader />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
