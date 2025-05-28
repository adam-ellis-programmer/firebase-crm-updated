import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'

import { getAuth } from 'firebase/auth'
import { Navigate, useNavigate, useSearchParams, useParams } from 'react-router-dom'

import NewSignupForm from '../components/forms/NewSignupForm'


function NewCustomer() {
  const { loggedIn, checkingStatus, claims } = useAuthStatusTwo()
  // const [searchParams, setSetSearchParams] = useSearchParams()
  // console.log(searchParams.get('agentName'))
  // console.log(claims)
  const auth = getAuth()

  const params = useParams()
  const navigate = useNavigate()
  // console.log(auth.currentUser.displayName);

  const onMutate = (e) => {}

  if (checkingStatus) {
    return <h1>Loading...</h1>
  }

  if (!loggedIn) {
    return <Navigate to="/sign-in" />
  }
  return (
    <div className=" new-sign-up-container">
      <p className="signup-head-p">sign up a new customer</p>
      <div className="new-sign-up-page-container">
        <div className="new-sign-up-div"></div>
        <div className="new-sign-up-div">
          <NewSignupForm />
        </div>
        <div className="new-sign-up-div"></div>
      </div>
    </div>
  )
}

export default NewCustomer
