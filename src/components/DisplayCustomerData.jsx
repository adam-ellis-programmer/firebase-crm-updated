import { useState, useContext, useMemo } from 'react'
import CrmContext from '../crm context/CrmContext'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'

import { getAuth } from 'firebase/auth' // only show if it's that agent's listing
import { onSubmit } from '../crm context/CrmAction'
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import ProfileControlButtons from './ProfileControlButtons'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
function DisplayCustomerData({ customer }) {
  const { claims } = useAuthStatusTwo()
  const { changeDetails, sendTextModal, dispatch } = useContext(CrmContext)

  const permissions = useMemo(() => {
    if (!claims?.claims) return {}
    return claims?.claims
  }, [claims])
  // *** leave for reference ***
  const location = useLocation()
  const navigate = useNavigate()
  const auth = getAuth()
  // const dispatch = useDispatch()
  // *** leave for reference ***
  const [data, setData] = useState({
    name: customer.name,
    phone: customer.email,
    fullData: customer,
  })
  //
  const { name, phone } = data

  const params = useParams()

  const onChange = (e) => {
    setData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }
  console.log('-----ran----')

  try {
    // if change details true
    changeDetails && onSubmit(params.uid, name, phone)
  } catch (error) {
    console.log(error)
  }

  // **** leave for reference  ****
  // const custNum = customer.phone.split('-')
  // custNum[1] = custNum[1] + ' - '
  // custNum[0] = custNum[0] + ' - '
  // **** leave for reference  ****

  const formatPhoneNumber = (phoneNumber) => {
    if (phoneNumber === '') {
      return (
        <div className='profile-extra-info profile-phone-div'>
          <div>phone</div>
          <p className='no-number'>No number To Display</p>
        </div>
      )
    }
    // Remove any non-digit characters first
    const cleaned = phoneNumber.replace(/\D/g, '')
    // Split the number into groups
    const areaCode = cleaned.slice(0, 5)
    const middle = cleaned.slice(5, 8)
    const end = cleaned.slice(8)

    // regex check if UK mobile
    const mobReg = /^07/
    const isMobile = mobReg.test(cleaned)

    return (
      <div className='profile-extra-info profile-phone-div'>
        <div>{isMobile ? 'Mobile' : 'Phone'}</div>
        <div>
          <span className='formatted-phone-number'>({areaCode})</span>
          <span className='formatted-phone-number'> - {middle}</span>
          <span className='formatted-phone-number'> - {end}</span>
        </div>
      </div>
    )
  }

  const handleOpenTextModal = () => {
    console.log('opening modal....')
    dispatch({ type: 'TOGGLE_TEXT_MODAL', payload: !sendTextModal })
    dispatch({ type: 'CUST_NUM', payload: customer.phone })
  }

  return (
    <div>
      <div className='profile-card profile-page-card'>
        <form className='profile-form'>
          <input
            className={changeDetails ? 'profile-input' : 'profile-card-active'}
            type='text'
            id='name'
            onChange={onChange}
            value={name}
            disabled={!changeDetails}
          />
          <input
            className={changeDetails ? 'profile-input' : 'profile-card-active'}
            type='text'
            id='phone'
            onChange={onChange}
            value={phone}
            disabled={!changeDetails}
          />
        </form>
      </div>

      <div className='customer-details'>
        <div className='customer-details-container'>
          <p className='profile-extra-info'>
            Org Name <span> {permissions?.orgName}</span>
          </p>

          <p className='profile-extra-info'>
            Cust ID <span>{customer.custId} </span>{' '}
          </p>

          <button onClick={handleOpenTextModal} className='send-text-btn'>
            {formatPhoneNumber(customer.phone)}
          </button>

          <p className='profile-extra-info'>
            Email <span>{customer.email} </span>
          </p>
          <p className='profile-extra-info'>
            Date Of Signup <span>{customer.dateOfSignUp.split(',')[0]} </span>
          </p>
          <p className='profile-extra-info'>
            Time Of Signup <span>{customer.dateOfSignUp.split(',')[1]} </span>
          </p>
          <p className='profile-extra-info'>
            Sign Up Agent
            <span>
              {customer.signUpagent ? customer.signUpagent : 'System'}
            </span>
          </p>
          <p className='profile-extra-info'>
            Account
            <span>{customer.company}</span>
          </p>
          {/* prettier-ignore */}
          <p className="profile-extra-info profile-formatedAddress">
            Address
            <span>
              {customer.signUpagent ? customer.formattedAddress : 'System'}
            </span>
          </p>
          <p className='profile-extra-info'>
            Postcode
            <span>ST5 1LT</span>
          </p>
          <p className='profile-extra-info'>
            Agent Reports To
            <span>{customer.reportsTo.name}</span>
          </p>
        </div>

        <ProfileControlButtons />
        <div className='docs-link-contaimer'>
          <Link to={`/docs/${customer?.custId}`} className='documents-link'>
            documents
          </Link>
        </div>
      </div>

      <div className='map-container'>
        <MapContainer
          style={{
            height: '100%',
            width: '100%',
            borderRadius: '2em',
          }}
          center={[customer.geoLocation.lat, customer.geoLocation.lng]}
          zoom={14}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <Marker
            position={[customer.geoLocation.lat, customer.geoLocation.lng]}
          >
            <Popup>
              <div
                className='box'
                style={{
                  width: '100%',
                  fontSize: '20px',
                }}
              >
                Customers Address <br /> Easily customizable.
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  )
}

export default DisplayCustomerData
