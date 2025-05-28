import { Link } from 'react-router-dom'

const RestricedAccessPage = () => {
  return (
    <div className="access-denied-wrap">
      <p>Access denied!</p>
      <p>You are not authorized to access this page</p>
      <div className="go-back-auth-btn-div">
        <Link className="go-back-auth-btn" to="/dashboard">
          Go back
        </Link>
      </div>
    </div>
  )
}

export default RestricedAccessPage
