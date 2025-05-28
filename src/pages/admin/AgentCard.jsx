import React from 'react'

const AgentCard = ({ item, i }) => {
  const { data: agent } = item
  const { data } = item
  console.log(data)
  const { claims } = data

  //   console.log(data?.reportsTo)

  const structuredData = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    organization: data.orgName,
    reportsTo: data?.reportsTo,
    role: data?.role,
    roleLevel: data?.roleLevel,
  }

  console.log(structuredData)

  const agentData = Object.entries(structuredData)
  const reportsToData = Object.entries(structuredData?.reportsTo ?? [])

  function formatField(fieldName) {
    const findCaps = /([A-Z])/g
    const findFirstLetter = /^./

    return fieldName
      .replace(findCaps, ' $1')
      .replace(findFirstLetter, (str) => str.toUpperCase())
  }
  console.log(agentData.slice(5))
  return (
    <div className="agent-card">
      <div className="agent-card-inner-div">
        <span className="item-num-span">{i + 1}</span>
        {agentData.slice(0, 2).map(([key, value]) => {
          return (
            <React.Fragment key={`agent-${formatField(key)}`}>
              <span className="card-key-value-pair">
                <div className="agent-card-name-info key">{formatField(key)}:</div>{' '}
                <div className="agent-card-name-info value">{value}</div>
              </span>
            </React.Fragment>
          )
        })}
      </div>
      <div>
        <div className="agent-card-inner-div">
          {agentData.slice(2, 4).map(([key, value]) => {
            //   console.log(key)
            return (
              <span key={key} className="card-key-value-pair">
                <div className="agent-card-name-info key">{formatField(key)}:</div>{' '}
                <div className="agent-card-name-info value">{value}</div>
              </span>
            )
          })}
        </div>
      </div>
      <div>
        <div className="agent-card-inner-div-claims">
          {agentData.slice(5).map(([key, value]) => {
            return (
              <span key={key} className="card-key-value-pair">
                <div className="agent-card-name-info key">{formatField(key)}:</div>{' '}
                <div className="agent-card-name-info value">{value}</div>
              </span>
            )
          })}
        </div>
      </div>

      <div className="agent-card-inner-div-claims">
        {reportsToData.slice(1, 2).map(([key, value]) => {
          return (
            <span key={key} className="card-key-value-pair">
              <div className="agent-card-name-info key">{formatField('reportsTo')}:</div>{' '}
              <div className="agent-card-name-info value">{value}</div>
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default AgentCard
