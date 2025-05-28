import { useEffect, useState } from 'react'
import {
  getAllCustomersForProfilePageCompanyStats,
  sumByCompany,
} from '../crm context/CrmAction'

function DisplayCompanySumUp() {
  const [companyStats, setcompanyStats] = useState(null)

  useEffect(() => {
    const getCompanyStats = async () => {
      const userData = await getAllCustomersForProfilePageCompanyStats('stats')
      const data = sumByCompany(userData)
      setcompanyStats(data)
    }
    getCompanyStats()
  }, [])

  // Create formatter for GBP currency
  const formatCurrency = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const sortedArray =
    companyStats &&
    companyStats
      .sort((a, b) => {
        return b.amount - a.amount
      })
      .slice(0, 3)

  if (sortedArray && sortedArray.length === 0) {
    return (
      <div className="profile-no-data-container stats-no-data">
        <p>no data to show yet</p>
      </div>
    )
  }

  return (
    <div className="profile-page-account-stats-container">
      <ul className="profile-stats-ul">
        {sortedArray &&
          sortedArray.map((item, index) => (
            <li key={index} className="profile-stats-li">
              <span>{item.company}</span>
              <span>{formatCurrency.format(item.amount)}</span>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default DisplayCompanySumUp
