import React from 'react'
import { useState, useEffect } from 'react'
import {
  getAllAgents,
  getManagersWithSubordinates,
  getAgentById,
  managersWithSubs,
} from '../../crm context/CrmAction'
import Loader from '../../assets/Loader'
import { useAuthStatusTwo } from '../../hooks/useAuthStatusTwo'
// get all agents
// check if that agent has a subordinate array > 1
// push that object into the return array
//

// The console.log is happening within the loop,
// so you see the updated state of allSubordinates
//  after each manager is processed.
// That's why you first see an array with one array,
// and then an array with two arrays.

const ReportsToInfo = () => {
  const { claims } = useAuthStatusTwo()
  const [agents, setAgents] = useState(null)
  const [subordinatesData, setSubordinatesData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!claims && claims?.claims) return
    const getAgentData = async () => {
      try {
        //..
        const res = await managersWithSubs(claims?.claims?.orgId)
        // console.log(res)
        setAgents(res)
        // ====
        // new code
        // ====

        const allSubordinates = []

        // item gives each person
        // check if subs is there and if is Array
        res.forEach((item) => {
          // returns arrays
          const subArr = item.data.subordinates
          if (subArr && Array.isArray(subArr)) {
            //  ... flat array
            allSubordinates.push(...subArr)
            // console.log(allSubordinates)
          }
        })

        // initialize the object
        const subordinateDetails = {}

        await Promise.all([
          // grab the ids to map over
          allSubordinates.map(async (subId) => {
            try {
              // initialize simple get agent function
              const agent = await getAgentById(subId)
              subordinateDetails[subId] = agent
              setSubordinatesData(subordinateDetails)
              console.log(subordinateDetails)
            } catch (error) {
              console.log(error)
            }
          }),
        ])
        setLoading(false)
      } catch (error) {
        console.log(error)
      }
    }

    if (claims) {
      getAgentData()
    }
    return () => {}
  }, [claims, claims?.claims])

  if (!subordinatesData && loading) {
    return <Loader />
  }
  return (
    <div className="page-container">
      <section className="rep-to-page-header">
        <h1>managers reports to page</h1>
      </section>
      <section className="rep-to-page-section">
        {agents?.map((agent) => {
          const { id, data } = agent
          const { firstName, lastName, subordinates } = data

          return (
            <div key={id} className="managersCard">
              <h3 className="subordinates-name">
                <span className="rep-to-page-managers-span">
                  <i className="fa-solid fa-people-roof"></i>
                </span>

                <span>
                  {firstName} {lastName}
                </span>
              </h3>

              <div className="subordinatesContainer">
                <h4 className="subordinates-h4">
                  Subordinates: <span className='rep-to-page-length-span'>{subordinates?.length || 0}</span>
                </h4>
                {subordinates && subordinates.length > 0 ? (
                  <ul className="subordinates-list">
                    {subordinates.map((subID) => {
                      console.log(subID)
                      // ***** OBJECT LOOKUP *****
                      // ***** RETURNS EACH OBJ *****
                      const subordinate = subordinatesData && subordinatesData[subID]

                      return (
                        <li key={subID}>
                          <span className="rep-to-page-span">
                            <i className="fa-solid fa-check"></i>
                          </span>
                          <span className="rep-to-page-span">
                            {' '}
                            {subordinate
                              ? `${subordinate.firstName} ${subordinate.lastName}`
                              : `Agent (ID: ${subID})`}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p>No subordinates</p>
                )}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default ReportsToInfo
