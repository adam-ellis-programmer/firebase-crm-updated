import { useEffect, useState } from 'react'
import { aggregateData, formatPrice } from '../../../CrmFunctions'

const AggeregatedHour = () => {
  const [hourData, setHourData] = useState(null)
  useEffect(() => {
    const getAggData = async () => {
      const data = (await aggregateData()).hourData
      setHourData(data)
    }

    getAggData()
    return () => {}
  }, [])

  return (
    <>
      <div className="chart-page-sub-header-div">
        <p>Hour data</p>
      </div>

      <div className="aggeregated-data-container">
        <div className="aggeregated-data-box ag-box-hour">
          <p> orders</p>
          <p>{hourData?.count}</p>
        </div>
        <div className="aggeregated-data-box ag-box-hour">
          <p> average spend</p>
          <p>{formatPrice(hourData?.average)}</p>
        </div>
        <div className="aggeregated-data-box ag-box-hour">
          <p> min spend</p>
          <p>{formatPrice(hourData?.min)}</p>
        </div>
        <div className="aggeregated-data-box ag-box-hour">
          <p> max spend</p>
          <p>{formatPrice(hourData?.max)}</p>
        </div>
        <div className="aggeregated-data-box ag-box-hour">
          <p> total spend</p>
          <p>{formatPrice(hourData?.total)}</p>
        </div>
      </div>
    </>
  )
}

export default AggeregatedHour
