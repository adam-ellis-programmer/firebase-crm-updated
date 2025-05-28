// firebase auth not in use in this project

import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import visibilityIcon from '../icons/svg/visibilityIcon.svg'
import { ReactComponent as ArrowRightIcon } from '../icons/svg/keyboardArrowRightIcon.svg'
import { toast } from 'react-toastify'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

import { setDoc, doc, serverTimestamp } from 'firebase/firestore'

import { db } from '../firebase.config'
import OAuth from '../components/OAuth'

function Signup() {
  // component level state
  const [showPassword, setshowPassword] = useState(false)
  const [formData, setformData] = useState({
    name: '',
    email: '',
    password: '',
  })
  // destructured so can use globaly
  const { name, password, email } = formData
  const agentId = `AG-${name.toUpperCase().slice(0, 4)}-${crypto
    .randomUUID()
    .toUpperCase()
    .slice(0, 4)}`

  const navigate = useNavigate()

  const onChange = (e) => {
    // id has to be the same as what it is called in the formData function above
    // onChange is used globley
    setformData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // id is generated in the credentials when the user first signs up
      const user = userCredential.user
      console.log(user)
      updateProfile(auth.currentUser, {
        displayName: name,
      })

      const formDataCopy = { ...formData }
      delete formDataCopy.password
      formDataCopy.timestamp = serverTimestamp()
      formDataCopy.agentId = agentId
      formDataCopy.agentUID = user.uid
      console.log(formDataCopy)
      // settig the document to the id of the initial id the customer was given at sign up
      await setDoc(doc(db, 'users', user.uid), formDataCopy) // second argument is the actual data

      navigate('/')
    } catch (error) {
      console.log(error)
      toast.error('Somthing went wrong with registration')
    }
  }

  return (
    <>
      <div className="page-container">
        <header>
          <p className="page-header">Welcome back</p>
        </header>

        <main>
          <form className="signup-form" onSubmit={onSubmit}>
            <input
              className="name-input"
              type="text"
              id="name"
              placeholder="Name"
              value={name}
              onChange={onChange}
            />

            <input
              className="email-input"
              type="email"
              id="email"
              placeholder="Emamil"
              value={email}
              onChange={onChange}
            />

            <div className="password-input-div">
              <input
                className="password-input"
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                value={password}
                onChange={onChange}
              />

              <img
                src={visibilityIcon}
                alt="show password"
                onClick={() => setshowPassword((prevState) => !prevState)}
                className="show-password"
              />
            </div>

            <Link className="forgot-password" to="/forgot-password">
              Forgot Password
            </Link>
            {/* redirect in form  */}
            <div className="sign-up-bar">
              <p className="sign-up-text">Sign Up</p>
              <button className="sign-up-button">
                <ArrowRightIcon fill="#fff" width="34px" height="34px" />
              </button>
            </div>
          </form>
          <OAuth />
          <Link to="/sign-in" className="register-link">
            Sign In Insted
          </Link>
        </main>
      </div>
    </>
  )
}

export default Signup
