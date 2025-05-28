import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import CrmContext from '../crm context/CrmContext'
import { toast } from 'react-toastify'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

function AgentLogInForm() {
  const { navLoginLogoutControl, dispatch, showPasswordResetModal } =
    useContext(CrmContext)
  const [showPassword, setShowPassword] = useState(false)
  const auth = getAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: 'test-user@test.com',
    password: '111111',
  })
  // test funcito
  // useEffect(() => {
  //   window.addEventListener('click', (e) => {
  //     if (!e.target.classList.contains('show-password-button')) {
  //       setShowPassword(false) //
  //       console.log('test success')
  //     }
  //   })
  // }, [])

  const { email, password } = formData
  const onMutate = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('logging in...')

    try {
      const auth = getAuth()
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (userCredentials.user) {
        console.log(userCredentials.user.uid)
        navigate(`/data/${userCredentials.user.uid}`)
      }
    } catch (error) {
      toast.error('Invalid User Credentials')
      console.log(error)
    }
  }

  const handleShowPasswordResetModal = (e) => {
    e.preventDefault()
    if (showPasswordResetModal === false) {
      dispatch({ type: 'SHOW_PASSWORD_RESET_MODAL', payload: true })
    } else {
      dispatch({ type: 'SHOW_PASSWORD_RESET_MODAL', payload: false })
    }

    console.log('click')
  }

  return (
    <div className='agent-login-container'>
      <div className='agent-login-form-header'>
        <h3>Agent Login Form</h3>
      </div>

      <div className='agent-log-in-form-container'>
        <form onSubmit={handleSubmit} action=''>
          <div className='agent-login-form-container'>
            <input
              onChange={onMutate}
              className='agent-login-inputs'
              type='text'
              placeholder='email'
              id='email'
              value={email}
            />
            <div className='sign-in-password-div'>
              <input
                onChange={onMutate}
                className='agent-login-inputs'
                type={showPassword ? 'text' : 'password'}
                placeholder='password'
                id='password'
                value={password}
              />
              <button
                type='button'
                onClick={() => setShowPassword((prevState) => !prevState)}
                className='show-password-button'
              >
                {showPassword ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          <div className='agent-login-button-container'>
            <button className='agent-login-button'>Login</button>
            <button
              onClick={handleShowPasswordResetModal}
              className='agent-login-button forgot-password-login-page'
            >
              {showPasswordResetModal ? 'just log in' : 'forgot password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AgentLogInForm
