import { useEffect, useState } from 'react'
import { aggregateData, formatPrice } from '../../../CrmFunctions'

const AggeregatedYear = () => {
  const [yearData, setYearData] = useState(null)
  useEffect(() => {
    const getAggData = async () => {
      // The parentheses tell JavaScript: "Open this box first, then look for yearData inside"
      const data = (await aggregateData()).yearData
      setYearData(data)
    }

    getAggData()
    return () => {}
  }, [])

  return (
    <>
      <div className='chart-page-sub-header-div'>
        <p>Year data</p>
      </div>
      <div className='aggeregated-data-container'>
        <div className='aggeregated-data-box ag-box-year'>
          <p> orders</p>
          <p>{yearData?.count}</p>
        </div>
        <div className='aggeregated-data-box ag-box-year'>
          <p> average spend</p>
          <p>{formatPrice(yearData?.average)}</p>
        </div>
        <div className='aggeregated-data-box ag-box-year'>
          <p> min spend</p>
          <p>{formatPrice(yearData?.min)}</p>
        </div>
        <div className='aggeregated-data-box ag-box-year'>
          <p> max spend</p>
          <p>{formatPrice(yearData?.max)}</p>
        </div>
        <div className='aggeregated-data-box ag-box-year'>
          <p> total spend</p>
          <p>{formatPrice(yearData?.total)}</p>
        </div>
      </div>
    </>
  )
}

export default AggeregatedYear
