import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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

  // Enhanced data transformation for the chart with better month labels
  const chartData = Array.from(monthlyData || [], (item) => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const monthLabel = `${monthNames[parseInt(item.month) - 1]} ${item.year}`

    return {
      month: monthLabel,
      sales: item.totalSales,
      orderCount: item.orderCount,
    }
  })

  if (loading) {
    return <Loader />
  }

  return (
    <div className='w-full'>
      <div className='chart-page-sub-header-div'>
        <p>sales by month</p>
      </div>
      <div className='w-full h-96'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='month'
              angle={-45}
              textAnchor='end'
              interval={0}
              height={80}
            />
            <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip
              formatter={(value, name) => [
                `$${value.toLocaleString()}`,
                'Sales',
              ]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Line
              type='monotone'
              dataKey='sales'
              stroke='#82ca9d'
              strokeWidth={3}
              dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#82ca9d', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default LineChartJS
