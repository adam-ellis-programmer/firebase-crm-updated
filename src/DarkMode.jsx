import React, { useEffect, useState } from 'react'

const DarkMode = () => {
  const [darkMode, setDarkMode] = useState(false)
  // Check localStorage on component mount
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode')
    if (darkMode === 'true') {
      setDarkMode(true)
      document.body.classList.add('dark-mode-on')
    } else {
      setDarkMode(false)
    }
  }, [])

  const handleToggle = () => {
    const isDarkMode = document.body.classList.toggle('dark-mode-on')

    if (isDarkMode) {
      setDarkMode(true)
    } else {
      setDarkMode(false)
    }
    // Save to localStorage
    localStorage.setItem('darkMode', isDarkMode)
  }
  // <i class=" dark-mode-icon fa-solid fa-sun"></i>
  return (
    <div className="dark-mode-div">
      <button onClick={handleToggle} className="dark-toggle-btn">
        {darkMode ? (
          <i className="dark-mode-icon fa-solid fa-sun"></i>
        ) : (
          <i className="dark-mode-icon fa-solid fa-moon"></i>
        )}
      </button>
    </div>
  )
}

export default DarkMode
