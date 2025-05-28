import React from 'react'
import { Link } from 'react-router-dom'

const DocInfo = ({ data }) => {
  const date = data.uploadedAt.toDate()
  const dateString = date.toLocaleDateString()

  const handleDelete = (e) => {
    e.preventDefault()
    console.log('deleting...')
  }

  return (
    <Link to={data.url}>
      <div className="doc-info-grid">
        <img className="doc-info-png" src={data.pdfImg} alt="" />
        <div className="doc-info-div">
          <p className="doc-info-p">
            <span className="doc-info-span">doc name</span>
            <span className="doc-info-span-2">{data.name}</span>{' '}
          </p>
          <p className="doc-info-p">
            <span className="doc-info-span">doc size</span>
            <span className="doc-info-span-2">{data.size}</span>
          </p>
          <p className="doc-info-p">
            <span className="doc-info-span">doc type</span>
            <span className="doc-info-span-2">{data.type}</span>
          </p>
          <p className="doc-info-p">
            <span className="doc-info-span">upload date</span>
            <span className="doc-info-span-2">{dateString}</span>
          </p>
        </div>
        <button onClick={(e) => handleDelete(e)} className="delete-upload-btn">
          <i className="delete-doc-icon fa-solid fa-circle-xmark"></i>
        </button>
      </div>
    </Link>
  )
}

export default DocInfo
