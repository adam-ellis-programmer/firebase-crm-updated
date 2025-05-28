import { useEffect, useState, useContext, useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'

import DisplayCustomerData from '../components/DisplayCustomerData'
import DisplayOrders from '../components/DisplayOrders'
import DisplayNotes from '../components/DisplayNotes'
import DeleteModal from '../drop down modals/DeleteModal'

import CrmContext from '../crm context/CrmContext'
import OrdersSumUp from '../components/OrdersSumUp'
import OrderEdit from '../drop down modals/OrderEdit'
import NoteEdit from '../drop down modals/NoteEdit'
import SendEmail from '../drop down modals/SendEmail'

import ProgressBar from '../components/ProgressBar'
import DetailsPageStats from '../components/DetailsPageStats'
import Loader from '../assets/Loader'
import { canViewData } from './view data dash/canView'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
import { getDocument } from '../crm context/CrmAction'
import RestricedAccessPage from './view data dash/RestricedAccessPage'
import useGetAgentDoc from '../hooks/useGetAgentDoc'
import SendText from '../drop down modals/SendText'
function SingleCustomer() {
  const { claims } = useAuthStatusTwo()
  const { agentDoc } = useGetAgentDoc(claims?.user_id, 'agents')
  const {
    deleteBtn,
    editPurchase,
    editNote,
    toggleEmail,
    ordersLength,
    notesLength,
    sendTextModal,
  } = useContext(CrmContext)

  const [searchParams, setSearchParams] = useSearchParams()
  const [customer, setCustomer] = useState(null)
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [authorized, setAuthorized] = useState(null)

  const navigate = useNavigate()
  const params = useParams()
  const auth = getAuth()

  const permissions = useMemo(() => {
    if (!agentDoc?.permissions) return {}

    return agentDoc.permissions
  }, [agentDoc])
  // Load customer data

  useEffect(() => {
    const fetchData = async () => {
      if (!claims) return
      try {
        const document = await getDocument(params.uid, 'customers')
        const agent = await getDocument(claims?.user_id, 'agents')
        document && setCustomer(document)
        agent && setAgent(agent)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.uid, claims?.user_id])
  
  // Only check authorization after both customer data AND user claims are loaded
  useEffect(() => {
    // Only proceed if loading is complete and we have both customer and claims
    if (!loading && customer && agent && claims) {
      try {
        // user, agent, document
        // We make sure not to run the check until we have both pieces of data
        const isAuthorized = canViewData(claims, agent, customer)
        setAuthorized(isAuthorized)
      } catch (error) {
        console.error('Authorization check error:', error)
        setAuthorized(false)
      } finally {
        setAuthChecked(true)
      }
    }
  }, [loading, customer, claims])

  // Show loader while initial data is loading
  if (loading) {
    return <Loader />
  }
  // Only show unauthorized page after auth check is complete and explicitly failed
  if (authChecked && !authorized) return <RestricedAccessPage />

  // Only render the content after we've confirmed authorization
  return (
    <>
      <ProgressBar />
      <div className="page-container single-customer-wrap grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-3">
        {searchParams.get('name')}
        <div className="customer-box cusomer-info-box">
          {toggleEmail && <SendEmail />}
          {deleteBtn && <DeleteModal />}
          {sendTextModal && <SendText />}

          <div className="customer-page-heading">
            <h2 className="page-heading">Personal Details</h2>
            <div className="profile-pic-container">
              <img
                className="profile-pic"
                src={customer?.urlData?.url || 'https://via.placeholder.com/150'}
                alt="Customer profile"
              />
            </div>
          </div>
          <DisplayCustomerData customer={customer} setCustomer={setCustomer} />
        </div>
        <div className="customer-box customer-box-orders">
          {editPurchase && <OrderEdit />}
          <DetailsPageStats />
          <div className="customer-page-heading">
            <h2 className="page-heading">
              Orders
              <div className="number-of-sales"> {ordersLength}</div>
            </h2>
            <OrdersSumUp />
          </div>
          <DisplayOrders permissions={permissions} />
        </div>
        <div className="customer-box customer-box-notes">
          {editNote && <NoteEdit />}
          <div className="customer-page-heading ">
            <h2 className="page-heading">
              Notes
              <div className="number-of-notes"> {notesLength}</div>
            </h2>
          </div>
          <DisplayNotes permissions={permissions} />
        </div>
      </div>
    </>
  )
}

export default SingleCustomer
