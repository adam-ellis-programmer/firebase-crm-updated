import { useState, useEffect } from 'react'
import ComponentHeader from './ComponentHeader'
import { useAuthStatusTwo } from '../../hooks/useAuthStatusTwo'

import { getFunctions, httpsCallable } from 'firebase/functions'
import SelectRow from './SelectRow'
import { Link } from 'react-router-dom'

const ChangePermissions = ({ data }) => {
  return (
    <div className="admin-form">
      <ComponentHeader text={`change access permissions`} />
      <div className="admin-btn-container">
        <Link to="/change-access" className="admin-add-agent-btn change-rep-to-btn">
          change
        </Link>
      </div>
    </div>
  )
}

export default ChangePermissions
