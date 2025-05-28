import { useState, useEffect } from 'react'
import {
  getAllOrders,
  getAllOrdersStructured,
} from '../../crm context/CrmAction'
import { formatPrice } from '../../CrmFunctions'

const ChartTopSalesReps = () => {
  const [salesData, setsalesData] = useState(0)

  useEffect(() => {
    const getOrders = async () => {
      const orders = await getAllOrders()
      // ----- not in use yet -----
      const ordersStruct = await getAllOrdersStructured()

      // setOrderData()
      // toatl for main page
      const totalData = orders.reduce((acc, item) => {
        if (!acc[item.agentId]) {
          acc[item.agentId] = {
            id: item.agentId,
            name: item.agentName,
            total: 0,
            totalSales: 0,
          }
        }
        acc[item.agentId].total += 1
        acc[item.agentId].totalSales += item?.price

        return acc
      }, {})

      setsalesData(
        Object.values(totalData).sort((a, b) => b.totalSales - a.totalSales)
      )
    }

    getOrders()
    return () => {}
  }, [])

  //   testing fucntion left for reference
  const arr = Array.from({ length: 20 }, (_, i) => {
    return { id: crypto.randomUUID(), name: 'test', total: i + 1 }
  })

  return (
    <div>
      <div className='chart-page-sub-header-div'>
        <p>top sales people</p>
      </div>

      <div className='sales-header'>
        <div>Agent Name</div>
        <div>Total Sales</div>
        <div>Total pipline</div>
      </div>

      <div className='sales-container'>
        <div className='sales-grid'>
          {salesData &&
            salesData.map((agent) => (
              <div key={agent.id} className='sales-row'>
                <div>{agent.name}</div>
                <div>{agent.total}</div>
                <div>{formatPrice(agent.totalSales)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ChartTopSalesReps
