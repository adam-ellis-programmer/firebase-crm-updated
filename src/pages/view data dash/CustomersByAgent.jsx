import {
  getAgentCustomersByID,
  getAgentsCustomers,
  getAllAgents,
} from '../../crm context/CrmAction'
import { useAuthStatusTwo } from '../../hooks/useAuthStatusTwo'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import React from 'react'
import useGetAgentDoc from '../../hooks/useGetAgentDoc'
import { canViewpage } from './canView'
import RestricedAccessPage from './RestricedAccessPage'
import Loader from '../../assets/Loader'
import { faChessKing } from '@fortawesome/free-regular-svg-icons'
const CustomersByAgent = () => {
  const { uid } = useParams()
  const [claimsData, setClaimsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(null)
  const [customers, setCustomers] = useState(null)
  const { claims } = useAuthStatusTwo()
  const orgID = claims?.claims?.orgId
  const { agentDoc } = useGetAgentDoc(claims?.user_id, 'agents')
  // console.log(agentDoc)
  const roleLevel = claims?.claims?.roleLevel
  //   const agentId = claims?.claims?.agentId

  useEffect(() => {
    const getData = async () => {
      try {
        if (!uid) return
        const data = await getAgentCustomersByID(orgID, uid, roleLevel)
        setCustomers(data)
        setLoading(false)
      } catch (error) {
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }

    if (orgID) {
      getData()
    }
    return () => {}
  }, [orgID])

  useEffect(() => {
    if (claims && customers) {
      const isAuthorized = canViewpage(claims)
      setIsAuthorized(isAuthorized)
      setClaimsData(claims)
    }
    return () => {}
  }, [claims, customers])

  const newData = {
    img: '',
    name: '',
    company: '',
    docAccess: '',
    email: '',
    progress: 0,
  }

  if (loading) return <Loader />
  // if isAuth ret tru invert it to false so this does not run
  // if isAuth ret false invert this to true so it runs
  if (!isAuthorized) return <RestricedAccessPage />

  console.log(customers)
  console.log('object')
  // additionally check before render
  const headNames = Array.from(Object.keys(newData))
  const filtered = customers?.filter((item) => item.data.roleLevel <= roleLevel)
  return (
    <div className="page-container">
      <section>
        <h1 className="viewable-agents-h1">list of all my viewable agents allowed </h1>
        <ul>
          <li>my role level: {claimsData?.claims?.roleLevel}</li>
          <li>my role type: {claimsData?.claims?.role}</li>
          <li>show by access level</li>
          <li>equal or below yours</li>
          <li>page acces level ----</li>
        </ul>
      </section>
      <section>
        <div className="agent-table-row-header viewable-agents-header ">
          {headNames.map((item, i) => {
            return (
              <div key={i} className="agent-table-row">
                <span>{item}</span>
              </div>
            )
          })}
        </div>
        <ul className="agent-table-ul">
          {customers?.map((item, i) => {
            const { data, id } = item
            const { urlData, name, company, docAccessLevel, email, progress } = data
            // const date = new Date(signUpDate)
            return (
              <Link
                key={i}
                to={`/single-customer/${claims?.user_id}/${id}/${data.name}/?email=${data.email}`}
              >
                <li className="agent-table-li viewable-agents">
                  <div>
                    <img className="customer-img-agent-data" src={urlData.url} alt="" />
                  </div>
                  <div>
                    <p className="agent-table-p">
                      <span>name</span>
                    </p>
                    <p>{name}</p>
                  </div>
                  <div>
                    <p className="agent-table-p">
                      <span>company</span>
                    </p>
                    <p>{company}</p>
                  </div>
                  <div>
                    <p className="agent-table-p">
                      <span>access level</span>
                    </p>
                    <p>{docAccessLevel}</p>
                  </div>
                  <div>
                    <p className="agent-table-p">
                      <span>email</span>
                    </p>
                    <p> {email}</p>
                  </div>
                  <div>
                    <p className="agent-table-p">
                      <span>progress</span>{' '}
                    </p>
                    <p> {progress} %</p>
                  </div>
                </li>
              </Link>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

export default CustomersByAgent
