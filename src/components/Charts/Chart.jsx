import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  getAllCustomersForProfilePageCompanyStats,
  sumByCompany,
} from '../../crm context/CrmAction'
import Loader from '../../assets/Loader'
const data = [
  {
    company: 'gmail',
    spent: 200,
  },
]

const Chart = () => {
  const [companyStats, setcompanyStats] = useState(null)
  const [loading, setloading] = useState(true)

  // convert array of objects to usable data
  const newArr = Array.from(companyStats || [], (item) => {
    return {
      company: item.company,
      spent: item.amount,
    }
  })

  useEffect(() => {
    // data from stats
    const getCompanyStats = async () => {
      try {
        const userData = await getAllCustomersForProfilePageCompanyStats(
          'stats'
        )
        const data = sumByCompany(userData)

        setcompanyStats(data)
        setloading(false)
      } catch (error) {}
    }

    getCompanyStats()
  }, [])
  // bar-chart-container

  if (loading) {
    return <Loader />
  }
  return (
    <div className=''>
      <div className='chart-page-sub-header-div'>
        <p>sales by company (top 20)</p>
      </div>
      <BarChart
        width={500}
        height={300}
        data={newArr.slice(0, 20)}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='company' />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey='spent'
          radius={[5, 5, 0, 0]}
          fill='#313562'
          background={{ fill: '#eee' }}
        />
        {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
      </BarChart>
    </div>
  )
}

export default Chart
