import { useEffect, useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
import CrmContext from '../crm context/CrmContext'
import DarkMode from '../DarkMode'

// SVG imports
import { ReactComponent as CaretIcon } from '../icons/caret.svg'
import { ReactComponent as AddCustomer } from '../icons/add.svg'
import { ReactComponent as Profile } from '../icons/profile.svg'
import { ReactComponent as Logo } from '../icons/logo.svg'

import image from './logo/Asset.svg'
function Navbar() {
  const auth = getAuth()
  const navigate = useNavigate()
  const { loggedIn, claims } = useAuthStatusTwo()
  const { dispatch } = useContext(CrmContext)
  // console.log(loggedIn)

  // State management
  const [toggleNav, setToggleNav] = useState(false)
  const [toggleLeftNav, setToggleLeftNav] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: '',
    uid: '',
    initials: '',
  })

  // Watch for auth status changes using the hook
  useEffect(() => {
    if (loggedIn && auth.currentUser) {
      // User is logged in, update user info
      const user = auth.currentUser
      const name = user.displayName || ''
      const initials = name
        .split(' ')
        .map((part) => part.slice(0, 1))
        .join('')

      setUserInfo({
        name: name,
        uid: user.uid,
        initials: initials,
      })

      dispatch({ type: 'TOGGLE_SIGN_IN_SIGN_OUT_BUTTON', payload: false })
    } else {
      // User is logged out - clear all user data
      setUserInfo({
        name: '',
        uid: '',
        initials: '',
      })

      // Reset any navigation states
      setToggleNav(false)
      setToggleLeftNav(false)

      dispatch({ type: 'TOGGLE_SIGN_IN_SIGN_OUT_BUTTON', payload: true })
    }
  }, [loggedIn, auth.currentUser, dispatch])

  // Handle clicks outside of dropdown menus
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Main dropdown (toggleNav)
      if (
        toggleNav &&
        !event.target.closest('.dropdown') &&
        !event.target.closest('.nav-caret-container')
      ) {
        setToggleNav(false)
      }

      // Left dropdown (toggleLeftNav)
      if (
        toggleLeftNav &&
        !event.target.closest('.nav-button.nav-drop-wrap') &&
        !event.target.closest('.nav-left')
      ) {
        setToggleLeftNav(false)
      }
    }

    if (toggleNav || toggleLeftNav) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }

    return () => document.removeEventListener('click', handleOutsideClick)
  }, [toggleNav, toggleLeftNav])

  // Sign out handler
  const handleSignOut = () => {
    setToggleNav(false)
    setToggleLeftNav(false)
    navigate('/')
    auth.signOut()
  }

  // Toggle handlers
  const handleMainNavToggle = () => {
    setToggleNav(!toggleNav)
  }

  const handleLeftNavToggle = (e) => {
    e.preventDefault()
    setToggleLeftNav(!toggleLeftNav)
  }

  // Navigation data
  const mainNavItems = [
    { id: 1, text: 'home', url: '/' },
    { id: 2, text: 'my data', url: `/data/${userInfo.uid}` },
    { id: 3, text: 'team data', url: `/all-data/${userInfo.uid}` },
    { id: 4, text: 'stats', url: `/stats/${userInfo.uid}` },
    { id: 5, text: 'dashboard', url: `/dash/${userInfo.uid}` },
    { id: 6, text: 'reports to', url: `/rep-to-info/${userInfo.uid}` },
    { id: 7, text: 'my agents', url: `/view-agents/${userInfo.uid}` },
  ]
  // INSTALL  DYNAMIC HEADERS FOR TAB NAME
  const leftNavItems = [
    { id: 1, text: 'Admin', url: `/admin/${userInfo.uid}` },
    { id: 2, text: 'Profile', url: `/profile/${userInfo.uid}` },
    {
      id: 3,
      text: 'New Customer',
      url: `/new-customer?agentName=${userInfo.name}&agentId=${userInfo.uid}`,
    },
  ]

  // nav and firenase functions

  return (
    <nav className="nav-bar">
      <div className="nav-bar-container">
        <div className="logo-box">
          <Link to="/">
            {/* <Logo className="logo" /> */}
            <img className="logo" src={image} alt="" />
          </Link>
        </div>
        <ul className={`nav-ul ${!loggedIn && 'logged-out-nav'}`}>
          <DarkMode />

          {/* Sign Up Button (only when logged out) */}
          {!loggedIn && (
            <Link to="/sign-up-acc" className="sign-up-btn">
              sign up
            </Link>
          )}

          {/* Sign In/Out Button */}
          <li>
            {loggedIn ? (
              <button
                onClick={handleSignOut}
                className="nav-button nav-button-agent-sign-out"
              >
                sign out
              </button>
            ) : (
              <Link to="/agent-sign-in">
                <button className="nav-button nav-button-agent-sign-in">sign in</button>
              </Link>
            )}
          </li>

          {/* Only show these buttons when logged in */}
          {loggedIn && (
            <>
              {/* User Profile Dropdown */}
              <li className="nav-buttons-li-wrap">
                <div className="testing-nav">
                  <button
                    onClick={handleLeftNavToggle}
                    className="nav-button nav-drop-wrap"
                  >
                    {userInfo.initials}
                  </button>

                  {toggleLeftNav && (
                    <div className="nav-left">
                      <ul className={`left-nav-ul `}>
                        {leftNavItems.map((item) => (
                          <Link key={item.id} to={item.url}>
                            <li className="left-nav-li">{item.text.toUpperCase()}</li>
                          </Link>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>

              {/* Add Customer Button */}
              <li className="nav-buttons-li-wrap">
                <button className="nav-button">
                  <Link
                    to={`/new-customer?agentName=${userInfo.name}&agentId=${userInfo.uid}`}
                  >
                    <AddCustomer fill="#fff" />
                  </Link>
                </button>
              </li>

              {/* Main Navigation Toggle */}
              <li className="nav-buttons-li-wrap">
                <button
                  className="nav-button nav-caret-container"
                  onClick={handleMainNavToggle}
                >
                  <CaretIcon
                    className="caret"
                    style={{
                      transform: toggleNav ? 'rotate(180deg)' : 'none',
                      fill: '#fff',
                    }}
                  />
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Main Dropdown Menu - only show when logged in and toggle is active */}
      {loggedIn && toggleNav && (
        <div className="dropdown">
          <div className="profile-info">
            <Profile style={{ width: '60px', height: '60px' }} />
            <div className="nav-header">
              <span className="nav-name-span">{userInfo.name}</span>
              <span onClick={handleSignOut} className="nav-sign-out">
                sign out
              </span>
            </div>
          </div>
          <ul className="toggle-nav-ul">
            {mainNavItems.map((item) => (
              <Link key={item.id} to={item.url} className="dropdown-text">
                <li className="toggle-nav-list" onClick={() => setToggleNav(false)}>
                  {item.text.toUpperCase()}
                </li>
              </Link>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}

export default Navbar
