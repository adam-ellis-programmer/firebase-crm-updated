import { useEffect, useState, useContext } from 'react'
import { toast } from 'react-toastify'
import { getAuth, updateProfile, onAuthStateChanged } from 'firebase/auth'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.config'
import Loader from '../assets/Loader'
import CrmContext from '../crm context/CrmContext'
import {
  getEmailsToDisplayInAgentProfile,
  getOrdersToDisplayInAgentProfile,
  getNotesToDisplayInAgentProfile,
} from '../crm context/CrmAction'
import AgentToDoList from '../components/AgentToDoList'
import DashboardHeader from '../components/DashboardHeader'
import DisplayCompanySumUp from '../components/DisplayCompanySumUp'
import Chart from '../components/Charts/Chart'
import PieChartJs from '../components/Charts/PieChartJS'
import LineChartJS from '../components/Charts/LineChartJS'
import ChartButtons from '../components/Charts/ChartButtons'
import Claims from '../components/Claims'

function Profile() {
  const [loading, setLoading] = useState(true)

  const { dispatch, profileChartType } = useContext(CrmContext)
  window.addEventListener('beforeunload', () => {
    console.log('User clicked back button')
  })

  const auth = getAuth()
  const params = useParams()

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setAgentId(user.uid)
      }
    })

    const fetchAllData = async () => {
      try {
        setLoading(true) // Start the loader

        // Run all the async functions in parallel
        const [emailsData, ordersData, notesData] = await Promise.all([
          getEmailsToDisplayInAgentProfile('emails', params.uid),
          getOrdersToDisplayInAgentProfile('orders', params.uid),
          getNotesToDisplayInAgentProfile('notes', params.uid),
        ])

        // Set the respective states after fetching the data
        setEmails(emailsData)
        setOrders(ordersData)
        setNotes(notesData)
      } catch (error) {
        console.log(error)
      } finally {
        // Set loading to false only after all data is fetched
        setLoading(false)
      }
    }

    fetchAllData()
  }, [auth, params.uid])

  const [changeDetails, setChangeDetails] = useState(false)
  const [emails, setEmails] = useState(null)
  const [orders, setOrders] = useState(null)
  const [notes, setNotes] = useState(null)
  const [agentId, setAgentId] = useState('')

  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { name, email } = formData

  const navigate = useNavigate('/')

  const onLogout = () => {
    auth.signOut()
    dispatch({ type: 'LOGGED_IN_USER_NAME', payload: '' })
    navigate('/')
  }

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  // user cannot edit email here
  const onSubmit = async () => {
    try {
      // if the name has not been changed no need to update
      if (auth.currentUser.displayName !== name) {
        // 1: update firebase auth
        await updateProfile(auth.currentUser, {
          displayName: name,
        })
      }

      // 2: update in fireStore
      const userRef = doc(db, 'users', auth.currentUser.uid)
      await updateDoc(userRef, {
        name,
      })
    } catch (error) {
      toast.error('Could not be updated ')
    }
  }

  if (loading) {
    return <Loader />
  }
  // console.log(orders)
  return (
    <div className="page-container">
      <DashboardHeader />
      <main>
        <div className="profile-grid gap-6 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
          <div className="profile-agent-details profile-grid-item">
            <div className="profile-detais-header">
              <button
                className="change-personal-details"
                onClick={() => {
                  changeDetails && onSubmit()
                  setChangeDetails((prevState) => !prevState)
                }}
              >
                {changeDetails ? 'done' : 'edit details'}
              </button>
            </div>
            <div className="">
              <form className="agent-profile-info-card">
                <input
                  type="text"
                  id="name"
                  className={!changeDetails ? 'agent-details' : 'agent-details ag-active'}
                  disabled={!changeDetails}
                  value={name}
                  onChange={onChange}
                />
                <input
                  type="text"
                  id="email"
                  className={!changeDetails ? 'agent-details' : 'agent-details ag-active'}
                  disabled={!changeDetails}
                  value={email}
                  onChange={onChange}
                />
              </form>
            </div>
            {/* display claims data! */}
            <Claims />

            {emails && emails.length > 0 ? (
              <>
                <p className="profile-top-five-header profile-emails">
                  most recent 5 emails
                </p>
                <div className="most-recent-heading">
                  {' '}
                  <span className="most-recent-text">Name</span>
                  <span className="most-recent-text">Email</span>
                  <span className="most-recent-text">Date</span>
                </div>
              </>
            ) : (
              <div className="profile-no-data-container">
                <p>no emails to show yet</p>
              </div>
            )}
            <ul className="most-recent-customers">
              {emails &&
                emails.map(({ id, data }) => (
                  <li key={id} className="most-recent-customers-items">
                    <span className="most-recent-email-info">{data.customerName}</span>
                    <span className="most-recent-email-info">{data.emailBody}</span>
                    <span className="most-recent-email-info">{data.dateSent}</span>
                  </li>
                ))}
            </ul>

            {orders && orders.length > 0 ? (
              <>
                <p className="profile-top-five-header profile-sales">
                  most recent 5 Sales
                </p>
                <div className="most-recent-heading">
                  {' '}
                  <span className="most-recent-text">Item</span>
                  <span className="most-recent-text">Price</span>
                  <span className="most-recent-text">For</span>
                  <span className="most-recent-text">Email</span>
                  <span className="most-recent-text">Date</span>
                </div>
              </>
            ) : (
              <div className="profile-no-data-container">
                <p>no sales to show yet</p>
              </div>
            )}
            <ul className="most-recent-customers">
              {orders &&
                orders.map(({ id, data }) => (
                  <li key={id} className="most-recent-customers-items">
                    <span className="most-recent-email-info">{data.selectItem}</span>
                    <span className="most-recent-email-info">{data.price}</span>
                    <span className="most-recent-email-info">{data.customerName}</span>
                    <span className="most-recent-email-info">{data.customerEmail}</span>

                    <span className="most-recent-email-info">{data.dateOfOrder}</span>
                  </li>
                ))}
            </ul>

            {notes && notes.length > 0 ? (
              <>
                <p className="profile-top-five-header profile-notes">
                  most recent 5 Notes
                </p>
                <div className="most-recent-heading">
                  <span className="most-recent-text">customer</span>
                  <span className="most-recent-text">email</span>
                  <span className="most-recent-text">note</span>
                  <span className="most-recent-text">Date</span>
                </div>
              </>
            ) : (
              <div className="profile-no-data-container">
                <p>no notes to show yet</p>
              </div>
            )}

            <ul className="most-recent-customers">
              {notes &&
                notes.map(({ id, data }) => (
                  <li key={id} className="most-recent-customers-items">
                    <span className="most-recent-email-info">{data.customerName}</span>
                    <span className="most-recent-email-info">{data.customerEmail}</span>
                    <span className="most-recent-email-info">{data.noteText}</span>
                    <span className="most-recent-email-info">{data.dateOfNote}</span>
                  </li>
                ))}
            </ul>
          </div>

          <div className="profile-dash profile-grid-item">
            <p className="profile-btn-container">
              <Link
                className="profile-btns"
                to={`/new-customer?agentName=${auth.currentUser.displayName}&agentId=${auth.currentUser.uid}`}
              >
                NEW CUSTOMER
              </Link>
              <Link className="profile-btns" to={`/stats/${params.uid}`}>
                COMPANY STATS
              </Link>
              <Link className="profile-btns" to={`/data/${agentId}`}>
                VIEW ALL CUSTOMERS
              </Link>
            </p>
            <div className="taskList">
              <AgentToDoList />
            </div>
          </div>
          <div className="agentStats-container profile-grid-item">
            <div className="agent-stats-header-container">
              <p className="agent-stats-text">
                <span>Top 3 accounts stats at a glance</span>
              </p>
            </div>
            <DisplayCompanySumUp />
            <ChartButtons />

            {/* *** leave for reference *** */}
            {/* {(() => {
              switch (profileChartType) {
                case 'lineChart':
                  return <LineChartJS />
                case 'pieChart':
                  return <PieChartJs />
                case 'barChart':
                  return <Chart />
                default:
                  return null
              }
            })()} */}
            {/* *** leave for reference *** */}

            {profileChartType === 'lineChart' ? (
              <LineChartJS />
            ) : profileChartType === 'pieChart' ? (
              <PieChartJs />
            ) : profileChartType === 'barChart' ? (
              <Chart />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
