import LineChartJS from '../components/Charts/LineChartJS'
import Chart from '../components/Charts/Chart'
import PieChartJS from '../components/Charts/PieChartJS'
import { Link, useNavigate } from 'react-router-dom'
import CrmContext from '../crm context/CrmContext'
import { useState, useEffect, useMemo } from 'react'
import { getAllCustomers, getAllOrders } from '../crm context/CrmAction'
import { formatPrice } from '../CrmFunctions'
import ProgressChart from '../components/Charts/ProgressChart'
import ChartDashTotal from '../components/Charts/ChartDashTotal'
import OtherData from '../components/Charts/AtAGlance'
import ChartTopSalesReps from '../components/Charts/ChartTopSalesReps'
import AggeregatedYear from '../components/Charts/aggeregated data/AggeregatedYear'
import AggeregatedMonths from '../components/Charts/aggeregated data/AggeregatedMonths'
import AggeregatedWeeks from '../components/Charts/aggeregated data/AggeregatedWeeks'
import AggeregatedDaily from '../components/Charts/aggeregated data/AggeregatedDaily'
import AggeregatedHour from '../components/Charts/aggeregated data/AggeregatedHour'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'

const url = new URL(window.location.href)
const id = url.pathname.split('/')[2]
// console.log(id)

const ChartDash = () => {
  const [total, setTotal] = useState(0)
  const [customerData, setCustomerData] = useState(null)
  const { claims } = useAuthStatusTwo()
  const orgId = useMemo(() => claims?.claims?.orgId, [claims?.claims?.orgId])
  // console.log(orgId)
  // console.log(claims?.claims)
  const navigate = useNavigate()

  // console.log(claims?.claims?.ceo)

  useEffect(() => {
    // Only navigate away if ceo is explicitly false
    if (claims?.claims?.ceo === false) {
      navigate('/')
      return
    }
    return () => {}
  }, [claims])

  useEffect(() => {
    const getOrders = async () => {
      const orders = await getAllOrders()

      // setOrderData()
      // toatl for main page
      const totalData = orders.reduce((acc, item) => {
        acc += item.price
        return acc
      }, 0)

      setTotal(totalData)
    }

    getOrders()
    return () => {}
  }, [total])

  // **** USE A PROMISE ALL FOR ALL THESE CALLS **** //

  useEffect(() => {
    const getCustomers = async () => {
      const customers = await getAllCustomers()
      // console.log(customers)

      const progressData = customers.reduce((acc, item) => {
        if (!acc[item.custId]) {
          acc[item.custId] = {
            id: item.custId,
            progress: item.progress,
            company: item.company,
            url: item.urlData.url,
            name: item.name,
          }
        }
        return acc
      }, {})

      // set customer data
      const data = Object.values(progressData)
      setCustomerData(data)
    }

    getCustomers()
    return () => {}
  }, [])

  const getProgressColor = (progress) => {
    if (progress === 0) return '#e74c3c'
    if (progress <= 10) return '#f39c12'
    if (progress <= 50) return '#3498db'
    return '#2ecc71'
  }

  return (
    <div className='page-container '>
      <section className='chart-dash-header'>
        <h1>Your Dashboard</h1>
      </section>

      {/* test className='test open-test' */}
      {/* .test.open{} */}
      {/* do some vanilla date tests in ms */}
      {/* sort admin out */}
      {/* orders for this month and week */}
      <section className='chart-dash-page-info'>
        <ChartDashTotal />
        {/* prettier-ignore */}
        <div className="chart-dash-btn-container">
        <Link className='chart-dash-btn' to={`/data/${id}`}>my data</Link>
        <Link className='chart-dash-btn' to={`/all-data/${id}`}>team data</Link>
        <Link className='chart-dash-btn' to={`/profile/${id}`}>my profile</Link>
       </div>
      </section>

      <section className='chart-dash-section '>
        <div className=''>
          {/* sales by company */}
          <Chart />
        </div>
        <div>
          {/* sales by month  */}
          <LineChartJS />
        </div>
        <div>
          {/* top three buyers */}
          <PieChartJS />
        </div>
        <div>
          {/* last 5 sign on progress */}
          <ProgressChart />
        </div>
        <div>
          {/* at a glance for yea */}
          <OtherData />
        </div>
        <div>
          {/* top sales people */}
          <ChartTopSalesReps />
        </div>
        <div>
          {/* Year data */}
          <AggeregatedYear />
        </div>
        <div>
          {/* Month Data */}
          <AggeregatedMonths />
        </div>
        <div>
          {/* Week data */}
          <AggeregatedWeeks />
        </div>
        <div>
          {/* Daily data */}
          <AggeregatedDaily />
        </div>
        <div>
          {/* This Hour Data */}
          <AggeregatedHour />
        </div>
      </section>
    </div>
  )
}

export default ChartDash
