import { useState, useEffect } from 'react'
import { getAllCustomers } from '../../crm context/CrmAction'
import Loader from '../../assets/Loader'

const getProgressColor = (progress) => {
  if (progress === 0) return '#e74c3c'
  if (progress <= 10) return '#f39c12'
  if (progress <= 50) return '#3498db'
  return '#2ecc71'
}

const ProgressChart = () => {
  const [customerData, setCustomerData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getCustomers = async () => {
      try {
        const customers = await getAllCustomers()
        const progressData = customers.reduce((acc, item) => {
          if (!acc[item.custId]) {
            acc[item.custId] = {
              id: item.custId,
              progress: item.progress,
              company: item.company,
              url: item.urlData.url,
              name: item.name,
            }
          }
          return acc
        }, {})
        // set customer data
        const data = Object.values(progressData)
        setCustomerData(data)
        setLoading(false)
      } catch (error) {}
    }

    getCustomers()
    return () => {}
  }, [])

  if (loading) {
    return <Loader />
  }
  return (
    <div>
      {/* sort by date and limit to 5 on the server */}
      {/* sandbox this and test on its own */}
      <div className="chart-page-sub-header-div">
        <p>last 5 sign on progress</p>
      </div>

      <div className="progress-bars-container">
        {customerData &&
          customerData.map((customer) => (
            <div key={customer.id} className="progress-item">
              <div className="progress-info">
                <span className="company-name">{customer.company}</span>
                <span className="progress-percentage">{customer.progress}%</span>
              </div>
              <div className="progress-bar-outer">
                <div
                  className="progress-bar-inner"
                  style={{
                    width: `${customer.progress}%`,
                    backgroundColor: getProgressColor(customer.progress),
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default ProgressChart
