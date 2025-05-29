import { useEffect } from 'react'
import { useRef } from 'react'

const GlobalAlert = () => {
  const alertRef = useRef()
  useEffect(() => {
    alertRef.current.focus()
    return () => {}
  }, [])
  return (
    <div
      ref={alertRef}
      tabIndex={-1}
      className='bg-red-500 absolute text-[1.3rem]  top-0 z-10 w-full flex items-center text-white p-10'
    >
      <i className='fa-solid fa-circle-exclamation text-3xl'></i>
      <p className='ml-6'>
        You cannot perform this action as you are logged in as a test user{' '}
      </p>
    </div>
  )
}

export default GlobalAlert
