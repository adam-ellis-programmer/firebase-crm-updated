import { useEffect, useState } from 'react'
import { aggregateData, formatPrice } from '../../../CrmFunctions'

const AggeregatedMonths = () => {
  const [monthData, setMonthData] = useState(null)
  useEffect(() => {
    const getAggData = async () => {
      const data = (await aggregateData()).monthData
      setMonthData(data)
    }

    getAggData()
    return () => {}
  }, [])
  // console.log(monthData?.min)
  return (
    <>
      <div className='chart-page-sub-header-div'>
        <p>Month data</p>
      </div>
      <div className='aggeregated-data-container'>
        <div className='aggeregated-data-box ag-box-month'>
          <p> orders</p>
          <p>{monthData?.count}</p>
        </div>
        <div className='aggeregated-data-box ag-box-month'>
          <p> average spend</p>
          <p>{formatPrice(monthData?.average)}</p>
        </div>
        <div className='aggeregated-data-box ag-box-month'>
          <p> min spend</p>
          <p>{formatPrice(monthData?.min)}</p>
        </div>
        <div className='aggeregated-data-box ag-box-month'>
          <p> max spend</p>
          <p>{formatPrice(monthData?.max)}</p>
        </div>
        <div className='aggeregated-data-box ag-box-month'>
          <p> total spend</p>
          <p>{formatPrice(monthData?.total)}</p>
        </div>
      </div>
    </>
  )
}

export default AggeregatedMonths
