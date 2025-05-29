import { useContext, useEffect, useState, useCallback } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import CrmContext from '../crm context/CrmContext'

export const useTestUserCheck = () => {
  const { dispatch } = useContext(CrmContext)
  const [testUser, setTestUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // first get the auth state and check the logged in  user's claims
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in - get their custom claims
        user.getIdTokenResult(true).then((data) => {
          console.log(data)
          setTestUser(data?.claims?.claims?.testUser || false)
          setLoading(false)
        })
      } else {
        // User is signed out
        setTestUser(false)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // 
  const checkTestUser = useCallback(
    (
      customMessage = 'You cannot perform this action as you are a test user'
    ) => {
      if (testUser) {
        dispatch({ type: 'SET_GEN_ALERT', payload: { show: true } })

        // Auto-hide alert after 3 seconds (optional)
        setTimeout(() => {
          dispatch({ type: 'SET_GEN_ALERT', payload: { show: false } })
        }, 3000)

        return true // User is a test user
      }
      return false // User is not a test user
    },
    [testUser, dispatch]
  )

  return {
    isTestUser: testUser,
    checkTestUser,
    loading, // Useful to know if we're still checking auth state
  }
}
