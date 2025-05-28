import { getFunctions, httpsCallable } from 'firebase/functions'
import { useEffect, useState } from 'react'
import DataAllItem from '../components/DataAllItem'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
import Loader from '../assets/Loader'
import { getTeamData } from '../crm context/CrmAction'
// view by subordinates
const ManagersTeamData = () => {
  // console.log('ManagersTeamData page')
  // console.log('view by subordinates ')
  const { loggedInUser, claims } = useAuthStatusTwo()
  const [customers, setCustomers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await getTeamData(claims?.user_id)
        setCustomers(data.data)
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }
    if (claims?.user_id) {
      getData()
    }

    return () => {}
  }, [claims?.user_id])

  if (loading) {
    return <Loader />
  }

  if (error) {
    return (
      <div className="page-container">
        <p className="error-message">Error loading data: {error}</p>
      </div>
    )
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="page-container">
        <p>No team data available.</p>
      </div>
    )
  }

  return (
    <div className="page-container all-data-page-container">
      <section className="all-data-section-top">
        <p className="all-data-header-p">
          {claims?.name ? `${claims.name}'s` : 'Team'} <span>team data</span>
        </p>
        <p className="all-data-header-p">
          <span className="all-data-check">
            <i className="fa-solid fa-check"></i>
          </span>{' '}
          <span>company:</span> {claims?.claims?.orgName || 'N/A'}
        </p>
        <p className="all-data-header-p">
          <span className="all-data-check">
            <i className="fa-solid fa-check"></i>
          </span>{' '}
          <span>showing ALL customers of your team </span>
        </p>
        <p className="all-data-header-p">
          <span className="all-data-check">
            <i className="fa-solid fa-check"></i>
          </span>{' '}
          <span>sorted by your subordnates </span>
        </p>
        <p className="all-data-header-p">
          <span className="managers-customers-length">{customers.length}</span>
        </p>
      </section>

      <section className="all-data-section">
        <div className="data-header">
          <div className="data-header-div">ID</div>
          <div className="data-header-div">img</div>
          <div className="data-header-div">access</div>
          <div className="data-header-div">name</div>
          <div className="data-header-div">email</div>
          <div className="data-header-div">company</div>
          <div className="data-header-div">phone</div>
          <div className="data-header-div">reg date</div>
          <div className="data-header-div">owner</div>
          <div className="data-header-div">rep to</div>
        </div>

        {customers.map((customer, i) => (
          <DataAllItem
            key={customer.id}
            customer={customer}
            i={i}
            loggedInUser={loggedInUser}
            claims={claims}
          />
        ))}
      </section>
    </div>
  )
}

export default ManagersTeamData
