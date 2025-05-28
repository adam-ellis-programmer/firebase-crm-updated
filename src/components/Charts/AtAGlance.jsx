import { useEffect, useState } from 'react'
import { getAllOrders, getAllOrdersStructured } from '../../crm context/CrmAction'
import { aggeregatedData, formatPrice } from '../../CrmFunctions'
import Loader from '../../assets/Loader'

const AtAGlance = () => {
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const date = new Date()

  //   prettier-ignore
  const processOrderData = (orders) => {
    const  processData = orders.reduce((acc, item) => {
        acc.prices.push(item.price)
        acc.orderCount += 1
        return acc
      },
      { prices: [], orderCount: 0 }
    )

    // If we have no prices, return 0 for all values
    if ( processData.prices.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        averageSpend: 0,
        totalOrders: 0,
      }
    }

    // **** old way keep for reference ***
    // Check if we have any prices before calculating min/max
    // const hasOrders =  processData.prices.length > 0
    // 
    // maxPrice: hasOrders ? Math.max(... processData.prices) : 0,
    // **** old way keep for reference ***
    
    // Calculate values using array methods (no initial value needed)
    const minPrice =  processData.prices.reduce((min, price) => Math.min(min, price))
    const maxPrice =  processData.prices.reduce((max, price) => Math.max(max, price))
    const totalSpend =  processData.prices.reduce((sum, price) => sum + price, 0)
    const averageSpend = totalSpend /  processData.orderCount

    return {
      minPrice,
      maxPrice,
      averageSpend,
      totalOrders:  processData.orderCount,
    }
  }

  useEffect(() => {
    const getData = async () => {
      try {
        const orders = await getAllOrders()
        // processes the actual order data 
        const processData = processOrderData(orders)
        setOrderData(processData)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    }

    getData()
  }, [])

  if (loading) {
    return <Loader />
  }
  return (
    <>
      <div className="chart-page-sub-header-div">
        <p>
          at a glance <span> for year: {date.getFullYear()}</span>
        </p>
      </div>
      <div className="other-data-container">
        <div className="other-data-box">
          <p>max spend</p>
          <p>{formatPrice(orderData.maxPrice)}</p>
        </div>
        <div className="other-data-box">
          <p>min spend</p>
          <p>{formatPrice(orderData.minPrice)}</p>
        </div>

        <div className="other-data-box">
          <p>avg spend</p>
          <p>{formatPrice(orderData.averageSpend)}</p>
        </div>
        <div className="other-data-box">
          <p> orders</p>
          <p>{orderData.totalOrders}</p>
        </div>
        <div className="other-data-box">
          <p> month</p>
          <p>0</p>
        </div>
        <div className="other-data-box">
          <p> week</p>
          <p>0</p>
        </div>
      </div>
    </>
  )
}

export default AtAGlance
