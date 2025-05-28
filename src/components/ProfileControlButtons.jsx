import { useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CrmContext from '../crm context/CrmContext'

function ProfileControlButtons() {
  const { dispatch, deleteBtn, toggleEmail, changeDetails, submitDetails } =
    useContext(CrmContext)
  // const [check, setCheck] = useState(false)

  const handleDeleteToggle = async (id) => {
    deleteBtn === false
      ? dispatch({ type: 'DELETE_USER_TOGGLE', payload: true })
      : dispatch({ type: 'DELETE_USER_TOGGLE', payload: false })
  }

  // for testing
  // const handleCheck = () => {
  //   setCheck((prevState) => !prevState)
  // }

  const params = useParams()
  const navigate = useNavigate()
  const toggleEmailFunc = () => {
    if (toggleEmail === false) {
      dispatch({ type: 'TOGGLE_EMAIL', payload: true })
    }
  }
  const handleToggleEmail = () => {
    toggleEmailFunc()
  }

  const toggleChangeDetails = () => {
    if (changeDetails === false) {
      dispatch({ type: 'CHANGE_DETAILS', payload: true })
    } else {
      dispatch({ type: 'CHANGE_DETAILS', payload: false })
    }
  }

  const handleChangeDetails = () => {
    toggleChangeDetails()
    if (submitDetails === false) {
      dispatch({ type: 'SUBMIT_UPDATED_NAME', payload: true })
    } else {
      dispatch({ type: 'SUBMIT_UPDATED_NAME', payload: false })
    }
  }

  return (
    <div className="profile-control-container">
      <button
        onClick={() => handleDeleteToggle(params.uid)}
        className="profile-control-btn"
      >
        delete
      </button>
      <button
        onClick={handleChangeDetails}
        className={changeDetails ? 'profile-control-btn-on ' : 'profile-control-btn '}
      >
        {changeDetails ? 'finished' : 'update'}
      </button>
      <button onClick={handleToggleEmail} className="profile-control-btn">
        email
      </button>
    </div>
  )
}

export default ProfileControlButtons
