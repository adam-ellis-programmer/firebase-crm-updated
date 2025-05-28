import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { getCustomersForMainDataPage, getTeamData } from '../crm context/CrmAction'

import DataSvgIcon from '../components/DataSvgIcon'
import Loader from '../assets/Loader'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
// getTeamData()
// tidy up
// useAuth hook
// check access function only allow if data is === to own id
function MyData() {
  // const { loggedInUser } = useAuthStatusTwo()
  const auth = getAuth()
  // const [searchParams, setSearchParams] = useSearchParams()
  const [customers, setCustomers] = useState(null)
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [loggedInUserUid, setLoggedInUserUid] = useState('')
  // const [searchTearm, setSearchTearm] = useState('initialState')
  const [loading, setLoading] = useState(true)
  // ONLY USE THE IS MY DATA FUNCTION
  // check do these record strictly belong to me

  // use filter to only show viewer.id === document
  // use filere to only show correct docs
  //
  // useEffect(() => {
  //   const getData = async () => {
  //     const data = await getTeamData(loggedInUserUid)
  //     console.log(data)
  //   }
  //   if (loggedInUserUid) {
  //     getData()
  //   }

  //   return () => {}
  // }, [loggedInUserUid])

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      // console.log('USER: --> ', user)
      if (user) {
        setLoggedInUser(user.displayName)
        setLoggedInUserUid(user.uid)
      } else {
        // console.log('logged out')
      }
    })
  }, [loggedInUser])

  const params = useParams()

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await getCustomersForMainDataPage('customers', loggedInUserUid)
        // console.log(data)
        setLoading(false)
        setCustomers(data)
      } catch (error) {
        setLoading(false)
        console.log(error)
      }
    }

    getData()
  }, [loggedInUserUid])

  const handleNameSearch = async (e) => {
    const data = await getCustomersForMainDataPage('customers', params.uid)
    const searchTearm = e.target.value.toLowerCase()

    const newArr = []
    data.forEach((item) => {
      const loopedItem = item.data.name.toLowerCase()
      if (loopedItem.indexOf(searchTearm) !== -1) {
        newArr.push(item)
      }
    })
    setCustomers(newArr)
  }

  const handleEmailSearch = async (e) => {
    const data = await getCustomersForMainDataPage('customers', params.uid)
    const searchTearm = e.target.value.toLowerCase()
    const newArr = []

    data.forEach((item) => {
      const loopedItem = item.data.email.toLowerCase()
      if (loopedItem.indexOf(searchTearm) !== -1) {
        newArr.push(item)
      }
      setCustomers(newArr)
    })
  }

  const handleCompanySearch = async (e) => {
    const data = await getCustomersForMainDataPage('customers', params.uid)
    const searchTearm = e.target.value.toLowerCase()
    const newArr = []

    data.forEach((item) => {
      const loopedItem = item.data.company.toLowerCase()
      if (loopedItem.indexOf(searchTearm) !== -1) {
        newArr.push(item)
      }

      setCustomers(newArr)
    })
  }

  const handleOwnerSearch = async (e) => {
    const searchTearm = e.target.value.toLowerCase()
    const data = await getCustomersForMainDataPage('customers', params.uid)
    const newArr = []
    data.forEach((item) => {
      const loopedItem = item.data.signUpagent.toLowerCase()
      if (loopedItem.indexOf(searchTearm) !== -1) {
        newArr.push(item)
      }

      setCustomers(newArr)
    })
  }

  return (
    <div className="page-container">
      <header className="data-header">
        <p className="data-header-text">
          <span> {loggedInUser && `Showing ${loggedInUser}s data`}</span>
        </p>
      </header>

      <main>
        <div className="page-container data-page-container">
          <div className="main-data-page-search-container grid grid-cols-1 lg:grid-cols-4">
            <div className="name-search-box data-page-search-box">
              <input
                onChange={handleNameSearch}
                className="data-page-search-input"
                type="text"
                placeholder="Search Name"
                id="nameSearch"
              />
            </div>
            <div className="name-search-box data-page-search-box">
              <input
                onChange={handleEmailSearch}
                className="data-page-search-input"
                type="text"
                placeholder="Search Email"
                id="emailSearch"
              />
            </div>
            <div className="name-search-box data-page-search-box">
              <input
                onChange={handleCompanySearch}
                className="data-page-search-input"
                type="text"
                placeholder="Search Company"
                id="companySearch"
              />
            </div>
            <div className="name-search-box data-page-search-box">
              <input
                onChange={handleOwnerSearch}
                className="data-page-search-input"
                type="text"
                placeholder="Search Owner"
                id="ownerSearch"
              />
            </div>
          </div>

          <div className="main-data-container">
            <table>
              <thead>
                <tr className="data-table-head-row">
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Phnoe Number</th>
                  <th>date Of SignUp</th>
                  <th>Owner</th>
                  <th>Options</th>
                </tr>
              </thead>

              {/* prettier-ignore */}
              <tbody>
                {!loading && customers &&
                  customers.length > 0 &&
                  customers.map(({ data, id }, index) => (
                    <tr key={index} className="data-table-row">
                      <td className='profile-picture-data-table-container' >{index + 1}  <div className='profile-picture-data-table' > <img  src={data?.urlData?.url} alt=""/> </div>  </td>
                      <td>{data.name}</td>
                      <td>{data.email}</td>
                      <td>{data.company}</td>
                      <td>{data.phone}</td>
                      <td>{data.dateOfSignUp}</td>
                      <td>{data.signUpagent}</td>
                      <td>
                        <Link
                          to={`/single-customer/${loggedInUserUid}/${id}/${data.name}/?email=${data.email}`}
                        >
                          <button className="more-data-info-button">
                            More Info
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {customers && customers.length === 0 && (
              <div className="no-data-container">
                <DataSvgIcon />
              </div>
            )}
            {loading && <Loader />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default MyData
