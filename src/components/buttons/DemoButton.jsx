import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { toast } from 'react-toastify'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const DemoButton = ({ home }) => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const homePageStyles =
    'font-bold text-white bg-rose-400 rounded block h-full px-7 transition-colors'
  const agentLoginPage = 'bg-rose-400 text-2xl text-white p-5'

  // Loading styles - grey background with disabled cursor
  const loadingStyles = 'bg-gray-400 cursor-not-allowed opacity-75'

  const handleDemoSignin = async () => {
    console.log('signing in as demo user...')

    try {
      setLoading(true)
      const auth = getAuth()
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        'test-user@test.com',
        '111111'
      )

      if (userCredentials.user) {
        console.log(userCredentials.user.uid)
        navigate(`/data/${userCredentials.user.uid}`)
      }
    } catch (error) {
      toast.error('Invalid User Credentials')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // Determine button classes based on loading state
  const getButtonClasses = () => {
    const baseClasses = home ? homePageStyles : agentLoginPage
    return loading ? `${baseClasses} ${loadingStyles}` : baseClasses
  }

  return (
    <div className='flex items-center justify-center'>
      <button
        onClick={handleDemoSignin}
        disabled={loading}
        type='button'
        className={getButtonClasses()}
      >
        {loading ? (
          <div className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
            Loading...
          </div>
        ) : (
          'Test Drive'
        )}
      </button>
    </div>
  )
}

export default DemoButton
