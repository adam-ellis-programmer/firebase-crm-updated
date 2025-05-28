import React from 'react'
import img from '../images/404.jpg'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-div">
        <p>sorry page not found </p>
        <img className='not-found-img' src={img} alt="" srcset="" />
        <Link to="/" className="not-found-btn">
          Back Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
