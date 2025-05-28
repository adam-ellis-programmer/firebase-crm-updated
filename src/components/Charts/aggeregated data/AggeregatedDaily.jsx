import { useEffect, useState } from 'react'
import { aggregateData, formatPrice } from '../../../CrmFunctions'

const AggeregatedDaily = () => {
  const [todayData, setTodayData] = useState(null)
  useEffect(() => {
    const getAggData = async () => {
      const data = (await aggregateData()).todayData
      setTodayData(data)
    }

    getAggData()
    return () => {}
  }, [])

  return (
    <>
      <div className="chart-page-sub-header-div">
        <p>Daily data</p>
      </div>

      <div className="aggeregated-data-container">
        <div className="aggeregated-data-box ag-box-day">
          <p> orders</p>
          <p>{todayData?.count}</p>
        </div>
        <div className="aggeregated-data-box ag-box-day">
          <p> average spend</p>
          <p>{formatPrice(todayData?.average)}</p>
        </div>
        <div className="aggeregated-data-box ag-box-day">
          <p> min spend</p>
          <p>{formatPrice(todayData?.min)}</p>
        </div>
        <div className="aggeregated-data-box ag-box-day">
          <p> max spend</p>
          <p>{formatPrice(todayData?.max)}</p>
        </div>
        <div className="aggeregated-data-box ag-box-day">
          <p> total spend</p>
          <p>{formatPrice(todayData?.total)}</p>
        </div>
      </div>
    </>
  )
}

export default AggeregatedDaily
