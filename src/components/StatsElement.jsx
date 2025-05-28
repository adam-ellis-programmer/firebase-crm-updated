import { useState, useEffect } from 'react'
import { getAndOrderStatsForStatsPage } from '../crm context/CrmAction'
import Loader from '../assets/Loader'
import { formatPrice } from '../CrmFunctions'

function StatsElement() {
  const [statsData, setStatsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  useEffect(() => {
    const getStatsData = async () => {
      try {
        const data = await getAndOrderStatsForStatsPage('stats')
        setLoading(false)
        setStatsData(data)
      } catch (error) {
        console.log(error)
      }
    }

    getStatsData()
  }, [])

  // for testing
  const getIndex = (index) => {
    // console.log(index);
  }

  const handleNameSearchChange = async (e) => {
    const data = await getAndOrderStatsForStatsPage('stats')
    const inputText = e.target.value.toLowerCase()
    const newArr = []

    data.forEach((item) => {
      const loopedItem = item.data.name.toLowerCase()
      if (loopedItem.indexOf(inputText) != -1) {
        newArr.push(item)
      }
    })
    setStatsData(newArr)
  }

  const handleEmailSearchChange = async (e) => {
    const data = await getAndOrderStatsForStatsPage('stats')
    const inputText = e.target.value.toLowerCase()
    const newArr = []

    data.forEach((item) => {
      const loopedItem = item.data.email.toLowerCase()
      if (loopedItem.includes(inputText)) {
        newArr.push(item)
      }
      setStatsData(newArr)
    })
  }

  // not equal to negaive one that means it matches as -1 means it does not match
  const handleCustIdSearchChange = async (e) => {
    const data = await getAndOrderStatsForStatsPage('stats')
    const inputText = e.target.value.toLowerCase()
    const newArr = []

    data.forEach((item) => {
      const loopedItem = item.data.custId.toLowerCase()

      if (loopedItem.indexOf(inputText) !== -1) {
        newArr.push(item)
      }
      setStatsData(newArr)
    })
  }

  // const handleSubmit = async (e) => { // works but not needed
  //   e.preventDefault();
  //   const data = await getAndOrderStatsForStatsPage('stats');
  //   const filtered = data.filter((item) => item.data.name == inputValue);
  //   setStatsData(filtered);
  // };
  return (
    <div className="page-container stats-page-container">
      <div className="stats-heading-container grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="stats-header-box">
          <form className="search-stats-form">
            <input
              onChangeCapture={handleCustIdSearchChange}
              className="search-stats-input"
              type="text"
              placeholder="Search Records By Customer ID"
            />
          </form>
        </div>
        <div className="stats-header-box">
          <form className="search-stats-form">
            <input
              onChangeCapture={handleEmailSearchChange}
              className="search-stats-input"
              type="text"
              placeholder="Search Records By Email"
            />
          </form>
        </div>
        <div className="stats-header-box">
          <form className="search-stats-form">
            <input
              onChangeCapture={handleNameSearchChange}
              className="search-stats-input"
              type="text"
              placeholder="Search Records By Name"
            />
          </form>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr className="table-row">
              <th className="table-span-med">id</th>
              {/* <th className="stats-page-custID">CustId</th> */}
              <th>email</th>
              <th>Name</th>
              <th className="points">Points</th>
              <th className="gold-customer">Gold Customer</th>
              <th className="num-of-orders"> Orders</th>
              <th className="table-span-med">Rating</th>
              <th className="amount-spent">Amount Spent</th>
              <th className="sign-up-agent">Account Owner</th>
            </tr>
          </thead>
          {/* prettier-ignore */}
          <tbody>
            {!loading && statsData &&
              statsData.length > 0 &&
              statsData.map(({ data, id }, index) => (
                <tr key={id}>
                  {getIndex(index)}
                  <td><div className="table-span table-span-med">{index + 1}</div></td>
                  {/* <td><div className="table-span stats-page-custID">{data.custId}</div></td> */}
                  <td><div className="table-span stats-cust-email">{data.email}</div></td>
                  <td><div className="table-span stats-cust-name">{data.name}</div></td>
                  <td><div className="table-span points">{data.points}</div></td>
                  <td><div className="table-span">{data.goldCustomer === false ? 'no' : 'yes'}</div></td>
                  <td><div className="table-span num-of-orders">{data.numberOfOrders}</div></td>
                  <td><div className="table-span stats-rating">{data.rating}</div></td>
                  <td><div className="table-span amount-spent">{formatPrice(data.amountSpent)}</div></td>
                  <td><div className="table-span sign-up-agent">{data.signUpagent}</div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {loading && <Loader />}
    </div>
  )
}

export default StatsElement
