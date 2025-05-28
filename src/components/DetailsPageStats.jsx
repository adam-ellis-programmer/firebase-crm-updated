import CrmContext from '../crm context/CrmContext'
import { useContext } from 'react'
const DetailsPageStats = () => {
  const { customerStats } = useContext(CrmContext)

  const { points, rating, goldCustomer } = customerStats || {}

  return (
    <div className="details-page-stats-wrap">
      <div className="details-stats-div">
        <p>points</p>
        <p>{points}</p>
      </div>
      <div className="details-stats-div">
        <p>rating</p>
        <p>{rating}</p>
      </div>
      <div className="details-stats-div">
        <p>gold</p>
        <p>{goldCustomer ? 'yes' : 'no'}</p>
      </div>
    </div>
  )
}

export default DetailsPageStats
