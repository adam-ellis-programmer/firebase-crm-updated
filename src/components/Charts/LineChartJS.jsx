import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { getAllOrders } from '../../crm context/CrmAction'
import Loader from '../../assets/Loader'

const LineChartJS = () => {
  const [monthlyData, setMonthlyData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Separate data processing function
  const processOrderData = (orders) => {
    const monthlyData = orders.reduce((acc, item) => {
      const [date, time] = item.dateOfOrder.split(',')
      const [day, month, year] = date.split('/')
      const monthKey = `${month}-${year}`

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month,
          year,
          totalSales: 0,
          orderCount: 0,
        }
      }

      acc[monthKey].totalSales += item.price
      acc[monthKey].orderCount += 1

      return acc
    }, {})

    // Convert to array and sort chronologically
    return Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) {
        return parseInt(a.year) - parseInt(b.year)
      }
      return parseInt(a.month) - parseInt(b.month)
    })
  }

  // data fetching
  useEffect(() => {
    const getData = async () => {
      try {
        const orders = await getAllOrders()
        const processedData = processOrderData(orders)
        setMonthlyData(processedData)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    }

    getData()
  }, [])

  // Separate data transformation for the chart
  const chartData = Array.from(monthlyData || [], (item) => ({
    month: item.month,
    sales: item.totalSales,
  }))

  if (loading) {
    return <Loader />
  }

  return (
    <div>
      <div className='chart-page-sub-header-div'>
        <p>sales by month</p>
      </div>
      <LineChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='month' padding={{ left: 30, right: 30 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type='monotone' dataKey='sales' stroke='#82ca9d' />
      </LineChart>
    </div>
  )
}

export default LineChartJS
