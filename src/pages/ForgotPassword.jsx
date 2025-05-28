import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { toast } from 'react-toastify'
import { ReactComponent as ArrowRightIcon } from '../icons/svg/keyboardArrowRightIcon.svg'

// function to reset the  password (NOT IN USE)
function ForgotPassword() {
  const [email, setEmail] = useState('')

  const onChange = (e) => {
    setEmail(e.target.value)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, email)
      toast.success('Email Sent, Please check your emails!')
    } catch (error) {
      console.log(error)
      toast.error('Could not send reset email')
    }
  }

  return (
    <div className="page-container">
      <header>
        <p className="page-header">Forgot Password</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <input
            className="reset-email"
            type="email"
            name=""
            id="email"
            placeholder="Reset Email"
            value={email}
            onChange={onChange}
          />

          <Link className="forgot-password-link" to="/sign-in">
            Sign In
          </Link>

          <div className="sign-in-bar">
            <div className="sign-in-text">Send Reset Link</div>
            <button className="sign-in-button">
              <ArrowRightIcon fill="#fff" height="34px" width="34px" />
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default ForgotPassword
