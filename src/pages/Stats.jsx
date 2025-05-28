import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
import { Navigate, useNavigate } from 'react-router-dom'
import { getData } from '../crm context/CrmAction'
import { getAuth, onAuthStateChanged, useRef } from 'firebase/auth'
import { useEffect } from 'react'
import StatsElement from '../components/StatsElement'
function Stats() {
  const { loggedIn, checkingStatus } = useAuthStatusTwo()

  const auth = getAuth()
  const navigate = useNavigate()

  if (checkingStatus) {
    return <h3>Loading ...</h3>
  }

  if (!loggedIn) {
    return <Navigate to="/sign-in" />
  }

  return (
    <div className="stats-div">
      <StatsElement />
    </div>
  )
}

export default Stats
