import React, { useCallback, useState, useEffect } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { getAllOrders } from '../../crm context/CrmAction'
import { faHandsClapping } from '@fortawesome/free-solid-svg-icons'
import { formatPrice } from '../../CrmFunctions'
import Loader from '../../assets/Loader'

const data = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  // { name: 'Group D', value: 200 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const PieChartJS = () => {
  const [orderData, setOrderData] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [totalSum, setTotalSum] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const orders = await getAllOrders()
        // .sort((a, b) => a.price - b.price)
        setOrderData(orders)
        setLoading(false)
      } catch (error) {
        console.log(error)
      }
    }
    getData()
  }, [])

  // Move processOrderData into useEffect that depends on orderData
  useEffect(() => {
    if (!orderData) return

    const topSales = orderData.reduce((acc, item) => {
      const custId = item?.customerUid

      if (!acc[custId]) {
        acc[custId] = {
          name: item.customerName,
          total: 0,
          orderCount: 0,
          custId: item.customerUid,
        }
      }

      acc[custId].total += item.price
      acc[custId].orderCount += 1

      return acc
    }, {})

    // returns number of customers
    const data = Object.values(topSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)

    const totalTopThree = data.reduce((acc, item) => {
      acc += item.total
      return acc
    }, 0)

    setTotalSum(totalTopThree)

    setChartData(data)
  }, [orderData])

  if (loading) {
    return <Loader />
  }

  return (
    // bar-chart-container
    <div>
      <div className="chart-top-three-div">
        <h3>top three buyers</h3>
        <p>
          <span className="chart-dash-price">{formatPrice(totalSum)}</span>
        </p>
      </div>
      <div className="legend-pie-div">
        {chartData?.map((item, i) => {
          return (
            <div key={crypto.randomUUID()}>
              <div className="legend-pie-inner-div">
                <span>{item.name}</span>:{' '}
                <span style={{ backgroundColor: COLORS[i] }}></span>
              </div>

              <span className="pie-chart-price">{formatPrice(item.total)}</span>
            </div>
          )
        })}
      </div>

      <PieChart width={500} height={240}>
        <Pie
          data={chartData}
          cx={300}
          cy={120}
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="total"
        >
          {chartData?.map((entry, index) => {
            // console.log(entry)
            return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          })}
        </Pie>
      </PieChart>
    </div>
  )
}

export default PieChartJS
