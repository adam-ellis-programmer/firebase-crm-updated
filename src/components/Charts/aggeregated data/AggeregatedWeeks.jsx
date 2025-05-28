import { useEffect, useState } from 'react'
import { aggregateData, formatPrice } from '../../../CrmFunctions'

const AggeregatedWeeks = () => {
  const [weekData, setweekData] = useState(null)
  useEffect(() => {
    const getAggData = async () => {
      const data = (await aggregateData()).weekData
      // console.log(data )
      setweekData(data)
    }

    getAggData()
    return () => {}
  }, [])

  return (
    <>
      <div className='chart-page-sub-header-div'>
        <p>Week data</p>
      </div>
      <div className='aggeregated-data-container'>
        <div className='aggeregated-data-box ag-box-week'>
          <p> orders</p>
          <p>{weekData?.count}</p>
        </div>
        <div className='aggeregated-data-box ag-box-week'>
          <p> average spend</p>
          <p>{formatPrice(weekData?.average)}</p>
        </div>
        <div className='aggeregated-data-box ag-box-week'>
          <p> min spend</p>
          <p>{formatPrice(weekData?.min)}</p>
        </div>
        <div className='aggeregated-data-box ag-box-week'>
          <p> max spend</p>
          <p>{formatPrice(weekData?.max)}</p>
        </div>
        <div className='aggeregated-data-box ag-box-week'>
          <p> total spend</p>
          <p>{formatPrice(weekData?.total)}</p>
        </div>
      </div>
    </>
  )
}

export default AggeregatedWeeks
