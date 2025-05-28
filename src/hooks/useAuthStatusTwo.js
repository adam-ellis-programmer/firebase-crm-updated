import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuthStatusTwo = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [claims, setClaims] = useState(null)

  useEffect(() => {
    const auth = getAuth()

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setLoggedIn(true)
        setLoggedInUser(user)
        user.getIdTokenResult(true).then((data) => {
          // console.log(data.claims)
          setClaims(data.claims)
        })
      } else {
        // User is signed out
        setLoggedIn(false)
        setLoggedInUser(null)
        setClaims(null)
      }
      setCheckingStatus(false)
    })

    // Clean up the subscription when component unmounts
    return () => unsubscribe()
  }, [])

  return { loggedIn, checkingStatus, loggedInUser, claims }
}
