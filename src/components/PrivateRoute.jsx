import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStatusOne } from '../hooks/useAuthStatusOne'

function PrivateRoute() {
  const { loggedIn, checkingStatus } = useAuthStatusOne()

  // check status as delay in getting data to confirm user (null initially)
  if (checkingStatus) {
    return ''
  }

  return loggedIn ? <Outlet /> : <Navigate to="/agent-sign-in" />
}

export default PrivateRoute
